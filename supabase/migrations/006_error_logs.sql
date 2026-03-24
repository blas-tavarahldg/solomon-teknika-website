-- Copyright (c) 2026 TAVARA Holdings / Solomon Teknika. All rights reserved.
-- Proprietary and confidential.

CREATE TABLE IF NOT EXISTS error_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  stack_trace TEXT,
  context JSONB DEFAULT '{}',
  url TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS error_logs_admin_read ON error_logs
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

CREATE POLICY IF NOT EXISTS error_logs_service_insert ON error_logs
  FOR INSERT
  WITH CHECK (true);

GRANT SELECT ON error_logs TO authenticated, service_role;

-- Create log_error function
CREATE OR REPLACE FUNCTION log_error(
  p_error_type TEXT,
  p_message TEXT,
  p_stack_trace TEXT DEFAULT NULL,
  p_context JSONB DEFAULT '{}',
  p_url TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
  v_log_id BIGINT;
BEGIN
  INSERT INTO error_logs (
    error_type,
    message,
    stack_trace,
    context,
    url,
    user_agent,
    user_id,
    created_at
  ) VALUES (
    p_error_type,
    p_message,
    p_stack_trace,
    COALESCE(p_context, '{}'),
    p_url,
    p_user_agent,
    p_user_id,
    now()
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION log_error TO authenticated, service_role;
