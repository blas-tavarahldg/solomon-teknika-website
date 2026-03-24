// Copyright (c) 2026 TAVARA Holdings / Solomon Teknika. All rights reserved.
// Proprietary and confidential.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Fraud signal type definitions with scoring
const FRAUD_SIGNALS = {
  MULTIPLE_ACCOUNTS_SAME_IP: { score: 30, severity: "MEDIUM" },
  RAPID_BOOKING_CANCEL: { score: 40, severity: "HIGH" },
  PAYMENT_CHARGEBACK: { score: 50, severity: "HIGH" },
  IMPOSSIBLE_TRAVEL: { score: 60, severity: "HIGH" },
  NEW_ACCOUNT_HIGH_VALUE: { score: 25, severity: "MEDIUM" },
  SUSPICIOUS_REVIEW_PATTERN: { score: 20, severity: "LOW" },
} as const;

type SignalType = keyof typeof FRAUD_SIGNALS;

interface FraudEvent {
  type: "booking_created" | "booking_cancelled" | "review_posted" | "payment_chargeback";
  userId: string;
  metadata: Record<string, unknown>;
  ip?: string;
  deviceFingerprint?: string;
}

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase configuration");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Log a fraud signal to the database
async function logFraudSignal(
  userId: string,
  signalType: SignalType,
  metadata: Record<string, unknown>,
  ipAddress?: string,
  deviceFingerprint?: string
): Promise<void> {
  const supabase = getSupabaseClient();
  const signalConfig = FRAUD_SIGNALS[signalType];

  if (!signalConfig) {
    console.error(`Unknown signal type: ${signalType}`);
    return;
  }

  const { error } = await supabase.from("fraud_signals").insert({
    user_id: userId,
    signal_type: signalType,
    severity: signalConfig.severity,
    score: signalConfig.score,
    metadata,
    ip_address: ipAddress,
    device_fingerprint: deviceFingerprint,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error(`Failed to log fraud signal: ${signalType}`, error);
  }
}

// Check if user is currently blocked
async function isUserBlocked(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc("is_user_blocked", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error checking user block status:", error);
    return false;
  }

  return data === true;
}

// Get user's current fraud score
async function getUserFraudScore(userId: string): Promise<number> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc("check_fraud_score", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error checking fraud score:", error);
    return 0;
  }

  return data || 0;
}

