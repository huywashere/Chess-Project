import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { AUTH_COOKIE_NAME, verifyAuthToken, toSafeUser } from "@/lib/auth";
import {
  checkRateLimit,
  createRateLimitResponse,
  getClientIp,
  getRateLimitHeaders,
} from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = checkRateLimit(`auth-me:${ip}`, "SESSION_CHECK");
    if (!limiter.success) {
      return createRateLimitResponse(limiter);
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { user: null },
        { status: 200, headers: getRateLimitHeaders(limiter) }
      );
    }

    const payload = await verifyAuthToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { user: null },
        { status: 200, headers: getRateLimitHeaders(limiter) }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      // Clear invalid cookie
      cookieStore.delete(AUTH_COOKIE_NAME);
      return NextResponse.json(
        { user: null },
        { status: 200, headers: getRateLimitHeaders(limiter) }
      );
    }

    return NextResponse.json(
      { user: toSafeUser(user) },
      { status: 200, headers: getRateLimitHeaders(limiter) }
    );
  } catch (error) {
    console.error("Auth me check error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = checkRateLimit(`auth-update:${ip}`, "USER_UPDATE");
    if (!limiter.success) {
      return createRateLimitResponse(limiter);
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAuthToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { username, avatarUrl, country, title } = body;

    // Validate username if provided
    if (username !== undefined) {
      const trimmedUser = String(username).trim();
      if (trimmedUser.length < 3 || trimmedUser.length > 30) {
        return NextResponse.json(
          { error: "Username must be between 3 and 30 characters" },
          { status: 400 }
        );
      }
      // Check if username taken by another user
      const existing = await prisma.user.findFirst({
        where: {
          username: trimmedUser,
          NOT: { id: payload.userId },
        },
      });
      if (existing) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
      }
    }

    const updateData: {
      username?: string;
      avatarUrl?: string;
      country?: string;
      title?: string;
    } = {};

    if (username !== undefined) updateData.username = String(username).trim();
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (country !== undefined)
      updateData.country = String(country).trim().toUpperCase().slice(0, 5);
    if (title !== undefined) updateData.title = String(title).trim().slice(0, 10);

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: updateData,
    });

    return NextResponse.json(
      { success: true, user: toSafeUser(updatedUser) },
      { status: 200, headers: getRateLimitHeaders(limiter) }
    );
  } catch (error) {
    console.error("Auth update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
