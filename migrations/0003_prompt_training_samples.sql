CREATE TABLE IF NOT EXISTS prompt_training_samples (
  id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  session_id TEXT,
  source TEXT NOT NULL,
  kind TEXT NOT NULL,
  thread_id TEXT,
  version_id TEXT,
  technique_id TEXT,
  technique_name TEXT,
  purpose TEXT,
  keyword TEXT,
  workflow_state TEXT,
  input_raw TEXT,
  generated_prompt TEXT NOT NULL,
  output_text TEXT,
  intent_json TEXT,
  quality_json TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prompt_training_samples_created_at
  ON prompt_training_samples(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_prompt_training_samples_kind_created_at
  ON prompt_training_samples(kind, created_at DESC);
