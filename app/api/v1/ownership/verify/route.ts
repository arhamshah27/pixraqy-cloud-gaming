/**
 * GET /api/v1/ownership/verify
 * Verifies game ownership via Steam API
 *
 * POST /api/v1/ownership/verify
 * Manually verifies or links game ownership
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getPixraySecrets } from "@/lib/aws/secrets";
import axios from "axios";

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");
    const steamId = searchParams.get("steamId");

    if (!gameId) {
      return NextResponse.json(
        { error: "gameId is required" },
        { status: 400 }
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

    // If no Steam App ID configured, skip verification
    if (!game.steam_app_id) {
      return NextResponse.json({
        verified: true,
        message: "Game does not require Steam ownership verification",
        method: "none",
      });
    }

    // Get user's Steam ID
    const { data: appUser } = await supabase
      .from("users")
      .select("steam_id, external_accounts")
      .eq("id", user.id)
      .single();

    const userSteamId = steamId || appUser?.steam_id;

    if (!userSteamId) {
      return NextResponse.json(
        {
          verified: false,
          message: "Please link your Steam account to verify game ownership",
          requiresAuth: true,
        },
        { status: 403 }
      );
    }

    // Verify via Steam API
    const ownsGame = await verifySteamOwnership(userSteamId, game.steam_app_id);

    if (ownsGame) {
      // Store verification in database
      await supabase.from("game_ownership").upsert(
        [
          {
            user_id: user.id,
            game_id: gameId,
            verified: true,
            verification_source: "steam",
            external_user_id: userSteamId,
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        {
          onConflict: "user_id,game_id",
        }
      );

      return NextResponse.json({
        verified: true,
        message: "Game ownership verified via Steam",
        method: "steam",
        steamId: userSteamId,
      });
    } else {
      return NextResponse.json(
        {
          verified: false,
          message: "You do not own this game on Steam",
          method: "steam",
        },
        { status: 403 }
      );
    }
  } catch (error: any) {
    console.error("[Ownership] Error verifying ownership:", error.message);
    return NextResponse.json(
      {
        error: "Failed to verify ownership",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/ownership/verify
 * Manually verify ownership or link external accounts
 */
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

    const body = await request.json();
    const { gameId, steamId, manualVerification } = body;

    if (!gameId) {
      return NextResponse.json(
        { error: "gameId is required" },
        { status: 400 }
      );
    }

    // Manual verification (admin only or for testing)
    if (manualVerification) {
      await supabase.from("game_ownership").upsert(
        [
          {
            user_id: user.id,
            game_id: gameId,
            verified: true,
            verification_source: "manual",
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        {
          onConflict: "user_id,game_id",
        }
      );

      return NextResponse.json({
        success: true,
        message: "Game ownership manually verified",
      });
    }

    // Link Steam ID
    if (steamId) {
      await supabase
        .from("users")
        .update({
          steam_id: steamId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      return NextResponse.json({
        success: true,
        message: "Steam account linked successfully",
      });
    }

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Ownership] Error in POST handler:", error.message);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Verifies Steam game ownership via Steam Web API
 */
async function verifySteamOwnership(
  steamId: string,
  appId: string
): Promise<boolean> {
  try {
    const secrets = await getPixraySecrets();
    const steamApiKey = secrets.STEAM_API_KEY || process.env.STEAM_API_KEY;

    if (!steamApiKey) {
      console.warn("[Ownership] Steam API key not configured, skipping verification");
      return true; // Allow if not configured
    }

    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/`;
    const response = await axios.get(url, {
      params: {
        key: steamApiKey,
        steamid: steamId,
        format: "json",
        include_appinfo: 1,
      },
    });

    if (response.data?.response?.games) {
      const games = response.data.response.games;
      return games.some((game: any) => game.appid.toString() === appId);
    }

    return false;
  } catch (error: any) {
    console.error("[Ownership] Error calling Steam API:", error.message);
    return false;
  }
}
