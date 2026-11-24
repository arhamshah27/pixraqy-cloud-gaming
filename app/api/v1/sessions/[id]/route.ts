/**
 * GET /api/v1/sessions/:id
 * Gets session details
 *
 * DELETE /api/v1/sessions/:id
 * Terminates a session
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getSession, updateSessionStatus } from "@/lib/services/session-broker";
import { terminateInstance } from "@/lib/aws/ec2";
import { logSessionEvent, recordSessionEnded } from "@/lib/aws/cloudwatch";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const sessionId = params.id;

    // Get session
    const session = await getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (session.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get game details
    const { data: game } = await supabase
      .from("games")
      .select("*")
      .eq("id", session.game_id)
      .single();

    // Get host details if available
    let hostInfo = null;
    if (session.instance_id) {
      const { data: host } = await supabase
        .from("host_pool")
        .select("*")
        .eq("instance_id", session.instance_id)
        .single();

      hostInfo = host;
    }

    return NextResponse.json({
      session,
      game,
      host: hostInfo,
    });
  } catch (error: any) {
    console.error("[API] Error getting session:", error.message);
    return NextResponse.json(
      { error: "Failed to get session", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const sessionId = params.id;

    // Get session
    const session = await getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (session.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Terminate instance if exists
    if (session.instance_id) {
      await terminateInstance(session.instance_id);
    }

    // Update session status
    await updateSessionStatus(sessionId, "stopped");

    // Calculate duration and credits consumed
    const startTime = new Date(session.launched_at || session.created_at);
    const endTime = new Date();
    const durationMinutes = Math.ceil(
      (endTime.getTime() - startTime.getTime()) / 60000
    );

    // Calculate credits consumed
    const creditsPerMinute = session.hourly_rate / 60;
    const creditsConsumed = Math.ceil(durationMinutes * creditsPerMinute);

    // Update session with final billing
    await supabase
      .from("gaming_sessions")
      .update({
        credits_consumed: creditsConsumed,
        ended_at: endTime.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    // Refund any unused reserved credits
    const creditsToRefund = Math.max(0, session.credits_reserved - creditsConsumed);
    if (creditsToRefund > 0) {
      const { data: userData } = await supabase
        .from("users")
        .select("credits")
        .eq("id", user.id)
        .single();

      if (userData) {
        await supabase
          .from("users")
          .update({
            credits: userData.credits + creditsToRefund,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }
    }

    // Log event
    await logSessionEvent(
      sessionId,
      "session_stopped",
      `Session stopped by user. Duration: ${durationMinutes} min, Credits: ${creditsConsumed}`
    );

    // Record metrics
    await recordSessionEnded(sessionId, user.id, durationMinutes);

    return NextResponse.json({
      message: "Session terminated successfully",
      sessionId,
      durationMinutes,
      creditsConsumed,
      creditsRefunded: creditsToRefund,
    });
  } catch (error: any) {
    console.error("[API] Error terminating session:", error.message);
    return NextResponse.json(
      { error: "Failed to terminate session", details: error.message },
      { status: 500 }
    );
  }
}
