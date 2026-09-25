import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import {
  verifyPassword,
  signAuthToken,
  toSafeUser,
  getSessionCookieOptions,
  AUTH_COOKIE_NAME,
} from "@/lib/auth";
import { validateLoginInput } from "@/lib/authValidation";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (Defense against Brute-Force & Credential Stuffing)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const limiter = rateLimit(`login:${ip}`, { limit: 5, windowSeconds: 60 });
    if (!limiter.success) {
      return NextResponse.json(
        {
          error: `Bạn đã thử đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ${limiter.resetInSeconds} giây.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": limiter.resetInSeconds.toString(),
          },
        }
      );
    }

    // 2. Validate Inputs
    const body = await req.json();
    const validation = validateLoginInput(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin", details: validation.errors },
        { status: 400 }
      );
    }

    const identifier = body.identifier.trim();
    const password = body.password;
    const rememberMe = body.rememberMe !== false;

    // 3. Find User by Username or Email (Case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: identifier, mode: "insensitive" } },
          { email: { equals: identifier, mode: "insensitive" } },
        ],
      },
    });

    // 4. Verify Credentials
    if (!user || !user.passwordHash) {
      // Timing safe dummy comparison if user not found to prevent timing attacks
      await verifyPassword("dummy_password_timing_defense", "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy");
      return NextResponse.json(
        { error: "Tên đăng nhập hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Tên đăng nhập hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    // Check account status
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Tài khoản của bạn đã bị vô hiệu hóa hoặc tạm khóa. Vui lòng liên hệ hỗ trợ." },
        { status: 403 }
      );
    }

    // 5. Update user timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: {
        updatedAt: new Date(),
      },
    });

    // 6. Sign JWT Session Token & Set HttpOnly Cookie
    const token = await signAuthToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();
    const cookieOptions = getSessionCookieOptions(rememberMe);
    cookieStore.set(AUTH_COOKIE_NAME, token, cookieOptions);

    const safeUser = toSafeUser(user);

    return NextResponse.json(
      {
        message: "Đăng nhập thành công!",
        user: safeUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
