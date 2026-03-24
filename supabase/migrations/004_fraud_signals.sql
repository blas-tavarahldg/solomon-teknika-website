-- Copyright (c) 2026 TAVARA Holdings / Solomon Teknika. All rights reserved.
-- Proprietary and confidential.

-- Fraud Detection System Migration
-- Tables and functions for detecting and managing fraudulent user activity

-- Fraud signal type definitions and scoring:
-- MULTIPLE_ACCOUNTS_SAME_IP: User has multiple accounts from same IP (score: 30)
-- RAPID_BOOKING_CANCEL: User cancels bookings frequently in short timeframe (score: 40)
-- PAYMENT_CHARGEBACK: User initiates payment chargeback (score: 50)
-- IMPOSSIBLE_TRAVEL: User's location changes impossibly fast between requests (score: 60)
-- NEW_ACCOUNT_HIGH_VALUE: New account making high-value transactions (score: 25)
-- SUSPICIOUS_REVIEW_PATTERN: Posting many reviews in rapid succession (score: 20)

CREATE TABLE IF NOT EXISTS fraud_signals (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
  score INT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  device_fingerprint TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient fraud detection queries
CREATE INDEX IF NOT EXISTS idx_fraud_signals_user_id
  ON fraud_signals(user_id);

CREATE INDEX IF NOT EXISTS idx_fraud_signals_signal_type
  ON fraud_signals(signal_type);

CREATE INDEX IF NOT EXISTS idx_fraud_signals_severity
  ON fraud_signals(severity);

CREATE INDEX IF NOT EXISTS idx_fraud_signals_created_at
  ON fraud_signals(created_at DESC);

-- Combined index for common fraud dashboard queries
CREATE INDEX IF NOT EXISTS idx_fraud_signals_user_created
  ON fraud_signals(user_id, created_at DESC);

-- Fraud block table for temporarily suspending accounts
CREATE TABLE IF NOT EXISTS fraud_blocks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  blocked_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Index for checking active blocks
CREATE INDEX IF NOT EXISTS idx_fraud_blocks_user_id
  ON fraud_blocks(user_id);

CREATE INDEX IF NOT EXISTS idx_fraud_blocks_expires_at
  ON fraud_blocks(expires_at);

CREATE INDEX IF NOT EXISTS idx_fraud_blocks_active
  ON fraud_blocks(user_id) WHERE expires_at > now();

-- Dashboard view: fraud statistics per user
CREATE OR REPLACE VIEW v_fraud_dashboard AS
SELECT
  u.id as user_id,
  u.email,
  u.created_at as account_created,
  COALESCE(SUM(fs.score), 0) as total_fraud_score,
  COUNT(DISTINCT fs.id) as signal_count,
  MAX(fs.created_at) as latest_signal_time,
  MAX(fs.signal_type) as latest_signal_type,
  CASE
    WHEN COUNT(CASE WHEN fs.severity = 'HIGH' THEN 1 END) > 0 THEN 'HIGH'
    WHEN COUNT(CASE WHEN fs.severity = 'MEDIUM' THEN 1 END) > 0 THEN 'MEDIUM'
    ELSE 'LOW'
  END as max_severity,
  CASE WHEN fb.id IS NOT NULL THEN true ELSE false END as is_blocked,
  fb.expires_at as block_expires_at,
  fb.reason as block_reason
FROM
  auth.users u
  LEFT JOIN fraud_signals fs ON u.id = fs.user_id
  LEFT JOIN fraud_blocks fb ON u.id = fb.user_id AND fb.expires_at > now()
GROUP BY
  u.id, u.email, u.created_at, fb.id, fb.expires_at, fb.reason;

-- Calculate total fraud score for a user
CREATE OR REPLACE FUNCTION check_fraud_score(p_user_id UUID) RETURNS INT AS $$
DECLARE
  v_score INT;
BEGIN
  SELECT COALESCE(SUM(score), 0)
  INTO v_score
  FROM fraud_signals
  WHERE user_id = p_user_id
    AND created_at > now() - INTERVAL '30 days'; -- Only count recent signals

  RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- Auto-block user if fraud score exceeds threshold
CREATE OR REPLACE FUNCTION auto_block_check(p_user_id UUID) RETURNS BOOLEAN AS $$
DECLARE
  v_fraud_score INT;
  v_signal_count INT;
  v_block_reason TEXT;
BEGIN
  -- Get fraud score and signal count
  v_fraud_score := check_fraud_score(p_user_id);

  SELECT COUNT(*)
  INTO v_signal_count
  FROM fraud_signals
  WHERE user_id = p_user_id
    AND created_at > now() - INTERVAL '30 days';

  -- Auto-block if score >= 100
  IF v_fraud_score >= 100 THEN
    v_block_reason := FORMAT(
      'Auto-blocked: Fraud score %s (signals: %s)',
      v_fraud_score,
      v_signal_count
    );

    INSERT INTO fraud_blocks (user_id, reason, expires_at)
    VALUES (p_user_id, v_block_reason, now() + INTERVAL '24 hours')
    ON CONFLICT (user_id) DO UPDATE SET
      reason = EXCLUDED.reason,
      blocked_at = now(),
      expires_at = now() + INTERVAL '24 hours';

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Check if user is currently blocked
CREATE OR REPLACE FUNCTION is_user_blocked(p_user_id UUID) RETURNS BOOLEAN AS $$
DECLARE
  v_is_blocked BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM fraud_blocks
    WHERE user_id = p_user_id
      AND (expires_at IS NULL OR expires_at > now())
  ) INTO v_is_blocked;

  RETURN v_is_blocked;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on fraud tables
ALTER TABLE fraud_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can read fraud signals
CREATE POLICY "fraud_signals_admin_read" ON fraud_signals
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Service role can insert fraud signals (from edge functions)
CREATE POLICY "fraud_signals_service_insert" ON fraud_signals
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for fraud_blocks
CREATE POLICY "fraud_blocks_admin_read" ON fraud_blocks
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

CREATE POLICY "fraud_blocks_service_insert" ON fraud_blocks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "fraud_blocks_service_update" ON fraud_blocks
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Grant function permissions
GRANT EXECUTE ON FUNCTION check_fraud_score(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auto_block_check(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION is_user_blocked(UUID) TO anon, authenticated, service_role;

-- Grant view access
GRANT SELECT ON v_fraud_dashboard TO authenticated, service_role;
