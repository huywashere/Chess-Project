/**
 * Spring Boot Backend API Client
 * Connects the Next.js frontend to the primary Spring Boot REST & WebSocket service
 * running on port 8080 (or Nginx /api/).
 */

const SPRING_BACKEND_URL =
  process.env.NEXT_PUBLIC_SPRING_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export interface SpringUser {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  eloRating: number;
  provider: string;
  isActive: boolean;
  createdAt: string;
}

export interface SpringAuthResponse {
  token: string;
  refreshToken?: string;
  user: SpringUser;
  message?: string;
}

export interface SpringLeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  avatarUrl?: string;
  eloRating: number;
  title?: string;
}

export interface SpringGameRecord {
  id: string;
  whitePlayer?: { id: string; username: string; eloRating: number; avatarUrl?: string };
  blackPlayer?: { id: string; username: string; eloRating: number; avatarUrl?: string };
  result: string;
  termination?: string;
  pgn?: string;
  fenFinal?: string;
  timeControl: string;
  isRated: boolean;
  vsAi: boolean;
  aiDifficulty?: string;
  playedAt: string;
  endedAt?: string;
}

/**
 * Check if Spring Boot backend is online and healthy
 */
export async function checkSpringBootHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${SPRING_BACKEND_URL}/actuator/health`, {
      method: "GET",
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Login via Spring Boot /api/auth/login
 */
export async function springLogin(
  identifier: string,
  password: string
): Promise<{ success: boolean; data?: SpringAuthResponse; error?: string }> {
  try {
    const res = await fetch(`${SPRING_BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Login failed" };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: "Cannot connect to Spring Boot backend" };
  }
}

/**
 * Register via Spring Boot /api/auth/register
 */
export async function springRegister(
  username: string,
  email: string,
  password: string
): Promise<{ success: boolean; data?: SpringAuthResponse; error?: string }> {
  try {
    const res = await fetch(`${SPRING_BACKEND_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Registration failed" };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: "Cannot connect to Spring Boot backend" };
  }
}

/**
 * Fetch current user profile via Spring Boot /api/auth/me
 */
export async function springGetMe(token: string): Promise<SpringUser | null> {
  try {
    const res = await fetch(`${SPRING_BACKEND_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

/**
 * Fetch leaderboard from Spring Boot /api/leaderboard
 */
export async function springGetLeaderboard(): Promise<SpringLeaderboardEntry[]> {
  try {
    const res = await fetch(`${SPRING_BACKEND_URL}/api/leaderboard`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

/**
 * Fetch games from Spring Boot /api/games
 */
export async function springGetGames(limit = 20): Promise<SpringGameRecord[]> {
  try {
    const res = await fetch(`${SPRING_BACKEND_URL}/api/games?limit=${limit}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

/**
 * Record completed game in Spring Boot /api/games
 */
export async function springRecordGame(gameData: {
  whitePlayerId?: string;
  blackPlayerId?: string;
  result: string;
  termination?: string;
  pgn?: string;
  fenFinal?: string;
  timeControl?: string;
  isRated?: boolean;
  vsAi?: boolean;
  aiDifficulty?: string;
}): Promise<SpringGameRecord | null> {
  try {
    const res = await fetch(`${SPRING_BACKEND_URL}/api/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gameData),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}
