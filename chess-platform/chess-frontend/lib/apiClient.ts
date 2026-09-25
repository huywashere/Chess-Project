// Unified API Client for Chess Platform
// Communicates with Spring Boot backend (proxied via /api/spring or direct URL)
// with seamless fallback to internal route handlers if needed.

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/spring";

interface RequestOptions extends RequestInit {
  useSpringBackend?: boolean;
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ data: T | null; error?: string; status: number }> {
  const { useSpringBackend = true, ...fetchOptions } = options;

  // Normalize path
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Primary URL tries Spring Boot proxy
  const primaryUrl = useSpringBackend
    ? `/api/spring${cleanEndpoint}`
    : `/api${cleanEndpoint}`;

  const headers = new Headers(fetchOptions.headers || {});
  if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const res = await fetch(primaryUrl, {
      ...fetchOptions,
      headers,
    });

    if (res.ok) {
      const data = (await res.json()) as T;
      return { data, status: res.status };
    }

    // If 404/502 on spring proxy, try fallback to Next.js internal /api
    if ((res.status === 404 || res.status === 502) && useSpringBackend) {
      try {
        const fallbackRes = await fetch(`/api${cleanEndpoint}`, {
          ...fetchOptions,
          headers,
        });
        if (fallbackRes.ok) {
          const data = (await fallbackRes.json()) as T;
          return { data, status: fallbackRes.status };
        }
      } catch {
        // Fallback failed, return original error
      }
    }

    let errorMessage = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      errorMessage = errJson.message || errJson.error || errorMessage;
    } catch {
      // ignore
    }

    return { data: null, error: errorMessage, status: res.status };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return { data: null, error: message, status: 0 };
  }
}
