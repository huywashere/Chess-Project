import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import {
  hashPassword,
  signAuthToken,
  toSafeUser,
  getSessionCookieOptions,
  AUTH_COOKIE_NAME,
} from "@/lib/auth";
import { validateRegisterInput } from "@/lib/authValidation";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Protection (Brute-force / spam accounts)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const limiter = rateLimit(`register:${ip}`, { limit: 5, windowSeconds: 60 });
    if (!limiter.success) {
      return NextResponse.json(
        {
          error: `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${limiter.resetInSeconds} giây.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": limiter.resetInSeconds.toString(),
          },
        }
      );
    }

    // 2. Parse & Validate Payload
    const body = await req.json();
    const validation = validateRegisterInput(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Dữ liệu đăng ký không hợp lệ", details: validation.errors },
        { status: 400 }
      );
    }

    const username = body.username.trim();
    const email = body.email.trim().toLowerCase();
    const password = body.password;

    // 3. Check for existing username or email in database
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: "insensitive" } },
          { email: { equals: email, mode: "insensitive" } },
        ],
      },
      select: { username: true, email: true },
    });

    if (existingUser) {
      if (existingUser.username.toLowerCase() === username.toLowerCase()) {
        return NextResponse.json(
          { error: "Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Địa chỉ email này đã được đăng ký tài khoản." },
        { status: 409 }
      );
    }

    // 4. Secure Password Hashing
    const passwordHash = await hashPassword(password);

    // 5. Create User Record in PostgreSQL via Prisma
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        eloRating: 1200,
        ratingRapid: 1200,
        ratingBlitz: 1200,
        ratingBullet: 1200,
        ratingPuzzle: 1500,
        role: "USER",
      },
    });

    // 6. Sign JWT & Set HttpOnly Secure Cookie
    const token = await signAuthToken({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });

    const cookieStore = await cookies();
    const cookieOptions = getSessionCookieOptions(true);
    cookieStore.set(AUTH_COOKIE_NAME, token, cookieOptions);

    const safeUser = toSafeUser(newUser);

    return NextResponse.json(
      {
        message: "Đăng ký tài khoản thành công!",
        user: safeUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống khi đăng ký. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
