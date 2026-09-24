import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'blitz';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    let orderByField = 'ratingBlitz';
    if (category === 'rapid') orderByField = 'ratingRapid';
    else if (category === 'bullet') orderByField = 'ratingBullet';
    else if (category === 'puzzle') orderByField = 'ratingPuzzle';
    else if (category === 'overall') orderByField = 'eloRating';

    const users = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { [orderByField]: 'desc' },
      take: limit,
      select: {
        id: true,
        username: true,
        title: true,
        country: true,
        avatarUrl: true,
        eloRating: true,
        ratingRapid: true,
        ratingBlitz: true,
        ratingBullet: true,
        ratingPuzzle: true,
        role: true,
        createdAt: true,
      },
    });

    const rankedUsers = users.map((u, idx) => ({
      rank: idx + 1,
      ...u,
      displayElo:
        category === 'rapid'
          ? u.ratingRapid
          : category === 'bullet'
          ? u.ratingBullet
          : category === 'puzzle'
          ? u.ratingPuzzle
          : u.ratingBlitz,
    }));

    return NextResponse.json({
      success: true,
      category,
      total: rankedUsers.length,
      data: rankedUsers,
    });
  } catch (error) {
    console.error('Error in /api/leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard from database' },
      { status: 500 }
    );
  }
}
