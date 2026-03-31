// ===== routes.ts API routing =====
import { Hono } from 'hono'
import {
  TECHNIQUES, FIELD_DEFINITIONS, PURPOSE_PRESETS, PURPOSE_RECOMMENDATIONS,
} from './data'
import {
  generateAutoFields, analyzePromptQualityEnhanced, getPromptTips,
  getRoleForPurpose, getChainSteps, getCoreFeatures, getDataModel,
  getTechStack, getTargetUser,
} from './helpers'
import {
  buildGenerateResult,
  buildImproveResult,
  buildOptimizeResult,
  buildChainResult,
  buildContextDocResult,
} from './prompt-services'

export const apiRouter = new Hono()

type LogStore = {
  promptLogs: any[]
  activityLogs: any[]
}

const MAX_PROMPT_LOGS = 1000
const MAX_ACTIVITY_LOGS = 2000
const ADMIN_TOKEN_FALLBACK = 'promptbuilder-admin'
const EVENT_LOGS_SCHEMA_SQL = `
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
`

const PROMPT_THREADS_SCHEMA_SQL = `
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
`

const PROMPT_VERSIONS_SCHEMA_SQL = `
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
`

const SUGGESTIONS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS suggestions (
  id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  session_id TEXT,
  title TEXT,
  text TEXT NOT NULL,
  status TEXT,
  created_at TEXT NOT NULL
);
`

const PROMPT_TRAINING_SAMPLES_SCHEMA_SQL = `
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
`

function getLogStore(): LogStore {
  const g = globalThis as any
  if (!g.__promptAgentLogStore) {
    g.__promptAgentLogStore = { promptLogs: [], activityLogs: [] }
  }
  return g.__promptAgentLogStore as LogStore
}

function getExpectedAdminToken(c: any): string {
  return c.env?.ADMIN_TOKEN || ADMIN_TOKEN_FALLBACK
}

function getPersistentDb(c: any) {
  return c.env?.DB || c.env?.PERSIST_DB || null
}

async function ensureEventLogSchema(c: any) {
  const db = getPersistentDb(c)
  if (!db || typeof db.prepare !== 'function') return
  const g = globalThis as any
  if (!g.__promptAgentEventLogSchemaPromise) {
    g.__promptAgentEventLogSchemaPromise = Promise.all([
      db.prepare(EVENT_LOGS_SCHEMA_SQL).run(),
      db.prepare('CREATE INDEX IF NOT EXISTS idx_event_logs_created_at ON event_logs(created_at DESC)').run(),
      db.prepare('CREATE INDEX IF NOT EXISTS idx_event_logs_kind_created_at ON event_logs(kind, created_at DESC)').run(),
    ]).catch((error) => {
      g.__promptAgentEventLogSchemaPromise = null
      throw error
    })
  }
  return g.__promptAgentEventLogSchemaPromise
}

async function ensureAppDataSchema(c: any) {
  const db = getPersistentDb(c)
  if (!db || typeof db.prepare !== 'function') return
  const g = globalThis as any
  if (!g.__promptAgentAppSchemaPromise) {
    g.__promptAgentAppSchemaPromise = Promise.all([
      db.prepare(PROMPT_THREADS_SCHEMA_SQL).run(),
      db.prepare(PROMPT_VERSIONS_SCHEMA_SQL).run(),
      db.prepare(SUGGESTIONS_SCHEMA_SQL).run(),
      db.prepare(PROMPT_TRAINING_SAMPLES_SCHEMA_SQL).run(),
      db.prepare('CREATE INDEX IF NOT EXISTS idx_prompt_threads_updated_at ON prompt_threads(updated_at DESC)').run(),
      db.prepare('CREATE INDEX IF NOT EXISTS idx_prompt_versions_thread_id ON prompt_versions(thread_id, version_number DESC)').run(),
      db.prepare('CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON suggestions(created_at DESC)').run(),
      db.prepare('CREATE INDEX IF NOT EXISTS idx_prompt_training_samples_created_at ON prompt_training_samples(created_at DESC)').run(),
      db.prepare('CREATE INDEX IF NOT EXISTS idx_prompt_training_samples_kind_created_at ON prompt_training_samples(kind, created_at DESC)').run(),
    ]).catch((error) => {
      g.__promptAgentAppSchemaPromise = null
      throw error
    })
  }
  return g.__promptAgentAppSchemaPromise
}

function normalizeEventLog(row: any) {
  return {
    id: row.id || row.log_id || `${Date.now()}`,
    logId: row.log_id || row.id || `${Date.now()}`,
    visitorId: row.visitor_id || 'anonymous',
    sessionId: row.session_id || '',
    actionType: row.action_type || row.kind?.toUpperCase() || 'UNKNOWN',
    promptId: row.prompt_id || null,
    threadId: row.thread_id || '',
    versionNumber: Number(row.version_number || 0),
    techniqueId: row.technique_id || '',
    technique: row.technique || '',
    prompt: row.prompt || '',
    grade: row.grade || 'C',
    score: Number(row.score || 0),
    purpose: row.purpose || '',
    keyword: row.keyword || '',
    model: row.model || '',
    workflowState: row.workflow_state || '',
    meta: (() => {
      try {
        return row.meta_json ? JSON.parse(row.meta_json) : {}
      } catch {
        return {}
      }
    })(),
    createdAt: row.created_at || new Date().toISOString(),
  }
}

async function persistEventLog(c: any, kind: 'activity' | 'prompt', entry: any) {
  const db = getPersistentDb(c)
  if (!db || typeof db.prepare !== 'function') {
    const store = getLogStore()
    if (kind === 'activity') {
      store.activityLogs.unshift(entry)
      trimStore(store)
      return
    }
    store.promptLogs.unshift(entry)
    trimStore(store)
    return
  }

  try {
    await ensureEventLogSchema(c)
    await db.prepare(`
      INSERT INTO event_logs (
        id, kind, log_id, visitor_id, session_id, action_type, prompt_id,
        thread_id, version_number, technique_id, technique, prompt, grade, score,
        purpose, keyword, model, workflow_state, meta_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      String(entry.id || entry.logId || `${Date.now()}`),
      kind,
      String(entry.logId || entry.id || `${Date.now()}`),
      String(entry.visitorId || 'anonymous'),
      String(entry.sessionId || ''),
      String(entry.actionType || 'UNKNOWN'),
      entry.promptId ? String(entry.promptId) : null,
      entry.threadId ? String(entry.threadId) : null,
      Number(entry.versionNumber || 0) || null,
      String(entry.techniqueId || ''),
      String(entry.technique || ''),
      String(entry.prompt || ''),
      String(entry.grade || 'C'),
      Number(entry.score || 0),
      String(entry.purpose || ''),
      String(entry.keyword || ''),
      String(entry.model || ''),
      String(entry.workflowState || ''),
      JSON.stringify(entry.meta || {}),
      String(entry.createdAt || new Date().toISOString()),
    ).run()
    return
  } catch {
    const store = getLogStore()
    if (kind === 'activity') {
      store.activityLogs.unshift(entry)
      trimStore(store)
      return
    }
    store.promptLogs.unshift(entry)
    trimStore(store)
  }
}

