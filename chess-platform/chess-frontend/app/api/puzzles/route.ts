import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
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

    return NextResponse.json({
      success: true,
      count: puzzles.length,
      data: puzzles,
    });
  } catch (error) {
    console.error('Error in /api/puzzles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch puzzles' },
      { status: 500 }
    );
  }
}
