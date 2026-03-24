// Copyright (c) 2026 TAVARA Holdings / Solomon Teknika. All rights reserved.
// Proprietary and confidential.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { corsHeaders } from "../_shared/cors.ts";

const MAX_STACK_TRACE_SIZE = 10 * 1024; // 10KB
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 20;

interface ErrorLogPayload {
  error_type: string;
  message: string;
  stack_trace?: string;
  context?: Record<string, unknown>;
  url?: string;
  user_agent?: string;
  user_id?: string;
}

// Simple in-memory rate limiter (in production, use Redis or similar)
const rateLimitMap = new Map<string, number[]>();

function getRateLimitKey(ip: string): string {
  return `error_logger:${ip}`;
}

function checkRateLimit(ip: string): boolean {
  const key = getRateLimitKey(ip);
  const now = Date.now();
  const timestamps = rateLimitMap.get(key) || [];

  // Clean up old timestamps
  const recentTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);

  if (recentTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  recentTimestamps.push(now);
  rateLimitMap.set(key, recentTimestamps);

  return true;
}

function validatePayload(payload: ErrorLogPayload): string | null {
  if (!payload.message || typeof payload.message !== "string") {
    return "message is required and must be a string";
  }

  if (payload.message.length === 0 || payload.message.length > 5000) {
    return "message must be between 1 and 5000 characters";
  }

  if (!payload.error_type || typeof payload.error_type !== "string") {
    return "error_type is required and must be a string";
  }

  if (payload.error_type.length === 0 || payload.error_type.length > 100) {
    return "error_type must be between 1 and 100 characters";
  }

  if (payload.stack_trace) {
    if (typeof payload.stack_trace !== "string") {
      return "stack_trace must be a string";
    }
    if (payload.stack_trace.length > MAX_STACK_TRACE_SIZE) {
      return `stack_trace exceeds maximum size of ${MAX_STACK_TRACE_SIZE} bytes`;
    }
  }

  if (payload.context && typeof payload.context !== "object") {
    return "context must be an object";
  }

  if (payload.url && typeof payload.url !== "string") {
    return "url must be a string";
  }

  if (payload.user_agent && typeof payload.user_agent !== "string") {
    return "user_agent must be a string";
  }

  if (payload.user_id && typeof payload.user_id !== "string") {
    return "user_id must be a string";
  }

  return null;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    // Get client IP
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Check rate limit
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Maximum 20 requests per minute.",
        }),
        {
          status: 429,
          headers: corsHeaders,
        }
      );
    }

    // Parse request body
    const payload: ErrorLogPayload = await req.json();

    // Validate payload
    const validationError = validatePayload(payload);
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare error log entry
    let userId: string | null = null;
    if (payload.user_id) {
      userId = payload.user_id;
    }

    const errorLogEntry = {
      error_type: payload.error_type,
      message: payload.message,
      stack_trace: payload.stack_trace || null,
      context: payload.context || {},
      url: payload.url || null,
      user_agent: payload.user_agent || null,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    // Insert error log
    const { data, error } = await supabase
      .from("error_logs")
      .insert([errorLogEntry]);

    if (error) {
      console.error("Supabase insert error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to log error",
          details: error.message,
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        logged: true,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Error processing error log:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
