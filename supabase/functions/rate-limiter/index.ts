// Copyright (c) 2026 TAVARA Holdings / Solomon Teknika. All rights reserved.
// Proprietary and confidential.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Rate limit configurations per endpoint (requests per minute)
const RATE_LIMITS: Record<string, number> = {
  "auth": 5,        // Login, signup, password reset
  "api": 60,        // General API calls
  "search": 30,     // Search operations
  "booking": 10,    // Booking creation/modification
  "upload": 5,      // File uploads
};

// Extract client IP from request headers
function extractClientIP(req: Request): string {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return xForwardedFor.split(",")[0].trim();
  }

  const xRealIP = req.headers.get("x-real-ip");
  if (xRealIP) {
    return xRealIP;
  }

  // Fallback to remote addr (less reliable behind proxies)
  const cfConnectingIP = req.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return "unknown";
}

// Parse endpoint from request path
function extractEndpoint(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "unknown";

  // Match to rate limit categories
  const firstSegment = parts[0].toLowerCase();

  if (
    firstSegment === "auth" ||
    firstSegment === "login" ||
    firstSegment === "signup"
  ) {
    return "auth";
  } else if (
    firstSegment === "search" ||
    pathname.includes("/search")
  ) {
    return "search";
  } else if (
    firstSegment === "booking" ||
    pathname.includes("/booking")
  ) {
    return "booking";
  } else if (
    firstSegment === "upload" ||
    pathname.includes("/upload")
  ) {
    return "upload";
  }

  return "api";
}

// Main rate limiter handler
Deno.serve(async (req: Request) => {
  try {
    // Extract identifier and endpoint
    const clientIP = extractClientIP(req);
    const pathname = new URL(req.url).pathname;
    const endpoint = extractEndpoint(pathname);
    const maxTokens = RATE_LIMITS[endpoint] || RATE_LIMITS["api"];

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the rate limit check function
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_identifier: clientIP,
      p_endpoint: endpoint,
      p_max_tokens: maxTokens,
      p_refill_rate: maxTokens, // refill_rate = max_tokens per minute
    });

    if (error) {
      console.error("Rate limit check error:", error);
      return new Response(
        JSON.stringify({ error: "Rate limit check failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // If rate limited, return 429
    if (!data) {
      const retryAfterSeconds = Math.ceil(60 / maxTokens); // Time to get one token back
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          endpoint: endpoint,
          maxRequests: maxTokens,
          windowSeconds: 60,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": retryAfterSeconds.toString(),
            "X-RateLimit-Limit": maxTokens.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(
              Date.now() + retryAfterSeconds * 1000
            ).toISOString(),
          },
        }
      );
    }

    // Request is allowed - forward to the actual endpoint
    // In a real implementation, you would proxy to the actual service
    return new Response(
      JSON.stringify({
        success: true,
        message: "Request allowed",
        endpoint: endpoint,
        clientIP: clientIP,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": maxTokens.toString(),
          "X-RateLimit-Remaining": (maxTokens - 1).toString(),
          "X-RateLimit-Reset": new Date(
            Date.now() + 60 * 1000
          ).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error("Rate limiter error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
