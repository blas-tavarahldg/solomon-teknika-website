-- Copyright (c) 2026 TAVARA Holdings / Solomon Teknika. All rights reserved.
-- Proprietary and confidential.

-- Rate Limiting Migration
-- Token bucket algorithm for API rate limiting

CREATE TABLE IF NOT EXISTS rate_limits (
  id BIGSERIAL PRIMARY KEY,
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  tokens INT DEFAULT 60,
  last_refill TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure one rate limit entry per identifier/endpoint pair
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_identifier_endpoint
  ON rate_limits(identifier, endpoint);

-- Fast lookup by identifier
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier
  ON rate_limits(identifier);

-- Token bucket algorithm for rate limiting
-- Returns true if request is allowed, false if rate limited
-- p_max_tokens: maximum tokens in bucket (e.g., 60)
-- p_refill_rate: tokens per minute (e.g., 60 = 1 token per second)
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_max_tokens INT DEFAULT 60,
  p_refill_rate INT DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_tokens INT;
  v_last_refill TIMESTAMPTZ;
  v_time_elapsed INT; -- in seconds
  v_tokens_to_add NUMERIC;
BEGIN
  -- Get or create rate limit entry
  INSERT INTO rate_limits (identifier, endpoint, tokens, last_refill)
  VALUES (p_identifier, p_endpoint, p_max_tokens, now())
  ON CONFLICT (identifier, endpoint) DO UPDATE SET tokens = EXCLUDED.tokens
  RETURNING tokens, last_refill INTO v_current_tokens, v_last_refill;

  -- Calculate time elapsed in seconds
  v_time_elapsed := EXTRACT(EPOCH FROM (now() - v_last_refill))::INT;

  -- Calculate tokens to add based on refill rate (tokens per minute)
  v_tokens_to_add := (v_time_elapsed::NUMERIC / 60) * p_refill_rate;

  -- Refill tokens up to max
  v_current_tokens := LEAST(
    p_max_tokens,
    (v_current_tokens + v_tokens_to_add)::INT
  );

  -- Check if we can consume a token
  IF v_current_tokens > 0 THEN
    -- Consume one token and update
    UPDATE rate_limits
    SET tokens = v_current_tokens - 1,
        last_refill = now()
    WHERE identifier = p_identifier
      AND endpoint = p_endpoint;
    RETURN TRUE;
  ELSE
    -- Update last_refill to current time for accurate calculation next time
    UPDATE rate_limits
    SET last_refill = now()
    WHERE identifier = p_identifier
      AND endpoint = p_endpoint;
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Cleanup function for old rate limit entries
-- Deletes entries not accessed in the last hour
CREATE OR REPLACE FUNCTION clean_old_rate_limits() RETURNS INT AS $$
DECLARE
  v_deleted_count INT;
BEGIN
  DELETE FROM rate_limits
  WHERE last_refill < now() - INTERVAL '1 hour';

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Disable RLS on rate_limits table (internal use only, not user-facing)
ALTER TABLE rate_limits DISABLE ROW LEVEL SECURITY;

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, TEXT, INT, INT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION clean_old_rate_limits() TO service_role;