async function readEventLogs(c: any, kind: 'activity' | 'prompt', limit: number) {
  const db = getPersistentDb(c)
  if (db && typeof db.prepare === 'function') {
    try {
      await ensureEventLogSchema(c)
      const result = await db.prepare(
        'SELECT * FROM event_logs WHERE kind = ? ORDER BY created_at DESC LIMIT ?'
      ).bind(kind, limit).all()
      const rows = Array.isArray(result?.results) ? result.results : []
      return rows.map(normalizeEventLog)
    } catch {
      const store = getLogStore()
      const source = kind === 'activity' ? store.activityLogs : store.promptLogs
      return source.slice(0, limit)
    }
  }

  const store = getLogStore()
  const source = kind === 'activity' ? store.activityLogs : store.promptLogs
  return source.slice(0, limit)
}

async function clearEventLogs(c: any) {
  const db = getPersistentDb(c)
  if (db && typeof db.prepare === 'function') {
    try {
      await ensureEventLogSchema(c)
      await db.prepare('DELETE FROM event_logs').run()
      return
    } catch {
      // fallback to memory below
    }
  }
  const store = getLogStore()
  store.promptLogs = []
  store.activityLogs = []
}

function isAdminRequest(c: any): boolean {
  const token = c.req.header('x-admin-token') || ''
  return token.length > 0 && token === getExpectedAdminToken(c)
}

function trimStore(store: LogStore) {
  store.promptLogs = store.promptLogs.slice(0, MAX_PROMPT_LOGS)
  store.activityLogs = store.activityLogs.slice(0, MAX_ACTIVITY_LOGS)
}

