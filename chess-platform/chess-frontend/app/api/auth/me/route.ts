import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { AUTH_COOKIE_NAME, verifyAuthToken, toSafeUser } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const payload = await verifyAuthToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      // Clear invalid cookie
      cookieStore.delete(AUTH_COOKIE_NAME);
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user: toSafeUser(user) }, { status: 200 });
  } catch (error) {
    console.error("Auth me check error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
