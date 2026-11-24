/**
 * POST /api/v1/payments/webhook
 * Handles Stripe webhook events for payment processing
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/adminClient";
import Stripe from "stripe";
import { getPixraySecrets } from "@/lib/aws/secrets";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Get Stripe secrets
    const secrets = await getPixraySecrets();
    const stripeSecretKey = secrets.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    const webhookSecret = secrets.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !webhookSecret) {
      console.error("[Webhook] Stripe credentials not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    });

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("[Webhook] Signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`[Webhook] Received event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Webhook] Error processing webhook:", error.message);
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient();

  try {
    const userId = session.client_reference_id || session.metadata?.userId;
    const credits = parseInt(session.metadata?.credits || "0");

    if (!userId || !credits) {
      console.error("[Webhook] Missing userId or credits in session metadata");
      return;
    }

    console.log(`[Webhook] Processing checkout completion for user ${userId}, credits: ${credits}`);

    // Update transaction record
    const { error: txError } = await supabase
      .from("payment_transactions")
      .update({
        status: "completed",
        stripe_payment_intent_id: session.payment_intent as string,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_checkout_session_id", session.id);

    if (txError) {
      console.error("[Webhook] Error updating transaction:", txError.message);
      return;
    }

    // Get current user credits
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      console.error("[Webhook] User not found:", userId);
      return;
    }

    // Add credits to user account
    const { error: updateError } = await supabase
      .from("users")
      .update({
        credits: user.credits + credits,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("[Webhook] Error updating user credits:", updateError.message);
      return;
    }

    console.log(`[Webhook] Added ${credits} credits to user ${userId}. New balance: ${user.credits + credits}`);
  } catch (error: any) {
    console.error("[Webhook] Error in handleCheckoutSessionCompleted:", error.message);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Webhook] Payment intent succeeded: ${paymentIntent.id}`);
  // Additional handling if needed
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const supabase = createAdminClient();

  console.log(`[Webhook] Payment intent failed: ${paymentIntent.id}`);

  // Update transaction status to failed
  await supabase
    .from("payment_transactions")
    .update({
      status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_payment_intent_id", paymentIntent.id);
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const supabase = createAdminClient();

  console.log(`[Webhook] Charge refunded: ${charge.id}`);

  // Find transaction by payment intent
  const { data: transaction, error: txError } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("stripe_payment_intent_id", charge.payment_intent as string)
    .single();

  if (txError || !transaction) {
    console.error("[Webhook] Transaction not found for refunded charge");
    return;
  }

  // Update transaction status
  await supabase
    .from("payment_transactions")
    .update({
      status: "refunded",
      updated_at: new Date().toISOString(),
    })
    .eq("id", transaction.id);

  // Deduct credits from user
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("credits")
    .eq("id", transaction.user_id)
    .single();

  if (!userError && user) {
    const newCredits = Math.max(0, user.credits - transaction.credits_purchased);

    await supabase
      .from("users")
      .update({
        credits: newCredits,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.user_id);

    console.log(`[Webhook] Deducted ${transaction.credits_purchased} credits from user ${transaction.user_id} due to refund`);
  }
}
