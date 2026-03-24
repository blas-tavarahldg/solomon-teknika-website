-- Copyright (c) 2026 TAVARA Holdings / Solomon Teknika. All rights reserved.
-- Proprietary and confidential.

CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  app_name TEXT DEFAULT 'solomon_teknika',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  device_type TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_rollups (
  id BIGSERIAL PRIMARY KEY,
  app_name TEXT DEFAULT 'solomon_teknika',
  metric_key TEXT NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  period_start TIMESTAMPTZ NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (app_name, metric_key, period_type, period_start)
);

-- Indexes for analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_app_name ON analytics_events(app_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);

-- Indexes for analytics_rollups
CREATE INDEX IF NOT EXISTS idx_analytics_rollups_metric_key ON analytics_rollups(metric_key);
CREATE INDEX IF NOT EXISTS idx_analytics_rollups_period_type ON analytics_rollups(period_type);
CREATE INDEX IF NOT EXISTS idx_analytics_rollups_period_start ON analytics_rollups(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_rollups_app_name ON analytics_rollups(app_name);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_rollups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_events
CREATE POLICY IF NOT EXISTS analytics_events_public_insert ON analytics_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS analytics_events_admin_select ON analytics_events
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- RLS Policies for analytics_rollups
CREATE POLICY IF NOT EXISTS analytics_rollups_admin_all ON analytics_rollups
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Grant permissions
GRANT INSERT ON analytics_events TO authenticated, anon, service_role;
GRANT SELECT ON analytics_events TO authenticated, service_role;
GRANT ALL ON analytics_rollups TO authenticated, service_role;

-- Create rollup_daily_analytics function
CREATE OR REPLACE FUNCTION rollup_daily_analytics(p_app_name TEXT DEFAULT 'solomon_teknika') RETURNS void AS $$
DECLARE
  v_period_start TIMESTAMPTZ;
  v_pageviews_count BIGINT;
  v_unique_sessions BIGINT;
  v_device_breakdown JSONB;
  v_referrer_breakdown JSONB;
  v_event_counts JSONB;
BEGIN
  -- Set period_start to the start of yesterday (daily rollup is typically run overnight)
  v_period_start := DATE_TRUNC('day', CURRENT_TIMESTAMP - INTERVAL '1 day');

  -- Get pageview count
  SELECT COUNT(*) INTO v_pageviews_count
  FROM analytics_events
  WHERE app_name = p_app_name
    AND event_type = 'pageview'
    AND created_at >= v_period_start
    AND created_at < v_period_start + INTERVAL '1 day';

  -- Get unique sessions
  SELECT COUNT(DISTINCT session_id) INTO v_unique_sessions
  FROM analytics_events
  WHERE app_name = p_app_name
    AND session_id IS NOT NULL
    AND created_at >= v_period_start
    AND created_at < v_period_start + INTERVAL '1 day';

  -- Get device breakdown
  SELECT JSONB_OBJECT_AGG(
    COALESCE(device_type, 'unknown'),
    COUNT(*)
  ) INTO v_device_breakdown
  FROM analytics_events
  WHERE app_name = p_app_name
    AND created_at >= v_period_start
    AND created_at < v_period_start + INTERVAL '1 day'
  GROUP BY device_type;

  -- Get referrer breakdown
  SELECT JSONB_OBJECT_AGG(
    COALESCE(referrer, 'direct'),
    COUNT(*)
  ) INTO v_referrer_breakdown
  FROM analytics_events
  WHERE app_name = p_app_name
    AND created_at >= v_period_start
    AND created_at < v_period_start + INTERVAL '1 day'
  GROUP BY referrer;

  -- Get event type counts
  SELECT JSONB_OBJECT_AGG(
    event_type,
    COUNT(*)
  ) INTO v_event_counts
  FROM analytics_events
  WHERE app_name = p_app_name
    AND created_at >= v_period_start
    AND created_at < v_period_start + INTERVAL '1 day'
  GROUP BY event_type;

  -- Insert or update pageviews metric
  INSERT INTO analytics_rollups (
    app_name,
    metric_key,
    period_type,
    period_start,
    value,
    metadata
  ) VALUES (
    p_app_name,
    'pageviews',
    'daily',
    v_period_start,
    COALESCE(v_pageviews_count, 0),
    '{}'
  )
  ON CONFLICT (app_name, metric_key, period_type, period_start)
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();

  -- Insert or update unique_sessions metric
  INSERT INTO analytics_rollups (
    app_name,
    metric_key,
    period_type,
    period_start,
    value,
    metadata
  ) VALUES (
    p_app_name,
    'unique_sessions',
    'daily',
    v_period_start,
    COALESCE(v_unique_sessions, 0),
    '{}'
  )
  ON CONFLICT (app_name, metric_key, period_type, period_start)
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();

  -- Insert or update device_breakdown metric
  INSERT INTO analytics_rollups (
    app_name,
    metric_key,
    period_type,
    period_start,
    value,
    metadata
  ) VALUES (
    p_app_name,
    'device_breakdown',
    'daily',
    v_period_start,
    1,
    COALESCE(v_device_breakdown, '{}')
  )
  ON CONFLICT (app_name, metric_key, period_type, period_start)
  DO UPDATE SET metadata = EXCLUDED.metadata, updated_at = now();

  -- Insert or update referrer_breakdown metric
  INSERT INTO analytics_rollups (
    app_name,
    metric_key,
    period_type,
    period_start,
    value,
    metadata
  ) VALUES (
    p_app_name,
    'referrer_breakdown',
    'daily',
    v_period_start,
    1,
    COALESCE(v_referrer_breakdown, '{}')
  )
  ON CONFLICT (app_name, metric_key, period_type, period_start)
  DO UPDATE SET metadata = EXCLUDED.metadata, updated_at = now();

  -- Insert or update event_counts metric
  INSERT INTO analytics_rollups (
    app_name,
    metric_key,
    period_type,
    period_start,
    value,
    metadata
  ) VALUES (
    p_app_name,
    'event_counts',
    'daily',
    v_period_start,
    1,
    COALESCE(v_event_counts, '{}')
  )
  ON CONFLICT (app_name, metric_key, period_type, period_start)
  DO UPDATE SET metadata = EXCLUDED.metadata, updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION rollup_daily_analytics TO service_role;
