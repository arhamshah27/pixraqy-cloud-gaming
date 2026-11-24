/**
 * POST /api/v1/payments/create-checkout-session
 * Creates a Stripe Checkout session for purchasing credits
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import Stripe from "stripe";
import { getPixraySecrets } from "@/lib/aws/secrets";

// Credit packages
const CREDIT_PACKAGES = [
  { credits: 20, price: 2000, name: "20 Credits" }, // $20
  { credits: 50, price: 4500, name: "50 Credits" }, // $45 (10% discount)
  { credits: 100, price: 8000, name: "100 Credits" }, // $80 (20% discount)
  { credits: 200, price: 14000, name: "200 Credits" }, // $140 (30% discount)
];

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user details
    const { data: appUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (userError || !appUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { packageIndex } = body;

    if (packageIndex === undefined || packageIndex < 0 || packageIndex >= CREDIT_PACKAGES.length) {
      return NextResponse.json(
        { error: "Invalid package selected" },
        { status: 400 }
      );
    }

    const selectedPackage = CREDIT_PACKAGES[packageIndex];

    // Get Stripe secret key
    const secrets = await getPixraySecrets();
    const stripeSecretKey = secrets.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      console.error("[Payments] Stripe secret key not configured");
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    });

    // Create Stripe Checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: appUser.email,
      client_reference_id: user.id,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: selectedPackage.name,
              description: `${selectedPackage.credits} gaming credits for Pixray Cloud`,
              images: [`${appUrl}/images/credits-logo.png`],
            },
            unit_amount: selectedPackage.price, // Amount in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        credits: selectedPackage.credits.toString(),
        packageIndex: packageIndex.toString(),
      },
      success_url: `${appUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard?payment=cancelled`,
    });

    // Create transaction record
    await supabase.from("payment_transactions").insert([
      {
        user_id: user.id,
        stripe_checkout_session_id: checkoutSession.id,
        amount_usd: selectedPackage.price / 100,
        credits_purchased: selectedPackage.credits,
        status: "pending",
        product_type: "one-time",
        metadata: {
          packageIndex,
          packageName: selectedPackage.name,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    console.log(`[Payments] Created checkout session for user ${user.id}: ${checkoutSession.id}`);

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error: any) {
    console.error("[Payments] Error creating checkout session:", error.message);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/payments/create-checkout-session
 * Returns available credit packages
 */
export async function GET() {
  return NextResponse.json({
    packages: CREDIT_PACKAGES.map((pkg, index) => ({
      index,
      ...pkg,
      priceUsd: pkg.price / 100,
    })),
  });
}
