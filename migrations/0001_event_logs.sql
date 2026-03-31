CREATE TABLE IF NOT EXISTS event_logs (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  log_id TEXT,
  visitor_id TEXT,
  session_id TEXT,
  action_type TEXT,
  prompt_id TEXT,
  thread_id TEXT,
  version_number INTEGER,
  technique_id TEXT,
  technique TEXT,
  prompt TEXT,
  grade TEXT,
  score INTEGER,
  purpose TEXT,
  keyword TEXT,
  model TEXT,
  workflow_state TEXT,
  meta_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_event_logs_created_at
  ON event_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_logs_kind_created_at
  ON event_logs(kind, created_at DESC);

