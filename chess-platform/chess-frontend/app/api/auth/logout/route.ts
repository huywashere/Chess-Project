import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    // Clear session cookie
    cookieStore.delete(AUTH_COOKIE_NAME);

    return NextResponse.json(
      { message: "Đăng xuất thành công" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "Đã đăng xuất" },
      { status: 200 }
    );
  }
}