// Check for multiple accounts from same IP
async function checkMultipleAccountsSameIP(
  userId: string,
  ipAddress: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  // Count other accounts with same IP
  const { count, error } = await supabase
    .from("fraud_signals")
    .select("*", { count: "exact", head: true })
    .eq("signal_type", "MULTIPLE_ACCOUNTS_SAME_IP")
    .eq("ip_address", ipAddress)
    .neq("user_id", userId)
    .gt("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

  if (error) {
    console.error("Error checking multiple accounts:", error);
    return false;
  }

  return (count || 0) >= 2; // Flag if 2+ accounts from same IP in 7 days
}

// Check for rapid booking cancellations
async function checkRapidBookingCancel(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Count cancellations in last hour
  const { count, error } = await supabase
    .from("fraud_signals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("signal_type", "RAPID_BOOKING_CANCEL")
    .gt("created_at", oneHourAgo);

  if (error) {
    console.error("Error checking booking cancellations:", error);
    return false;
  }

  return (count || 0) >= 3; // Flag if 3+ cancellations in 1 hour
}

// Check for impossible travel (location change too fast)
async function checkImpossibleTravel(
  userId: string,
  currentIP: string,
  lastIP?: string
): Promise<boolean> {
  if (!lastIP || lastIP === currentIP) {
    return false;
  }

  const supabase = getSupabaseClient();

  // Get last fraud signal with IP info
  const { data, error } = await supabase
    .from("fraud_signals")
    .select("ip_address, created_at")
    .eq("user_id", userId)
    .not("ip_address", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return false;
  }

  const lastSignalTime = new Date(data.created_at).getTime();
  const currentTime = Date.now();
  const timeDiffMinutes = (currentTime - lastSignalTime) / (60 * 1000);

  // If IP changed within 5 minutes, likely impossible travel
  if (timeDiffMinutes < 5 && data.ip_address !== currentIP) {
    return true;
  }

  return false;
}

// Check for new account with high-value transaction
async function checkNewAccountHighValue(
  userId: string,
  transactionValue: number
): Promise<boolean> {
  const supabase = getSupabaseClient();

  // Get user creation date
  const { data: userData, error: userError } = await supabase
    .from("fraud_signals")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (userError) {
    console.error("Error checking user age:", userError);
    return false;
  }

  const userCreatedTime = new Date(userData?.created_at || Date.now()).getTime();
  const currentTime = Date.now();
  const accountAgeHours = (currentTime - userCreatedTime) / (60 * 60 * 1000);

  // Flag: account < 24 hours old AND transaction > $500
  return accountAgeHours < 24 && transactionValue > 500;
}

// Check for suspicious review pattern
async function checkSuspiciousReviewPattern(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const fiveMinutesAgo = new Date(
    Date.now() - 5 * 60 * 1000
  ).toISOString();

  // Count reviews posted in last 5 minutes
  const { count, error } = await supabase
    .from("fraud_signals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("signal_type", "SUSPICIOUS_REVIEW_PATTERN")
    .gt("created_at", fiveMinutesAgo);

  if (error) {
    console.error("Error checking review pattern:", error);
    return false;
  }

  return (count || 0) >= 5; // Flag if 5+ reviews in 5 minutes
}

// Process fraud event and evaluate rules
async function processFraudEvent(event: FraudEvent): Promise<void> {
  const { type, userId, metadata, ip, deviceFingerprint } = event;

  console.log(`Processing fraud event: ${type} for user: ${userId}`);

  // Check if user is already blocked
  if (await isUserBlocked(userId)) {
    console.log(`User ${userId} is already blocked`);
    return;
  }

  // Route to appropriate fraud checks based on event type
  switch (type) {
    case "booking_created":
      // Check for new account high-value transaction
      const transactionValue = (metadata.amount as number) || 0;
      if (await checkNewAccountHighValue(userId, transactionValue)) {
        await logFraudSignal(
          userId,
          "NEW_ACCOUNT_HIGH_VALUE",
          {
            booking_id: metadata.booking_id,
            amount: transactionValue,
          },
          ip,
          deviceFingerprint
        );
      }

      // Check for multiple accounts same IP
      if (ip && (await checkMultipleAccountsSameIP(userId, ip))) {
        await logFraudSignal(
          userId,
          "MULTIPLE_ACCOUNTS_SAME_IP",
          { ip_address: ip },
          ip,
          deviceFingerprint
        );
      }

      // Check for impossible travel
      if (
        ip &&
        (await checkImpossibleTravel(
          userId,
          ip,
          (metadata.previous_ip as string) || undefined
        ))
      ) {
        await logFraudSignal(
          userId,
          "IMPOSSIBLE_TRAVEL",
          {
            current_ip: ip,
            previous_ip: metadata.previous_ip,
          },
          ip,
          deviceFingerprint
        );
      }
      break;

    case "booking_cancelled":
      if (await checkRapidBookingCancel(userId)) {
        await logFraudSignal(
          userId,
          "RAPID_BOOKING_CANCEL",
          {
            booking_id: metadata.booking_id,
            cancellation_count: metadata.cancellation_count,
          },
          ip,
          deviceFingerprint
        );
      }
      break;

    case "review_posted":
      if (await checkSuspiciousReviewPattern(userId)) {
        await logFraudSignal(
          userId,
          "SUSPICIOUS_REVIEW_PATTERN",
          {
            review_id: metadata.review_id,
            booking_id: metadata.booking_id,
          },
          ip,
          deviceFingerprint
        );
      }
      break;

    case "payment_chargeback":
      // Always log chargebacks as high-severity fraud
      await logFraudSignal(
        userId,
        "PAYMENT_CHARGEBACK",
        {
          transaction_id: metadata.transaction_id,
          amount: metadata.amount,
          chargeback_id: metadata.chargeback_id,
        },
        ip,
        deviceFingerprint
      );
      break;
  }

  // Check if auto-block should be triggered
  const fraudScore = await getUserFraudScore(userId);
  console.log(`User ${userId} fraud score: ${fraudScore}`);

  if (fraudScore >= 100) {
    const supabase = getSupabaseClient();
    await supabase.rpc("auto_block_check", {
      p_user_id: userId,
    });
    console.log(`User ${userId} auto-blocked due to high fraud score`);
  }
}

// Main Deno server handler
Deno.serve(async (req: Request) => {
  try {
    if (req.method === "POST") {
      const event: FraudEvent = await req.json();

      // Validate event
      if (!event.userId || !event.type) {
        return new Response(
          JSON.stringify({
            error: "Invalid event: missing userId or type",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Process the fraud event
      await processFraudEvent(event);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Fraud event processed",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else if (req.method === "GET") {
      // Health check endpoint
      return new Response(
        JSON.stringify({
          status: "healthy",
          service: "fraud-detector",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Fraud detector error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
