import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  checkRateLimit,
  createRateLimitResponse,
  getClientIp,
  getRateLimitHeaders,
} from '@/lib/rateLimit';

export async function GET(request: Request) {
  try {
    // Rate limit: 60 requests per minute
    const ip = getClientIp(request);
    const limiter = checkRateLimit(`puzzles:${ip}`, 'API_READ');
    if (!limiter.success) {
      return createRateLimitResponse(
        limiter,
        `Bạn đã truy vấn câu đố quá nhanh. Vui lòng thử lại sau ${limiter.resetInSeconds} giây.`
      );
    }

    const { searchParams } = new URL(request.url);
    const theme = searchParams.get('theme');
    const minRating = parseInt(searchParams.get('minRating') || '0', 10);
    const maxRating = parseInt(searchParams.get('maxRating') || '4000', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

    const whereClause: Record<string, unknown> = {
      rating: {
        gte: minRating,
        lte: maxRating,
      },
    };

    if (theme) {
      whereClause.theme = {
        contains: theme,
        mode: 'insensitive',
      };
    }

    const puzzles = await prisma.puzzle.findMany({
      where: whereClause,
      orderBy: { rating: 'asc' },
      take: limit,
    });

    return NextResponse.json(
      {
        success: true,
        count: puzzles.length,
        data: puzzles,
      },
      {
        status: 200,
        headers: getRateLimitHeaders(limiter),
      }
    );
  } catch (error) {
    console.error('Error in /api/puzzles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch puzzles' },
      { status: 500 }
    );
  }
}