async function persistPromptThread(c: any, thread: any, version: any) {
  const db = getPersistentDb(c)
  if (!db || typeof db.prepare !== 'function') return
  try {
    await ensureAppDataSchema(c)
    await db.prepare(`
      INSERT INTO prompt_threads (
        id, visitor_id, session_id, title, purpose, keyword, technique_id,
        technique_name, workflow_state, latest_prompt, prompt_count, fields_json,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        visitor_id = excluded.visitor_id,
        session_id = excluded.session_id,
        title = excluded.title,
        purpose = excluded.purpose,
        keyword = excluded.keyword,
        technique_id = excluded.technique_id,
        technique_name = excluded.technique_name,
        workflow_state = excluded.workflow_state,
        latest_prompt = excluded.latest_prompt,
        prompt_count = excluded.prompt_count,
        fields_json = excluded.fields_json,
        updated_at = excluded.updated_at
    `).bind(
      String(thread.id),
      String(thread.visitorId || 'anonymous'),
      String(thread.sessionId || ''),
      String(thread.title || ''),
      String(thread.purpose || ''),
      String(thread.keyword || ''),
      String(thread.techniqueId || ''),
      String(thread.techniqueName || ''),
      String(thread.workflowState || ''),
      String(thread.latestPrompt || ''),
      Number(thread.promptCount || 0),
      JSON.stringify(thread.fields || {}),
      String(thread.createdAt || new Date().toISOString()),
      String(thread.updatedAt || new Date().toISOString()),
    ).run()

    await db.prepare(`
      INSERT INTO prompt_versions (
        id, thread_id, version_number, kind, title, prompt, input_raw, intent_json,
        result_mode, technique_id, technique_name, purpose, keyword, workflow_state,
        score, quality_grade, fields_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        thread_id = excluded.thread_id,
        version_number = excluded.version_number,
        kind = excluded.kind,
        title = excluded.title,
        prompt = excluded.prompt,
        input_raw = excluded.input_raw,
        intent_json = excluded.intent_json,
        result_mode = excluded.result_mode,
        technique_id = excluded.technique_id,
        technique_name = excluded.technique_name,
        purpose = excluded.purpose,
        keyword = excluded.keyword,
        workflow_state = excluded.workflow_state,
        score = excluded.score,
        quality_grade = excluded.quality_grade,
        fields_json = excluded.fields_json,
        created_at = excluded.created_at
    `).bind(
      String(version.id),
      String(thread.id),
      Number(version.versionNumber || 1),
      String(version.kind || 'generate'),
      String(version.title || ''),
      String(version.prompt || ''),
      String(version.inputRaw || ''),
      JSON.stringify(version.intent || null),
      String(version.resultMode || ''),
      String(version.techniqueId || ''),
      String(version.techniqueName || ''),
      String(version.purpose || ''),
      String(version.keyword || ''),
      String(version.workflowState || ''),
      Number(version.score || 0),
      String(version.qualityGrade || ''),
      JSON.stringify(version.fields || {}),
      String(version.createdAt || new Date().toISOString()),
    ).run()
  } catch {
    // fallback handled by client-side local history
  }
}

async function persistSuggestion(c: any, suggestion: any) {
  const db = getPersistentDb(c)
  if (!db || typeof db.prepare !== 'function') return
  try {
    await ensureAppDataSchema(c)
    await db.prepare(`
      INSERT INTO suggestions (
        id, visitor_id, session_id, title, text, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        visitor_id = excluded.visitor_id,
        session_id = excluded.session_id,
        title = excluded.title,
        text = excluded.text,
        status = excluded.status,
        created_at = excluded.created_at
    `).bind(
      String(suggestion.id),
      String(suggestion.visitorId || 'anonymous'),
      String(suggestion.sessionId || ''),
      String(suggestion.title || ''),
      String(suggestion.text || ''),
      String(suggestion.status || 'submitted'),
      String(suggestion.createdAt || new Date().toISOString()),
    ).run()
  } catch {
    // fallback handled client-side
  }
}

async function persistTrainingSample(c: any, sample: any) {
  const db = getPersistentDb(c)
  if (!db || typeof db.prepare !== 'function') return
  try {
    await ensureAppDataSchema(c)
    await db.prepare(`
      INSERT INTO prompt_training_samples (
        id, visitor_id, session_id, source, kind, thread_id, version_id, technique_id,
        technique_name, purpose, keyword, workflow_state, input_raw, generated_prompt,
        output_text, intent_json, quality_json, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        visitor_id = excluded.visitor_id,
        session_id = excluded.session_id,
        source = excluded.source,
        kind = excluded.kind,
        thread_id = excluded.thread_id,
        version_id = excluded.version_id,
        technique_id = excluded.technique_id,
        technique_name = excluded.technique_name,
        purpose = excluded.purpose,
        keyword = excluded.keyword,
        workflow_state = excluded.workflow_state,
        input_raw = excluded.input_raw,
        generated_prompt = excluded.generated_prompt,
        output_text = excluded.output_text,
        intent_json = excluded.intent_json,
        quality_json = excluded.quality_json,
        metadata_json = excluded.metadata_json,
        created_at = excluded.created_at
    `).bind(
      String(sample.id),
      String(sample.visitorId || 'anonymous'),
      String(sample.sessionId || ''),
      String(sample.source || 'client'),
      String(sample.kind || 'generate'),
      sample.threadId ? String(sample.threadId) : null,
      sample.versionId ? String(sample.versionId) : null,
      String(sample.techniqueId || ''),
      String(sample.techniqueName || ''),
      String(sample.purpose || ''),
      String(sample.keyword || ''),
      String(sample.workflowState || ''),
      String(sample.inputRaw || ''),
      String(sample.generatedPrompt || ''),
      sample.outputText ? String(sample.outputText) : null,
      JSON.stringify(sample.intent || null),
      JSON.stringify(sample.quality || null),
      JSON.stringify(sample.meta || {}),
      String(sample.createdAt || new Date().toISOString()),
    ).run()
  } catch {
    // fallback is client-side/local history only
  }
}

