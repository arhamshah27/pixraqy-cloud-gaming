import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { terminateInstance } from "@/lib/aws/ec2";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get session ID from request body
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get the session and verify ownership
    const { data: session, error: sessionError } = await supabase
      .from("gaming_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if instance exists
    if (!session.instance_id) {
      return NextResponse.json(
        { error: "No instance associated with this session" },
        { status: 400 }
      );
    }

    // Terminate the EC2 instance
    try {
      const terminated = await terminateInstance(session.instance_id);

      if (!terminated) {
        throw new Error("Failed to terminate instance");
      }

      // Update session status in database
      const { error: updateError } = await supabase
        .from("gaming_sessions")
        .update({
          status: "stopped",
          ended_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (updateError) {
        console.error("Error updating session status:", updateError);
      }

      return NextResponse.json({
        success: true,
        message: "Instance termination initiated",
      });
    } catch (ec2Error: any) {
      console.error("Error terminating EC2 instance:", ec2Error);
      return NextResponse.json(
        { error: `Failed to terminate instance: ${ec2Error.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in terminate API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
