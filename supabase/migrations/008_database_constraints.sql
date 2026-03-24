-- Copyright (c) 2026 TAVARA Holdings / Solomon Teknika. All rights reserved.
-- Proprietary and confidential.

-- Rate Limits Table Constraints
ALTER TABLE rate_limits ADD CONSTRAINT rate_limits_identifier_not_null CHECK (identifier IS NOT NULL);
ALTER TABLE rate_limits ADD CONSTRAINT rate_limits_endpoint_not_null CHECK (endpoint IS NOT NULL);
ALTER TABLE rate_limits ADD CONSTRAINT rate_limits_tokens_non_negative CHECK (tokens >= 0);

-- Fraud Signals Table Constraints
ALTER TABLE fraud_signals ADD CONSTRAINT fraud_signals_signal_type_not_null CHECK (signal_type IS NOT NULL);
ALTER TABLE fraud_signals ADD CONSTRAINT fraud_signals_severity_not_null CHECK (severity IS NOT NULL);
ALTER TABLE fraud_signals ADD CONSTRAINT fraud_signals_score_not_null CHECK (score IS NOT NULL);
ALTER TABLE fraud_signals ADD CONSTRAINT fraud_signals_score_range CHECK (score >= 0 AND score <= 100);
ALTER TABLE fraud_signals ADD CONSTRAINT fraud_signals_valid_types CHECK (
  signal_type IN (
    'velocity_check',
    'ip_reputation',
    'device_fingerprint',
    'behavioral_analysis',
    'geolocation_mismatch',
    'authentication_anomaly'
  )
);

-- Fraud Blocks Table Constraints
ALTER TABLE fraud_blocks ADD CONSTRAINT fraud_blocks_reason_not_null CHECK (reason IS NOT NULL);
ALTER TABLE fraud_blocks ADD CONSTRAINT fraud_blocks_expires_after_blocked CHECK (
  expires_at IS NULL OR blocked_at IS NULL OR expires_at > blocked_at
);

-- Audit Logs Table Constraints
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_action_not_null CHECK (action IS NOT NULL);
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_action_length CHECK (LENGTH(action) > 0);

-- Error Logs Table Constraints
ALTER TABLE error_logs ADD CONSTRAINT error_logs_error_type_not_null CHECK (error_type IS NOT NULL);
ALTER TABLE error_logs ADD CONSTRAINT error_logs_message_not_null CHECK (message IS NOT NULL);
ALTER TABLE error_logs ADD CONSTRAINT error_logs_error_type_length CHECK (LENGTH(error_type) > 0);
ALTER TABLE error_logs ADD CONSTRAINT error_logs_message_length CHECK (LENGTH(message) > 0);

-- Analytics Events Table Constraints
ALTER TABLE analytics_events ADD CONSTRAINT analytics_events_event_type_not_null CHECK (event_type IS NOT NULL);
ALTER TABLE analytics_events ADD CONSTRAINT analytics_events_event_type_length CHECK (LENGTH(event_type) > 0);

-- Analytics Rollups Table Constraints
ALTER TABLE analytics_rollups ADD CONSTRAINT analytics_rollups_metric_key_not_null CHECK (metric_key IS NOT NULL);
ALTER TABLE analytics_rollups ADD CONSTRAINT analytics_rollups_period_type_not_null CHECK (period_type IS NOT NULL);
ALTER TABLE analytics_rollups ADD CONSTRAINT analytics_rollups_period_start_not_null CHECK (period_start IS NOT NULL);
ALTER TABLE analytics_rollups ADD CONSTRAINT analytics_rollups_value_not_null CHECK (value IS NOT NULL);
ALTER TABLE analytics_rollups ADD CONSTRAINT analytics_rollups_value_non_negative CHECK (value >= 0);