async function readPromptThreads(c: any, limit: number) {
  const db = getPersistentDb(c)
  if (db && typeof db.prepare === 'function') {
    try {
      await ensureAppDataSchema(c)
      const result = await db.prepare(
        'SELECT * FROM prompt_threads ORDER BY updated_at DESC LIMIT ?'
      ).bind(limit).all()
      const rows = Array.isArray(result?.results) ? result.results : []
      return rows.map((row: any) => ({
        id: row.id,
        visitorId: row.visitor_id || 'anonymous',
        sessionId: row.session_id || '',
        title: row.title || '',
        purpose: row.purpose || '',
        keyword: row.keyword || '',
        techniqueId: row.technique_id || '',
        techniqueName: row.technique_name || '',
        workflowState: row.workflow_state || '',
        latestPrompt: row.latest_prompt || '',
        promptCount: Number(row.prompt_count || 0),
        fields: (() => { try { return row.fields_json ? JSON.parse(row.fields_json) : {}; } catch { return {}; } })(),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    } catch {
      return []
    }
  }
  return []
}

async function readPromptVersions(c: any, threadId: string, limit: number) {
  const db = getPersistentDb(c)
  if (db && typeof db.prepare === 'function') {
    try {
      await ensureAppDataSchema(c)
      const result = await db.prepare(
        'SELECT * FROM prompt_versions WHERE thread_id = ? ORDER BY version_number DESC LIMIT ?'
      ).bind(threadId, limit).all()
      const rows = Array.isArray(result?.results) ? result.results : []
      return rows.map((row: any) => ({
        id: row.id,
        threadId: row.thread_id,
        versionNumber: Number(row.version_number || 0),
        kind: row.kind || '',
        title: row.title || '',
        prompt: row.prompt || '',
        inputRaw: row.input_raw || '',
        intent: (() => { try { return row.intent_json ? JSON.parse(row.intent_json) : null; } catch { return null; } })(),
        resultMode: row.result_mode || '',
        techniqueId: row.technique_id || '',
        techniqueName: row.technique_name || '',
        purpose: row.purpose || '',
        keyword: row.keyword || '',
        workflowState: row.workflow_state || '',
        score: Number(row.score || 0),
        qualityGrade: row.quality_grade || '',
        fields: (() => { try { return row.fields_json ? JSON.parse(row.fields_json) : {}; } catch { return {}; } })(),
        createdAt: row.created_at,
      }))
    } catch {
      return []
    }
  }
  return []
}

async function readSuggestions(c: any, limit: number) {
  const db = getPersistentDb(c)
  if (db && typeof db.prepare === 'function') {
    try {
      await ensureAppDataSchema(c)
      const result = await db.prepare(
        'SELECT * FROM suggestions ORDER BY created_at DESC LIMIT ?'
      ).bind(limit).all()
      const rows = Array.isArray(result?.results) ? result.results : []
      return rows.map((row: any) => ({
        id: row.id,
        visitorId: row.visitor_id || 'anonymous',
        sessionId: row.session_id || '',
        title: row.title || '',
        text: row.text || '',
        status: row.status || 'submitted',
        createdAt: row.created_at,
      }))
    } catch {
      return []
    }
  }
  return []
}

async function readTrainingSamples(c: any, limit: number) {
  const db = getPersistentDb(c)
  if (db && typeof db.prepare === 'function') {
    try {
      await ensureAppDataSchema(c)
      const result = await db.prepare(
        'SELECT * FROM prompt_training_samples ORDER BY created_at DESC LIMIT ?'
      ).bind(limit).all()
      const rows = Array.isArray(result?.results) ? result.results : []
      return rows.map((row: any) => ({
        id: row.id,
        visitorId: row.visitor_id || 'anonymous',
        sessionId: row.session_id || '',
        source: row.source || 'client',
        kind: row.kind || 'generate',
        threadId: row.thread_id || '',
        versionId: row.version_id || '',
        techniqueId: row.technique_id || '',
        techniqueName: row.technique_name || '',
        purpose: row.purpose || '',
        keyword: row.keyword || '',
        workflowState: row.workflow_state || '',
        inputRaw: row.input_raw || '',
        generatedPrompt: row.generated_prompt || '',
        outputText: row.output_text || '',
        intent: (() => { try { return row.intent_json ? JSON.parse(row.intent_json) : null; } catch { return null; } })(),
        quality: (() => { try { return row.quality_json ? JSON.parse(row.quality_json) : null; } catch { return null; } })(),
        meta: (() => { try { return row.metadata_json ? JSON.parse(row.metadata_json) : {}; } catch { return {}; } })(),
        createdAt: row.created_at,
      }))
    } catch {
      return []
    }
  }
  return []
}

function buildStats(store: LogStore) {
  const visitors = new Set([
    ...store.promptLogs.map((log: any) => log.visitorId).filter(Boolean),
    ...store.activityLogs.map((log: any) => log.visitorId).filter(Boolean),
  ])

  const countBy = (items: any[], keyFn: (item: any) => string) => {
    const map = new Map<string, number>()
    items.forEach((item) => {
      const key = keyFn(item)
      if (!key) return
      map.set(key, (map.get(key) || 0) + 1)
    })
    return Array.from(map.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
  }

  const activityByType = countBy(store.activityLogs, (log: any) => String(log.actionType || '').toUpperCase())
  const promptByTechnique = countBy(store.promptLogs, (log: any) => String(log.technique || log.techniqueId || 'UNKNOWN'))
  const promptByPurpose = countBy(store.promptLogs, (log: any) => String(log.purpose || 'custom'))
  const promptByGrade = countBy(store.promptLogs, (log: any) => String(log.grade || 'C'))

  return {
    promptCount: store.promptLogs.length,
    activityCount: store.activityLogs.length,
    visitorCount: visitors.size,
    pageViewCount: store.activityLogs.filter((log: any) => String(log.actionType || '').toUpperCase() === 'PAGE_VIEW').length,
    promptGenerateCount: store.activityLogs.filter((log: any) => String(log.actionType || '').toUpperCase() === 'PROMPT_GENERATE').length,
    optimizeRunCount: store.activityLogs.filter((log: any) => String(log.actionType || '').toUpperCase() === 'OPTIMIZE_RUN').length,
    suggestionCount: store.activityLogs.filter((log: any) => String(log.actionType || '').toUpperCase() === 'SUGGESTION_SUBMIT').length,
    copyCount: store.activityLogs.filter((log: any) => String(log.actionType || '').toUpperCase().includes('COPY')).length,
    downloadCount: store.activityLogs.filter((log: any) => String(log.actionType || '').toUpperCase().includes('DOWNLOAD')).length,
    topActivityTypes: activityByType.slice(0, 5),
    topPromptTechniques: promptByTechnique.slice(0, 5),
    topPromptPurposes: promptByPurpose.slice(0, 5),
    promptGradeCounts: promptByGrade,
  }
}

function applyPromptLanguage(text: string, language: string): string {
  if (language !== 'en') return text
  const replacements: Array<[string, string]> = [
    ['## 역할', '## Role'],
    ['## 문제 정의', '## Problem Definition'],
    ['## 입력 데이터', '## Input Data'],
    ['## 작업', '## Task'],
    ['## 제약 조건', '## Constraints'],
    ['## 사고 방향', '## Reasoning'],
    ['## 출력 형식', '## Output Format'],
    ['## 평가 기준', '## Evaluation Criteria'],
    ['## 예시', '## Examples'],
    ['## 프로젝트 컨텍스트 문서', '## Project Context Document'],
    ['## 프로젝트명', '## Project Name'],
    ['## 프로젝트 목표', '## Project Goal'],
    ['## 대상 사용자', '## Target User'],
    ['## 기술 스택', '## Tech Stack'],
    ['## 핵심 기능', '## Core Features'],
    ['## 데이터 모델', '## Data Model'],
    ['## 제약 조건 및 요구사항', '## Constraints and Requirements'],
    ['## 커뮤니케이션 톤', '## Communication Tone'],
    ['## 예시 입력', '## Example Input'],
    ['## 작업 상태', '## Work State'],
    ['## 초기 작성 기준', '## New Draft Criteria'],
    ['## 진행 중 작성 기준', '## In-Progress Criteria'],
    ['## 완료 보고 기준', '## Completion Report Criteria'],
    ['## 수정 요청 기준', '## Revision Request Criteria'],
    ['1단계:', 'Step 1:'],
    ['2단계:', 'Step 2:'],
    ['3단계:', 'Step 3:'],
    ['4단계:', 'Step 4:'],
    ['5단계:', 'Step 5:'],
    ['출력 형식:', 'Output Format:'],
    ['제약 조건:', 'Constraints:'],
    ['단계별로 차근차근 생각해보세요', 'Think step by step.'],
    ['다음 관점에서 개선하세요', 'Improve the prompt from the following perspectives.'],
    ['개선된 프롬프트와 변경 이유를 설명해주세요', 'Provide the improved prompt and explain the changes.'],
    ['프롬프트를 다시 작성하세요', 'Rewrite the prompt.'],
    ['수정된 프롬프트를 다시 실행하고 결과를 비교하세요', 'Run the revised prompt once more and compare the output.'],
  ]
  let result = String(text || '')
  for (const [from, to] of replacements) {
    result = result.split(from).join(to)
  }
  return result
}

function stripStepPrefix(value: string): string {
  return String(value || '').replace(/^Step\s*\d+\s*[:：-]?\s*/i, '').trim()
}

function getWorkflowStateProfile(state: string, language: string) {
  const normalized = String(state || 'new').toLowerCase()
  const ko = {
    new: {
      title: '새로 시작',
      summary: '처음부터 프롬프트를 설계하는 상황입니다.',
      sectionTitle: '초기 작성 기준',
      bullets: [
        '목표와 배경을 먼저 정리하세요.',
        '입력값이 비어 있으면 예시와 기본값으로 보완하세요.',
        '출력 형식과 성공 기준을 먼저 적어두세요.',
      ],
    },
    'in-progress': {
      title: '진행 중',
      summary: '이미 작업을 시작했고, 다음 질문이나 후속 작업이 필요한 상황입니다.',
      sectionTitle: '진행 중 작성 기준',
      bullets: [
        '현재까지 완료된 내용과 남은 일을 분리하세요.',
        '막힌 지점과 확인해야 할 질문을 함께 적으세요.',
        '답변은 "완료 / 다음 단계 / 확인 필요" 순서로 정리하세요.',
      ],
      exampleTitle: '예시 입력',
      exampleLines: [
        '- 현재 상태: 기능 초안은 완료했고, 구현 세부를 정리 중입니다.',
        '- 남은 작업: 누락된 요구사항 확인, 우선순위 정리, 다음 일정 제안',
        '- 확인 질문: 지금 막힌 지점은 무엇인지, 바로 진행할 다음 행동은 무엇인지',
        '- 기대 응답: 완료 / 다음 단계 / 확인 필요로 나눠 정리',
      ],
    },
    done: {
      title: '완료 보고',
      summary: '작업이 끝났거나 결과를 보고하는 상황입니다.',
      sectionTitle: '완료 보고 기준',
      bullets: [
        '무엇이 끝났는지 먼저 정리하세요.',
        '핵심 결과와 남은 후속 조치를 구분하세요.',
        '"완료되었습니다" 톤으로 요약하고 다음 액션을 제안하세요.',
      ],
    },
    blocked: {
      title: '막힘 / 수정 요청',
      summary: '작업이 막혔거나 사용자의 수정 지시가 필요한 상황입니다.',
      sectionTitle: '수정 요청 기준',
      bullets: [
        '문제 현상, 원인 추정, 필요한 도움을 분리하세요.',
        '무엇을 바꾸면 되는지 명확하게 적으세요.',
        '사용자가 바로 답할 수 있는 질문을 덧붙이세요.',
      ],
    },
  }
  const profile = ko[normalized as keyof typeof ko] || ko.new
  return profile
}

function getPromptStyleProfile(modelTarget: string, language: string) {
  const normalized = (modelTarget || 'gpt').toLowerCase()
  const english = language === 'en'
  const profiles: Record<string, { labelKo: string; labelEn: string; linesKo: string[]; linesEn: string[] }> = {
    gpt: {
      labelKo: 'GPT 스타일',
      labelEn: 'GPT style',
      linesKo: ['- 구조를 명확하게 정리하세요.', '- bullet, step, checklist를 우선 사용하세요.', '- 제약 조건과 출력 형식을 먼저 제시하세요.'],
      linesEn: ['- Keep the structure clear.', '- Prefer bullets, steps, and checklists.', '- State constraints and output format first.'],
    },
    claude: {
      labelKo: 'Claude 스타일',
      labelEn: 'Claude style',
      linesKo: ['- 맥락과 배경을 충분히 설명하세요.', '- 예외, 가정, 주의사항을 함께 포함하세요.', '- 답변은 길더라도 논리적이고 정돈되게 작성하세요.'],
      linesEn: ['- Provide enough context.', '- Include assumptions, exceptions, and background.', '- Keep the response thoughtful, detailed, and well organized.'],
    },
    gemini: {
      labelKo: 'Gemini 스타일',
      labelEn: 'Gemini style',
      linesKo: ['- 지시문을 짧고 명확하게 작성하세요.', '- 한 문장에 한 요청만 담으세요.', '- 직접적이고 실행 중심으로 정리하세요.'],
      linesEn: ['- Write short, explicit instructions.', '- Keep one request per sentence.', '- Be direct and execution-oriented.'],
    },
    genspark: {
      labelKo: 'Genspark 스타일',
      labelEn: 'Genspark style',
      linesKo: ['- 실행 순서를 먼저 정리하세요.', '- 간결한 요약과 바로 쓸 수 있는 출력을 우선하세요.', '- 탐색과 실행을 분리하세요.'],
      linesEn: ['- Start with the execution order.', '- Prioritize a concise summary and ready-to-use output.', '- Separate exploration from execution.'],
    },
    custom: {
      labelKo: '직접 지정',
      labelEn: 'Custom',
      linesKo: ['- 기본 구조는 유지하되, 필요하면 사용자가 직접 조정할 수 있게 하세요.'],
      linesEn: ['- Keep the base structure, but leave room for manual adjustment.'],
    },
  }
  const profile = profiles[normalized] || profiles.gpt
  return {
    label: english ? profile.labelEn : profile.labelKo,
    lines: english ? profile.linesEn : profile.linesKo,
  }
}

apiRouter.post('/logs', async (c) => {
  try {
    const payload = await c.req.json()
    const entry = {
      id: payload.id || Date.now(),
      logId: payload.logId || `${Date.now()}-${Math.random()}`,
      visitorId: payload.visitorId || 'anonymous',
      sessionId: payload.sessionId || '',
      actionType: payload.actionType || payload.kind?.toUpperCase() || 'UNKNOWN',
      promptId: payload.promptId || null,
      threadId: payload.threadId || null,
      versionNumber: Number(payload.versionNumber || 0) || null,
      techniqueId: payload.techniqueId || '',
      technique: payload.technique || '',
      prompt: payload.prompt || '',
      grade: payload.grade || 'C',
      score: Number(payload.score || 0),
      purpose: payload.purpose || '',
      keyword: payload.keyword || '',
      model: payload.model || '',
      workflowState: payload.workflowState || '',
      meta: payload.meta || {},
      createdAt: payload.createdAt || new Date().toISOString(),
    }

    await persistEventLog(c, payload.kind === 'activity' ? 'activity' : 'prompt', entry)
    return c.json({ ok: true })
  } catch {
    return c.json({ error: '濡쒓렇 ??μ뿉 ?ㅽ뙣?덉뒿?덈떎.' }, 400)
  }
})

apiRouter.get('/admin/logs', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized' }, 401)
  const [promptLogs, activityLogs, promptThreads, suggestionItems, trainingSamples] = await Promise.all([
    readEventLogs(c, 'prompt', MAX_PROMPT_LOGS),
    readEventLogs(c, 'activity', MAX_ACTIVITY_LOGS),
    readPromptThreads(c, 80),
    readSuggestions(c, 80),
    readTrainingSamples(c, 80),
  ])
  const store = { promptLogs, activityLogs }
  const stats = buildStats(store)
  return c.json({
    promptLogs: store.promptLogs,
    activityLogs: store.activityLogs,
    promptThreads,
    suggestions: suggestionItems,
    trainingSamples: trainingSamples,
    stats: {
      ...stats,
      promptThreadCount: promptThreads.length,
      suggestionStoreCount: suggestionItems.length,
      trainingSampleCount: trainingSamples.length,
    },
  })
})

apiRouter.delete('/admin/logs', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized' }, 401)
  await clearEventLogs(c)
  const db = getPersistentDb(c)
  if (db && typeof db.prepare === 'function') {
    try {
      await ensureAppDataSchema(c)
      await db.prepare('DELETE FROM prompt_threads').run()
      await db.prepare('DELETE FROM prompt_versions').run()
      await db.prepare('DELETE FROM suggestions').run()
      await db.prepare('DELETE FROM prompt_training_samples').run()
    } catch {
      // ignore delete failures
    }
  }
  return c.json({ ok: true })
})

apiRouter.post('/history/persist', async (c) => {
  try {
    const payload = await c.req.json()
    const thread = payload.thread || {}
    const version = payload.version || {}
    if (!thread.id || !version.id) {
      return c.json({ error: 'thread.id와 version.id가 필요합니다.' }, 400)
    }
    await persistPromptThread(c, thread, version)
    return c.json({ ok: true })
  } catch {
    return c.json({ error: '히스토리 저장에 실패했습니다.' }, 400)
  }
})

apiRouter.post('/training-samples', async (c) => {
  try {
    const payload = await c.req.json()
    const sample = payload.sample || payload
    if (!sample.id || !sample.generatedPrompt) {
      return c.json({ error: 'generatedPrompt가 필요합니다.' }, 400)
    }
    await persistTrainingSample(c, sample)
    return c.json({ ok: true })
  } catch {
    return c.json({ error: '학습 샘플 저장에 실패했습니다.' }, 400)
  }
})

apiRouter.post('/suggestions', async (c) => {
  try {
    const payload = await c.req.json()
    const suggestion = payload.suggestion || payload
    if (!suggestion.id || !suggestion.text) {
      return c.json({ error: '건의사항 내용이 필요합니다.' }, 400)
    }
    await persistSuggestion(c, suggestion)
    return c.json({ ok: true })
  } catch {
    return c.json({ error: '건의사항 저장에 실패했습니다.' }, 400)
  }
})

// ?? GET /api/techniques ????????????????????????????????????????????
apiRouter.get('/techniques', (c) => {
  const list = Object.values(TECHNIQUES).map((t: any) => ({
    id: t.id, name: t.name, nameEn: t.nameEn, icon: t.icon,
    color: t.color, difficulty: t.difficulty, description: t.description, category: t.category,
  }))
  return c.json({ techniques: list })
})

// ?? GET /api/techniques/:id ????????????????????????????????????????
apiRouter.get('/techniques/:id', (c) => {
  const id = c.req.param('id')
  const tech = TECHNIQUES[id]
  if (!tech) return c.json({ error: 'Not found' }, 404)
  const fields = tech.fields.map((f: string) => ({ ...FIELD_DEFINITIONS[f], id: f }))
  return c.json({ technique: tech, fields })
})

// ?? GET /api/purposes ?????????????????????????????????????????????
apiRouter.get('/purposes', (c) => c.json({ purposes: PURPOSE_PRESETS }))

// ?? POST /api/recommend ???????????????????????????????????????????
apiRouter.post('/recommend', async (c) => {
  try {
    const { purpose } = await c.req.json()
    const rec = PURPOSE_RECOMMENDATIONS[purpose] || PURPOSE_RECOMMENDATIONS['custom']
    return c.json({
      primary:            rec.primary,
      secondary:          rec.secondary,
      reason:             rec.reason,
      primaryTechnique:   {
        id: TECHNIQUES[rec.primary].id, name: TECHNIQUES[rec.primary].name,
        nameEn: TECHNIQUES[rec.primary].nameEn, icon: TECHNIQUES[rec.primary].icon,
        color: TECHNIQUES[rec.primary].color, category: TECHNIQUES[rec.primary].category,
      },
      secondaryTechniques: rec.secondary.map((id: string) => ({
        id: TECHNIQUES[id].id, name: TECHNIQUES[id].name,
        nameEn: TECHNIQUES[id].nameEn, icon: TECHNIQUES[id].icon,
        color: TECHNIQUES[id].color, category: TECHNIQUES[id].category,
      })),
    })
  } catch {
    return c.json({ error: '잘못된 요청입니다.' }, 400)
  }
})

// POST /api/auto-fill
apiRouter.post('/auto-fill', async (c) => {
  try {
    const { purpose, keyword, techniqueId } = await c.req.json()
    if (!purpose || !keyword || !techniqueId) {
      return c.json({ error: '목적, 키워드, 기술 ID가 필요합니다.' }, 400)
    }
    return c.json({ fields: generateAutoFields(purpose, keyword, techniqueId) })
  } catch {
    return c.json({ error: '잘못된 요청입니다.' }, 400)
  }
})

// POST /api/generate-chain
apiRouter.post('/generate-chain', async (c) => {
  try {
    const { purpose, keyword, fields, language } = await c.req.json()
    if (!keyword) return c.json({ error: '키워드가 필요합니다.' }, 400)
    return c.json(buildChainResult({ purpose, keyword, fields: fields || {}, language: language || 'ko' }))
  } catch {
    return c.json({ error: '잘못된 요청입니다.' }, 400)
  }
})

// POST /api/generate-context-doc
apiRouter.post('/generate-context-doc', async (c) => {
  try {
    const { purpose, keyword, fields, language } = await c.req.json()
    if (!keyword) return c.json({ error: '키워드가 필요합니다.' }, 400)
    return c.json(buildContextDocResult({ purpose, keyword, fields: fields || {}, language: language || 'ko' }))
  } catch {
    return c.json({ error: '잘못된 요청입니다.' }, 400)
  }
})

// POST /api/improve
apiRouter.post('/improve', async (c) => {
  try {
    const { prompt, goal, language } = await c.req.json()
    if (!prompt || !String(prompt).trim()) {
      return c.json({ error: '개선할 프롬프트가 필요합니다.' }, 400)
    }
    return c.json(buildImproveResult({ prompt, goal, language: language || 'ko' }))
  } catch {
    return c.json({ error: '잘못된 요청입니다.' }, 400)
  }
})

// POST /api/optimize
apiRouter.post('/optimize', async (c) => {
  try {
    const { prompt, output, goal, modelTarget, language } = await c.req.json()
    if (!String(prompt || '').trim() || !String(output || '').trim()) {
      return c.json({ error: 'prompt와 output이 모두 필요합니다.' }, 400)
    }
    return c.json(buildOptimizeResult({ prompt, output, goal, modelTarget, language: language || 'ko' }))
  } catch (err: any) {
    return c.json({ error: err?.message || '최적화 중 오류가 발생했습니다.' }, 500)
  }
})

// ?? POST /api/generate ????????????????????????????????????????????
apiRouter.post('/generate', async (c) => {
  try {
    const body = await c.req.json()
    const { techniqueId, fields: inputFields, purpose, keyword, language, promptStyle } = body
    const workflowState = String(body.workflowState || inputFields?.workflow_state || 'new')
    const selectedAdvancedFields = body.selectedAdvancedFields || []
    const customBlankFields = body.customBlankFields || []
    return c.json(buildGenerateResult({
      techniqueId,
      inputFields: inputFields || {},
      purpose,
      keyword,
      language: language || 'ko',
      promptStyle: promptStyle || 'gpt',
      workflowState,
      selectedAdvancedFields,
      customBlankFields,
    }))
  } catch (err: any) {
    return c.json({ error: err?.message || '생성 중 오류가 발생했습니다.' }, 500)
  }
})



