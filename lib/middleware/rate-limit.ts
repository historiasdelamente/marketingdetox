import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (resets on server restart — good enough for single instance)
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions = { maxRequests: 20, windowMs: 60_000 }
): NextResponse | null {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const key = `${ip}:${req.nextUrl.pathname}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return null;
  }

  entry.count++;

  if (entry.count > options.maxRequests) {
    return NextResponse.json(
      { error: "Too many requests. Intenta de nuevo en un minuto." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((entry.resetAt - now) / 1000)
          ),
        },
      }
    );
  }

  return null;
}

export function requireApiKey(req: NextRequest): NextResponse | null {
  const apiKey = req.headers.get("x-api-key");
  if (process.env.API_KEY && (!apiKey || apiKey !== process.env.API_KEY)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
