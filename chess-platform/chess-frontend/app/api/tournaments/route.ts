import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'LIVE' | 'UPCOMING' | 'COMPLETED'

    const whereClause: Record<string, unknown> = {};
    if (status && ['LIVE', 'UPCOMING', 'COMPLETED', 'CANCELLED'].includes(status.toUpperCase())) {
      whereClause.status = status.toUpperCase();
    }

    const tournaments = await prisma.tournament.findMany({
      where: whereClause,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                title: true,
                avatarUrl: true,
                eloRating: true,
              },
            },
          },
          orderBy: { score: 'desc' },
          take: 10,
        },
      },
      orderBy: { startsAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      count: tournaments.length,
      data: tournaments,
    });
  } catch (error) {
    console.error('Error in /api/tournaments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tournaments' },
      { status: 500 }
    );
  }
}
