import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { User, UserRole } from "@prisma/client";

export const AUTH_COOKIE_NAME = "chess_session";
const JWT_SECRET =
  process.env.JWT_SECRET || "chess_master_jwt_secret_dev_32_characters_random_key_2026";
const key = new TextEncoder().encode(JWT_SECRET);

export interface AuthTokenPayload {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  [key: string]: unknown;
}

export interface SafeUser {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  eloRating: number;
  ratingRapid: number;
  ratingBlitz: number;
  ratingBullet: number;
  ratingPuzzle: number;
  role: UserRole;
  title: string | null;
  country: string | null;
  createdAt: string;
}

/**
 * Hash a plain password using bcrypt (10 rounds)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain password against stored bcrypt hash with timing protection
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign a secure JWT with HS256 algorithm and 7-day expiration
 */
export async function signAuthToken(payload: AuthTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

/**
 * Verify and decode an incoming JWT token
 */
export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as AuthTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Sanitize User database object to remove sensitive data before sending to client
 */
export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    eloRating: user.eloRating,
    ratingRapid: user.ratingRapid,
    ratingBlitz: user.ratingBlitz,
    ratingBullet: user.ratingBullet,
    ratingPuzzle: user.ratingPuzzle,
    role: user.role,
    title: user.title,
    country: user.country,
    createdAt: user.createdAt.toISOString(),
  };
}

/**
 * Get standard secure cookie options for session management
 */
export function getSessionCookieOptions(rememberMe: boolean = true) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: rememberMe ? 60 * 60 * 24 * 7 : undefined, // 7 days or browser session
  };
}
