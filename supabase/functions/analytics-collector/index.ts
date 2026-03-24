// Copyright (c) 2026 TAVARA Holdings / Solomon Teknika. All rights reserved.
// Proprietary and confidential.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { corsHeaders } from "../_shared/cors.ts";

const MAX_EVENTS_PER_BATCH = 50;
const MAX_EVENT_DATA_SIZE = 10 * 1024; // 10KB
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 100;

interface AnalyticsEvent {
  event_type: string;
  event_data?: Record<string, unknown>;
  session_id?: string;
  device_type?: string;
  referrer?: string;
}

interface RateLimitKey {
  ip: string;
  timestamp: number;
}

// Simple in-memory rate limiter (in production, use Redis or similar)
const rateLimitMap = new Map<string, number[]>();

function getRateLimitKey(ip: string): string {
  return `analytics:${ip}`;
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

function validateEvent(event: AnalyticsEvent): string | null {
  if (!event.event_type || typeof event.event_type !== "string") {
    return "event_type is required and must be a string";
  }

  if (event.event_type.length === 0 || event.event_type.length > 100) {
    return "event_type must be between 1 and 100 characters";
  }

  if (event.event_data) {
    const dataSize = JSON.stringify(event.event_data).length;
    if (dataSize > MAX_EVENT_DATA_SIZE) {
      return `event_data exceeds maximum size of ${MAX_EVENT_DATA_SIZE} bytes`;
    }
  }

  if (event.session_id && typeof event.session_id !== "string") {
    return "session_id must be a string";
  }

  if (event.device_type && typeof event.device_type !== "string") {
    return "device_type must be a string";
  }

  if (event.referrer && typeof event.referrer !== "string") {
    return "referrer must be a string";
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
          error: "Rate limit exceeded. Maximum 100 requests per minute.",
        }),
        {
          status: 429,
          headers: corsHeaders,
        }
      );
    }

    // Parse request body
    const body = await req.json();
    const events: AnalyticsEvent[] = body.events || [];

    // Validate request structure
    if (!Array.isArray(events)) {
      return new Response(
        JSON.stringify({ error: "events must be an array" }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (events.length === 0) {
      return new Response(JSON.stringify({ error: "events array is empty" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (events.length > MAX_EVENTS_PER_BATCH) {
      return new Response(
        JSON.stringify({
          error: `Maximum ${MAX_EVENTS_PER_BATCH} events per batch`,
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Validate each event
    for (let i = 0; i < events.length; i++) {
      const validationError = validateEvent(events[i]);
      if (validationError) {
        return new Response(
          JSON.stringify({
            error: `Event ${i}: ${validationError}`,
          }),
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert events
    const eventsToInsert = events.map((event) => ({
      app_name: "solomon_teknika",
      event_type: event.event_type,
      event_data: event.event_data || {},
      session_id: event.session_id || null,
      device_type: event.device_type || null,
      referrer: event.referrer || null,
      created_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("analytics_events")
      .insert(eventsToInsert);

    if (error) {
      console.error("Supabase insert error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to insert events",
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
        inserted: events.length,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Error processing analytics:", error);
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
