CREATE TABLE IF NOT EXISTS prompt_threads (
  id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  session_id TEXT,
  title TEXT,
  purpose TEXT,
  keyword TEXT,
  technique_id TEXT,
  technique_name TEXT,
  workflow_state TEXT,
  latest_prompt TEXT,
  prompt_count INTEGER DEFAULT 0,
  fields_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prompt_versions (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  kind TEXT,
  title TEXT,
  prompt TEXT,
  input_raw TEXT,
  intent_json TEXT,
  result_mode TEXT,
  technique_id TEXT,
  technique_name TEXT,
  purpose TEXT,
  keyword TEXT,
  workflow_state TEXT,
  score INTEGER,
  quality_grade TEXT,
  fields_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(thread_id) REFERENCES prompt_threads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS suggestions (
  id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  session_id TEXT,
  title TEXT,
  text TEXT NOT NULL,
  status TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prompt_threads_updated_at
  ON prompt_threads(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_prompt_versions_thread_id
  ON prompt_versions(thread_id, version_number DESC);

CREATE INDEX IF NOT EXISTS idx_suggestions_created_at
  ON suggestions(created_at DESC);

