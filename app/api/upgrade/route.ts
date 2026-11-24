import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { email, price } = await request.json();

    console.log("Received checkout request for:", email, "with price:", price);

    if (!email || !price) {
      return NextResponse.json(
        { error: "Email and price are required" },
        { status: 400 }
      );
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, credits")
      .eq("email", email)
      .single();

    if (userError || !user) {
      console.error("User not found:", userError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate credits based on price
    let creditsToAdd = 0;
    if (price === 20) creditsToAdd = 20;
    else if (price === 50) creditsToAdd = 80;
    else {
      return NextResponse.json(
        { error: "Invalid price provided" },
        { status: 400 }
      );
    }

    // Update user credits
    const { error: updateError } = await supabase
      .from("users")
      .update({
        credits: user.credits + creditsToAdd,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating credits:", updateError);
      return NextResponse.json(
        { error: "Failed to update credits" },
        { status: 500 }
      );
    }

    console.log(`Successfully added ${creditsToAdd} credits to user ${email}`);

    return NextResponse.json({
      success: true,
      message: `Credits updated. Added ${creditsToAdd} credits.`,
      creditsAdded: creditsToAdd,
      newBalance: user.credits + creditsToAdd,
    });
  } catch (error) {
    console.error("Error in checkout process:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}