/**
 * POST /api/v1/sessions
 * Creates a new gaming session
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createSession } from "@/lib/services/session-broker";

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

    // Parse request body
    const body = await request.json();
    const { gameId, preferredClient, instanceType, enforceSteamOwnership } = body;

    if (!gameId) {
      return NextResponse.json(
        { error: "gameId is required" },
        { status: 400 }
      );
    }

    // Verify game exists
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

    // Create session
    const session = await createSession({
      gameId,
      userId: user.id,
      preferredClient: preferredClient || "moonlight",
      instanceType,
      enforceSteamOwnership: enforceSteamOwnership ?? false,
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error: any) {
    console.error("[API] Error creating session:", error.message);

    // Check for specific error types
    if (error.message.includes("Insufficient credits")) {
      return NextResponse.json(
        {
          error: error.message,
          action: "purchase_credits",
        },
        { status: 402 } // Payment Required
      );
    }

    if (error.message.includes("ownership")) {
      return NextResponse.json(
        {
          error: "Game ownership verification failed. Please verify you own this game.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create session",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/sessions
 * Lists user's sessions
 */
export async function GET(request: NextRequest) {
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

    // Query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    let query = supabase
      .from("gaming_sessions")
      .select("*, games(name, image_url)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      sessions: data || [],
      total: data?.length || 0,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error("[API] Error listing sessions:", error.message);
    return NextResponse.json(
      { error: "Failed to list sessions", details: error.message },
      { status: 500 }
    );
  }
}
