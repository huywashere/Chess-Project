import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  checkRateLimit,
  createRateLimitResponse,
  getClientIp,
  getRateLimitHeaders,
} from "@/lib/rateLimit";

export async function GET(request: Request) {
  try {
    // Rate limit: 60 requests per minute for games query
    const ip = getClientIp(request);
    const limiter = checkRateLimit(`games-get:${ip}`, "API_READ");
    if (!limiter.success) {
      return createRateLimitResponse(
        limiter,
        `Bạn đã truy vấn lịch sử ván cờ quá nhanh. Vui lòng thử lại sau ${limiter.resetInSeconds} giây.`
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    const games = await prisma.game.findMany({
      take: limit,
      orderBy: { playedAt: "desc" },
      include: {
        whitePlayer: {
          select: {
            id: true,
            username: true,
            title: true,
            avatarUrl: true,
            eloRating: true,
          },
        },
        blackPlayer: {
          select: {
            id: true,
            username: true,
            title: true,
            avatarUrl: true,
            eloRating: true,
          },
        },
        analysis: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        count: games.length,
        data: games,
      },
      {
        status: 200,
        headers: getRateLimitHeaders(limiter),
      }
    );
  } catch (error) {
    console.error("Error in GET /api/games:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Rate limit: 15 game saves per minute per IP to prevent spam & DB flood
    const ip = getClientIp(request);
    const limiter = checkRateLimit(`games-post:${ip}`, "GAME_SUBMISSION");
    if (!limiter.success) {
      return createRateLimitResponse(
        limiter,
        `Bạn đang lưu ván cờ quá nhanh. Vui lòng đợi ${limiter.resetInSeconds} giây.`
      );
    }

    const body = await request.json();
    const {
      whitePlayerId,
      blackPlayerId,
      result,
      termination,
      pgn,
      fenFinal,
      timeControl,
      vsAi,
      aiDifficulty,
      whiteRatingBefore,
      blackRatingBefore,
      analysis,
    } = body;

    const game = await prisma.game.create({
      data: {
        whitePlayerId: whitePlayerId || null,
        blackPlayerId: blackPlayerId || null,
        result: result || "ONGOING",
        termination: termination || null,
        pgn: pgn || null,
        fenFinal: fenFinal || null,
        timeControl: timeControl || "10+0",
        isRated: true,
        vsAi: vsAi ?? false,
        aiDifficulty: aiDifficulty || null,
        whiteRatingBefore: whiteRatingBefore || null,
        blackRatingBefore: blackRatingBefore || null,
        endedAt: new Date(),
        ...(analysis
          ? {
              analysis: {
                create: {
                  accuracyWhite: analysis.accuracyWhite ?? null,
                  accuracyBlack: analysis.accuracyBlack ?? null,
                  blundersWhite: analysis.blundersWhite ?? 0,
                  blundersBlack: analysis.blundersBlack ?? 0,
                  mistakesWhite: analysis.mistakesWhite ?? 0,
                  mistakesBlack: analysis.mistakesBlack ?? 0,
                  brilliantWhite: analysis.brilliantWhite ?? 0,
                  brilliantBlack: analysis.brilliantBlack ?? 0,
                  evalGraphJson: analysis.evalGraphJson ?? null,
                },
              },
            }
          : {}),
      },
      include: {
        analysis: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: game,
      },
      {
        status: 201,
        headers: getRateLimitHeaders(limiter),
      }
    );
  } catch (error) {
    console.error("Error in POST /api/games:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create game record" },
      { status: 500 }
    );
  }
}
