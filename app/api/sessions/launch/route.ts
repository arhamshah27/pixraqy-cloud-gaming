import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { launchGamingInstance } from "@/lib/aws/ec2";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the game ID from the request body
    const { gameId } = await request.json();

    if (!gameId) {
      return NextResponse.json(
        { error: "Game ID is required" },
        { status: 400 }
      );
    }

    // Get user from database
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

    // Get game details
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (gameError || !game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    // Check if user has enough credits
    if (appUser.credits < game.minimum_credits) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 400 }
      );
    }

    // Create a new gaming session in the database
    const { data: session, error: sessionError } = await supabase
      .from("gaming_sessions")
      .insert({
        user_id: user.id,
        game_id: gameId,
        status: "pending",
        credits_reserved: game.minimum_credits,
      })
      .select()
      .single();

    if (sessionError || !session) {
      console.error("Error creating session:", sessionError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    console.log(`[API] Created session ${session.id} for user ${user.id}`);

    // Update session status to launching
    await supabase
      .from("gaming_sessions")
      .update({ status: "launching" })
      .eq("id", session.id);

    // Launch the EC2 instance
    try {
      const instanceInfo = await launchGamingInstance(session.id, user.id, {
        amiId: process.env.WINDOWS_AMI_ID,
        instanceType: process.env.EC2_INSTANCE_TYPE,
        subnetId: process.env.EC2_SUBNET_ID,
        securityGroupIds: process.env.EC2_SECURITY_GROUP_ID
          ? [process.env.EC2_SECURITY_GROUP_ID]
          : undefined,
        keyName: process.env.EC2_KEY_NAME,
        tags: {
          GameId: gameId,
          GameName: game.name,
        },
      });

      console.log(`[API] Launched instance ${instanceInfo.instanceId} for session ${session.id}`);

      // Update session with instance information
      const { data: updatedSession, error: updateError } = await supabase
        .from("gaming_sessions")
        .update({
          instance_id: instanceInfo.instanceId,
          public_ip: instanceInfo.publicIp,
          private_ip: instanceInfo.privateIp,
          status: "running",
          launched_at: new Date().toISOString(),
        })
        .eq("id", session.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating session:", updateError);
        return NextResponse.json(
          { error: "Failed to update session" },
          { status: 500 }
        );
      }

      // Deduct credits from user
      await supabase
        .from("users")
        .update({
          credits: appUser.credits - game.minimum_credits,
        })
        .eq("id", user.id);

      return NextResponse.json({
        success: true,
        session: updatedSession,
        instance: instanceInfo,
      });
    } catch (ec2Error: any) {
      console.error("Error launching EC2 instance:", ec2Error);

      // Update session to failed
      await supabase
        .from("gaming_sessions")
        .update({
          status: "failed",
          error_message: ec2Error.message,
        })
        .eq("id", session.id);

      return NextResponse.json(
        { error: `Failed to launch instance: ${ec2Error.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in launch API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
