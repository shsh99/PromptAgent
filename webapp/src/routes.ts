// ===== routes.ts — API 엔드포인트 =====
import { Hono } from 'hono'
import {
  TECHNIQUES, FIELD_DEFINITIONS, PURPOSE_PRESETS, PURPOSE_RECOMMENDATIONS,
} from './data'
import {
  generateAutoFields, analyzePromptQualityEnhanced, getPromptTips,
  getRoleForPurpose, getChainSteps, getCoreFeatures, getDataModel,
  getTechStack, getTargetUser,
} from './helpers'

export const apiRouter = new Hono()

type LogStore = {
  promptLogs: any[]
  activityLogs: any[]
}

const MAX_PROMPT_LOGS = 1000
const MAX_ACTIVITY_LOGS = 2000
const ADMIN_TOKEN_FALLBACK = 'promptbuilder-admin'

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

function isAdminRequest(c: any): boolean {
  const token = c.req.header('x-admin-token') || ''
  return token.length > 0 && token === getExpectedAdminToken(c)
}

function trimStore(store: LogStore) {
  store.promptLogs = store.promptLogs.slice(0, MAX_PROMPT_LOGS)
  store.activityLogs = store.activityLogs.slice(0, MAX_ACTIVITY_LOGS)
}

function buildStats(store: LogStore) {
  const visitors = new Set([
    ...store.promptLogs.map((log: any) => log.visitorId).filter(Boolean),
    ...store.activityLogs.map((log: any) => log.visitorId).filter(Boolean),
  ])
  return {
    promptCount: store.promptLogs.length,
    activityCount: store.activityLogs.length,
    visitorCount: visitors.size,
  }
}

function applyPromptLanguage(text: string, language: string): string {
  if (language !== 'en') return text
  return String(text || '')
    .replace(/## 역할/g, '## Role')
    .replace(/## 문제 정의/g, '## Problem Definition')
    .replace(/## 입력 데이터/g, '## Input Data')
    .replace(/## 작업/g, '## Task')
    .replace(/## 제약 조건/g, '## Constraints')
    .replace(/## 사고 방향/g, '## Reasoning')
    .replace(/## 출력 형식/g, '## Output Format')
    .replace(/## 평가 기준/g, '## Evaluation Criteria')
    .replace(/## 예시/g, '## Examples')
    .replace(/## 프로젝트 컨텍스트 문서/g, '## Project Context Document')
    .replace(/## 프로젝트명/g, '## Project Name')
    .replace(/## 프로젝트 목표/g, '## Project Goal')
    .replace(/## 대상 사용자/g, '## Target User')
    .replace(/## 기술 스택/g, '## Tech Stack')
    .replace(/## 핵심 기능/g, '## Core Features')
    .replace(/## 데이터 모델/g, '## Data Model')
    .replace(/## 제약 조건 및 요구사항/g, '## Constraints and Requirements')
    .replace(/## 커뮤니케이션 톤/g, '## Communication Tone')
    .replace(/1단계:/g, 'Step 1:')
    .replace(/2단계:/g, 'Step 2:')
    .replace(/3단계:/g, 'Step 3:')
    .replace(/4단계:/g, 'Step 4:')
    .replace(/5단계:/g, 'Step 5:')
    .replace(/출력 형식:/g, 'Output Format:')
    .replace(/제약 조건:/g, 'Constraints:')
    .replace(/단계별로 차근차근 생각해 보세요:/g, 'Think step by step:')
    .replace(/다음 관점에서 개선하세요:/g, 'Improve the prompt from the following perspectives:')
    .replace(/개선된 프롬프트와 변경 이유를 설명해주세요\./g, 'Provide the improved prompt and explain the changes.')
    .replace(/프롬프트를 다시 작성하세요\./g, 'Rewrite the prompt.')
    .replace(/수정한 프롬프트를 한 번 더 실행하고 결과를 비교하세요\./g, 'Run the revised prompt once more and compare the output.')
}

apiRouter.post('/logs', async (c) => {
  try {
    const payload = await c.req.json()
    const store = getLogStore()
    const entry = {
      id: payload.id || Date.now(),
      logId: payload.logId || `${Date.now()}-${Math.random()}`,
      visitorId: payload.visitorId || 'anonymous',
      actionType: payload.actionType || payload.kind?.toUpperCase() || 'UNKNOWN',
      promptId: payload.promptId || null,
      techniqueId: payload.techniqueId || '',
      technique: payload.technique || '',
      prompt: payload.prompt || '',
      grade: payload.grade || 'C',
      score: Number(payload.score || 0),
      purpose: payload.purpose || '',
      keyword: payload.keyword || '',
      model: payload.model || '',
      meta: payload.meta || {},
      createdAt: payload.createdAt || new Date().toISOString(),
    }

    if (payload.kind === 'activity') {
      store.activityLogs.unshift(entry)
      trimStore(store)
      return c.json({ ok: true })
    }

    store.promptLogs.unshift(entry)
    trimStore(store)
    return c.json({ ok: true })
  } catch {
    return c.json({ error: '로그 저장에 실패했습니다.' }, 400)
  }
})

apiRouter.get('/admin/logs', (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized' }, 401)
  const store = getLogStore()
  return c.json({
    promptLogs: store.promptLogs,
    activityLogs: store.activityLogs,
    stats: buildStats(store),
  })
})

apiRouter.delete('/admin/logs', (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized' }, 401)
  const store = getLogStore()
  store.promptLogs = []
  store.activityLogs = []
  return c.json({ ok: true })
})

// ── GET /api/techniques ────────────────────────────────────────────
apiRouter.get('/techniques', (c) => {
  const list = Object.values(TECHNIQUES).map((t: any) => ({
    id: t.id, name: t.name, nameEn: t.nameEn, icon: t.icon,
    color: t.color, difficulty: t.difficulty, description: t.description, category: t.category,
  }))
  return c.json({ techniques: list })
})

// ── GET /api/techniques/:id ────────────────────────────────────────
apiRouter.get('/techniques/:id', (c) => {
  const id = c.req.param('id')
  const tech = TECHNIQUES[id]
  if (!tech) return c.json({ error: 'Not found' }, 404)
  const fields = tech.fields.map((f: string) => ({ ...FIELD_DEFINITIONS[f], id: f }))
  return c.json({ technique: tech, fields })
})

// ── GET /api/purposes ─────────────────────────────────────────────
apiRouter.get('/purposes', (c) => c.json({ purposes: PURPOSE_PRESETS }))

// ── POST /api/recommend ───────────────────────────────────────────
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

// ── POST /api/auto-fill ───────────────────────────────────────────
apiRouter.post('/auto-fill', async (c) => {
  try {
    const { purpose, keyword, techniqueId } = await c.req.json()
    if (!purpose || !keyword || !techniqueId)
      return c.json({ error: '목적, 키워드, 기법 ID가 필요합니다.' }, 400)
    return c.json({ fields: generateAutoFields(purpose, keyword, techniqueId) })
  } catch {
    return c.json({ error: '잘못된 요청입니다.' }, 400)
  }
})

// ── POST /api/generate-chain ──────────────────────────────────────
apiRouter.post('/generate-chain', async (c) => {
  try {
    const { purpose, keyword, fields, language } = await c.req.json()
    if (!keyword) return c.json({ error: '키워드가 필요합니다.' }, 400)

    const p = PURPOSE_PRESETS.find(pp => pp.id === purpose)
    const purposeLabel = p?.label || purpose || '프로젝트'
    const role = getRoleForPurpose(purpose || 'custom')
    const stepsRaw = fields?.chain_steps || getChainSteps(purpose || 'custom', keyword)
    const steps = stepsRaw.split('\n')
      .filter((s: string) => s.trim())
      .map((s: string) => s.replace(/^(Step\s*\d+\s*[:：]\s*)/i, '').trim())

    const chainPrompts = steps.map((step: string, i: number) => {
      const stepNum = i + 1
      const totalSteps = steps.length
      const prevNote = i > 0 ? `\n\n[이전 단계(Step ${i})의 결과를 기반으로 진행합니다.]` : ''
      const nextNote = i < totalSteps - 1
        ? `\n\n[중요] 이 단계의 결과는 다음 단계(Step ${stepNum + 1})의 입력으로 사용됩니다. 구조화된 형태로 출력하세요.`
        : '\n\n[마지막 단계] 모든 이전 단계의 결과를 종합하여 최종 결과를 완성하세요.'

      let prompt = `${role}\n\n`
      prompt += `## 프롬프트 체인 - Step ${stepNum}/${totalSteps}\n`
      prompt += `**프로젝트**: ${keyword} (${purposeLabel})\n`
      prompt += `**현재 단계**: ${step}`
      prompt += prevNote
      prompt += `\n\n### 상세 지시사항\n`

      if (stepNum === 1) {
        prompt += `"${keyword}" 프로젝트의 요구사항을 분석해주세요:\n1. 프로젝트 목적과 핵심 가치\n2. 대상 사용자와 사용 시나리오\n3. 핵심 기능 목록 (우선순위 포함)\n4. 비기능 요구사항 (성능, 보안, 확장성)\n5. 성공 기준과 KPI`
      } else if (stepNum === 2) {
        prompt += `이전 단계에서 분석한 요구사항을 바탕으로 기술 아키텍처를 설계하세요:\n1. 기술 스택 선정 및 근거\n2. 시스템 아키텍처 다이어그램 (텍스트 기반)\n3. 모듈/컴포넌트 구조\n4. 데이터 흐름\n5. 확장성 고려사항`
      } else if (stepNum === 3) {
        prompt += `이전 단계의 아키텍처 설계를 바탕으로 상세 구현 스펙을 작성하세요:\n1. 데이터베이스 스키마 (테이블, 관계, 인덱스)\n2. API 엔드포인트 설계 (경로, 메서드, 요청/응답)\n3. 핵심 비즈니스 로직\n4. 에러 처리 전략\n5. 보안 고려사항`
      } else if (stepNum === 4) {
        prompt += `이전 단계의 스펙을 바탕으로 UI/UX와 프론트엔드를 설계하세요:\n1. 화면 목록 및 와이어프레임 (텍스트 기반)\n2. 컴포넌트 트리 구조\n3. 사용자 인터랙션 흐름\n4. 상태 관리 전략\n5. 접근성 및 반응형 디자인`
      } else {
        prompt += `이전 모든 단계의 결과를 종합하여 최종 결과물을 완성하세요:\n1. 구현 우선순위 및 스프린트 계획\n2. 테스트 전략\n3. 배포 계획\n4. 향후 개선사항\n5. 종합 정리`
      }

      prompt += nextNote
      if (fields?.output_format) prompt += `\n\n출력 형식: ${fields.output_format}`
      if (fields?.constraints) prompt += `\n제약 조건: ${fields.constraints}`

      return { step: stepNum, title: step, prompt: applyPromptLanguage(prompt.trim(), language || 'ko') }
    })

    return c.json({
      totalSteps: steps.length,
      project: keyword,
      purpose: purposeLabel,
      chainPrompts,
      language: language || 'ko',
    })
  } catch {
    return c.json({ error: '잘못된 요청입니다.' }, 400)
  }
})

// ── POST /api/generate-context-doc ───────────────────────────────
apiRouter.post('/generate-context-doc', async (c) => {
  try {
    const { purpose, keyword, fields, language } = await c.req.json()
    if (!keyword) return c.json({ error: '키워드가 필요합니다.' }, 400)

    const p = PURPOSE_PRESETS.find(pp => pp.id === purpose)
    const purposeLabel = p?.label || purpose || '프로젝트'
    const doc: string[] = []

    doc.push(`# ${fields?.project_name || keyword} - 프로젝트 컨텍스트 문서`)
    doc.push('')
    doc.push(`> 이 문서는 AI 도구(ChatGPT, Claude, Cursor 등)에 제공할 프로젝트 컨텍스트입니다.`)
    doc.push(`> 시스템 프롬프트 또는 프로젝트 루트에 context.md로 저장하여 사용하세요.`)
    doc.push('')
    doc.push(`## 1. 프로젝트 개요`)
    doc.push(`- **프로젝트명**: ${fields?.project_name || keyword}`)
    doc.push(`- **유형**: ${purposeLabel}`)
    doc.push(`- **목표**: ${fields?.project_goal || `${purposeLabel} 분야에서 "${keyword}"를 구현하는 프로젝트`}`)
    doc.push(`- **대상 사용자**: ${fields?.target_user || getTargetUser(purpose || 'custom')}`)
    doc.push('')
    doc.push(`## 2. 기술 스택`)
    const ts = fields?.tech_stack || getTechStack(purpose || 'custom')
    ts.split(',').map((t: string) => t.trim()).filter(Boolean).forEach((t: string) => doc.push(`- ${t}`))
    doc.push('')
    doc.push(`## 3. 핵심 기능`)
    const features = (fields?.core_features || getCoreFeatures(purpose || 'custom', keyword))
      .split('\n').filter((s: string) => s.trim())
    features.forEach((f: string, i: number) => {
      doc.push(`### 3.${i + 1}. ${f.trim()}`)
      doc.push(`- 상세 설명: [AI가 채워줌]`)
      doc.push(`- 우선순위: ${i < 2 ? 'P0 (핵심)' : i < 4 ? 'P1 (중요)' : 'P2 (부가)'}`)
      doc.push(`- 예상 구현 시간: [AI가 채워줌]`)
      doc.push('')
    })
    doc.push(`## 4. 데이터 모델`)
    const dm = fields?.data_model || getDataModel(purpose || 'custom', keyword)
    dm.split('\n').filter((s: string) => s.trim()).forEach((m: string) => doc.push(`- ${m.trim()}`))
    doc.push('')
    doc.push(`## 5. 제약 조건 및 요구사항`)
    const constraints = (fields?.constraints || '한국어 UI, 반응형 디자인, 성능 최적화')
      .split(',').map((s: string) => s.trim()).filter(Boolean)
    constraints.forEach((cc: string) => doc.push(`- ${cc}`))
    doc.push('')
    doc.push(`## 6. 커뮤니케이션 가이드`)
    doc.push(`- **톤**: ${fields?.tone || '전문적이고 체계적인'}`)
    doc.push(`- **언어**: 한국어`)
    doc.push(`- **코드 주석**: 한국어`)
    doc.push(`- **응답 형식**: 마크다운`)
    doc.push('')
    doc.push(`## 7. 프로젝트 구조 (AI가 설계)`)
    doc.push('```')
    doc.push(`${fields?.project_name || keyword}/`)
    doc.push('├── src/')
    doc.push('│   ├── components/   # UI 컴포넌트')
    doc.push('│   ├── pages/        # 페이지')
    doc.push('│   ├── api/          # API 라우트')
    doc.push('│   ├── utils/        # 유틸리티')
    doc.push('│   └── types/        # 타입 정의')
    doc.push('├── public/           # 정적 파일')
    doc.push('├── tests/            # 테스트')
    doc.push('└── README.md')
    doc.push('```')
    doc.push('')
    doc.push(`## 8. 개발 진행 규칙`)
    doc.push(`1. 한 번에 하나의 기능만 구현하세요.`)
    doc.push(`2. 각 기능은 테스트 가능한 단위로 나누세요.`)
    doc.push(`3. 커밋 메시지는 conventional commit을 따르세요.`)
    doc.push(`4. 모든 코드에 적절한 에러 처리를 포함하세요.`)
    doc.push(`5. 성능과 접근성을 항상 고려하세요.`)
    doc.push('')
    doc.push('---')
    doc.push('**이 문서를 AI 도구에 제공한 후 아래와 같이 시작하세요:**')
    doc.push('')
    doc.push('```')
    doc.push(`위 컨텍스트 문서를 바탕으로 "${fields?.project_name || keyword}" 프로젝트의`)
    doc.push(`첫 번째 기능인 "${features[0]?.trim() || '핵심 기능'}"을 구현해주세요.`)
    doc.push('```')

    return c.json({
      document: applyPromptLanguage(doc.join('\n'), language || 'ko'),
      filename:  `${(fields?.project_name || keyword).replace(/\s+/g, '-').toLowerCase()}-context.md`,
      sections:  8,
      features:  features.length,
      language: language || 'ko',
    })
  } catch {
    return c.json({ error: '잘못된 요청입니다.' }, 400)
  }
})

// ── POST /api/improve ─────────────────────────────────────────────
apiRouter.post('/improve', async (c) => {
  try {
    const { prompt, goal } = await c.req.json()
    if (!prompt || !String(prompt).trim())
      return c.json({ error: '개선할 프롬프트가 필요합니다.' }, 400)

    const lines = String(prompt).trim().split('\n').map((l: string) => l.trim()).filter(Boolean)
    const inferredGoal = goal?.trim() || '더 명확한 지시와 출력 형식을 갖춘 프롬프트로 개선'
    const improvedPrompt = [
      '## 역할',
      '당신은 주어진 목표를 가장 효율적으로 달성하는 전문 AI 어시스턴트입니다.',
      '',
      '## 작업 목표',
      inferredGoal,
      '',
      '## 원본 요청 요약',
      ...lines.slice(0, 6).map((l: string) => `- ${l}`),
      '',
      '## 수행 지침',
      '- 요청 의도를 먼저 요약한 뒤 작업을 수행합니다.',
      '- 모호한 표현은 더 구체적인 언어로 바꿉니다.',
      '- 필요한 경우 단계별 절차와 체크리스트를 포함합니다.',
      '- 답변은 실행 가능한 형태로 정리합니다.',
      '',
      '## 출력 형식',
      '- 핵심 결과',
      '- 세부 단계',
      '- 주의사항 또는 제약 조건',
      '',
      '## 제약 조건',
      '- 근거 없는 내용은 단정하지 않습니다.',
      '- 누락된 정보가 있으면 필요한 가정을 명시합니다.',
      '- 불필요한 장황함 없이 명확하게 작성합니다.',
      '',
      '## 원본 프롬프트',
      String(prompt).trim(),
    ].join('\n')

    return c.json({ improvedPrompt })
  } catch {
    return c.json({ error: '잘못된 요청입니다.' }, 400)
  }
})

apiRouter.post('/optimize', async (c) => {
  try {
    const { prompt, output, goal, modelTarget, language } = await c.req.json()
    if (!String(prompt || '').trim() || !String(output || '').trim()) {
      return c.json({ error: 'prompt와 output이 모두 필요합니다.' }, 400)
    }

    const promptText = String(prompt).trim()
    const outputText = String(output).trim()
    const goalText = String(goal || '').trim()
    const lowerPrompt = promptText.toLowerCase()
    const lowerOutput = outputText.toLowerCase()
    const lowerGoal = goalText.toLowerCase()
    const issues: string[] = []
    const improvements: string[] = []

    if (!goalText) {
      issues.push('goal_missing')
      improvements.push('목표를 한 문장으로 추가하세요.')
    }
    if (outputText.length < 80) {
      issues.push('output_too_short')
      improvements.push('출력 길이 제약과 필요한 세부 수준을 명시하세요.')
    }
    if (/[{[]/.test(goalText) && !/[{[]/.test(outputText)) {
      issues.push('format_mismatch')
      improvements.push('JSON 또는 표 형식처럼 원하는 출력 구조를 분명히 지정하세요.')
    }
    if (!lowerOutput.includes(lowerGoal.split(/\s+/).filter(Boolean)[0] || '')) {
      issues.push('goal_alignment')
      improvements.push('목표와 직접 연결되는 핵심 키워드를 출력 요구사항에 넣으세요.')
    }
    if (!/step|steps|step-by-step|단계|순서/.test(lowerPrompt)) {
      issues.push('reasoning_missing')
      improvements.push('단계적으로 생각한 뒤 최종 결과를 출력하도록 지시하세요.')
    }
    if (!/example|예시|input|output/.test(lowerPrompt)) {
      improvements.push('입력-출력 예시를 하나 추가하면 결과 안정성이 올라갑니다.')
    }

    const optimizeSeed = [
      '## 역할',
      '당신은 프롬프트 최적화 도우미입니다.',
      '',
      '## 문제 정의',
      goalText ? `해결해야 할 목표: ${goalText}` : '제공된 결과 피드백을 바탕으로 프롬프트를 개선하세요.',
      '',
      '## 입력 데이터',
      `원본 프롬프트:\n${promptText}`,
      '',
      `결과:\n${outputText}`,
      '',
      '## 작업',
      '다음 실행에서 더 나은 결과가 나오도록 프롬프트를 다시 작성하세요.',
      '',
      '## 제약 조건',
      '- 프롬프트는 짧지만 명확해야 합니다.',
      '- 출력 구조를 분명하게 적어야 합니다.',
      '- 빠진 가드레일과 예시를 추가하세요.',
      '',
      '## 사고 방향',
      '- 왜 결과가 실패했는지 먼저 판단하세요.',
      '- 필요한 구조만 최소한으로 추가하세요.',
      '- 원본 프롬프트의 유용한 부분은 유지하세요.',
      '',
      '## 출력 형식',
      '- improved_prompt',
      '- issues',
      '- improvements',
      '- next_action',
      '',
      '## 평가 기준',
      '- 명확성',
      '- 형식 준수',
      '- 목표 일치',
      '- 실행 가능성',
      '',
      '## 예시',
      '- 입력 -> 기대되는 출력 동작',
    ].join('\n')

    const improvedPrompt = [
      '## 최적화 프롬프트',
      goalText ? `목표: ${goalText}` : '목표: 프롬프트의 출력 품질을 높이기.',
      '',
      '### 문제 정의',
      goalText || '현재 프롬프트는 구조와 출력 제어가 더 필요합니다.',
      '',
      '### 입력 데이터',
      outputText,
      '',
      '### 작업',
      '실패 원인을 분석하고 다음 실행을 위한 프롬프트로 다시 작성하세요.',
      '',
      '### 제약 조건',
      '- 형식, 범위, 출력 길이를 분명하게 적어야 합니다.',
      '- 결과가 불안정하면 예시를 추가하세요.',
      '- 목표를 놓쳤을 때 복구할 지시를 포함하세요.',
      '',
      '### 출력 스키마',
      '- improved_prompt',
      '- issues',
      '- improvements',
      '- next_action',
      '',
      '### 평가 기준',
      '- 명확함',
      '- 실행 가능함',
      '- 목표와 일치함',
      '- 재사용 가능함',
      '',
      '### 기준 프롬프트',
      promptText,
    ].join('\n')

    const nextAction = issues.length
      ? `집중할 항목: ${issues.slice(0, 3).join(', ')}`
      : '수정한 프롬프트를 한 번 더 실행하고 결과를 비교하세요.'
    const score = Math.max(0, 100 - issues.length * 18)
    const promptLanguage = language || 'ko'
    const localizedIssues = promptLanguage === 'en'
      ? issues.map((item) => applyPromptLanguage(item, promptLanguage))
      : issues
    const localizedImprovements = promptLanguage === 'en'
      ? improvements.map((item) => applyPromptLanguage(item, promptLanguage))
      : improvements
    const localizedNextAction = promptLanguage === 'en'
      ? applyPromptLanguage(nextAction, promptLanguage)
      : nextAction
    const localizedOptimizeSeed = applyPromptLanguage(optimizeSeed, promptLanguage)
    const localizedImprovedPrompt = applyPromptLanguage(improvedPrompt, promptLanguage)

    return c.json({
      prompt: promptText,
      output: outputText,
      goal: goalText,
      modelTarget: modelTarget || '',
      language: promptLanguage,
      issues: localizedIssues,
      improvements: localizedImprovements,
      score,
      improvedPrompt: `${localizedOptimizeSeed}\n\n---\n\n${localizedImprovedPrompt}`,
      nextAction: localizedNextAction,
    })
  } catch (err: any) {
    return c.json({ error: err?.message || '최적화에 실패했습니다.' }, 500)
  }
})

// ── POST /api/generate ────────────────────────────────────────────
apiRouter.post('/generate', async (c) => {
  try {
    const { techniqueId, fields: inputFields, purpose, keyword, language } = await c.req.json()
    const tech = TECHNIQUES[techniqueId]
    const autoFields = generateAutoFields(purpose || 'custom', keyword || '', techniqueId)
    const fields = { ...autoFields, ...(inputFields || {}) } as Record<string, string>
    if (!tech) return c.json({ error: '유효하지 않은 기법입니다.' }, 400)

    let prompt = ''

    if (techniqueId === 'context-engineering') {
      const sections: string[] = []
      sections.push('# 프로젝트 컨텍스트 문서\n')
      if (fields.project_name)  sections.push(`## 프로젝트명\n${fields.project_name}`)
      if (fields.project_goal)  sections.push(`## 프로젝트 목표\n${fields.project_goal}`)
      if (fields.target_user)   sections.push(`## 대상 사용자\n${fields.target_user}`)
      if (fields.tech_stack)    sections.push(`## 기술 스택\n${fields.tech_stack}`)
      if (fields.core_features) {
        const flist = fields.core_features.split('\n').filter((s: string) => s.trim())
        sections.push(`## 핵심 기능\n${flist.map((f: string, i: number) => `${i + 1}. ${f.trim()}`).join('\n')}`)
      }
      if (fields.data_model)    sections.push(`## 데이터 모델\n${fields.data_model}`)
      if (fields.constraints)   sections.push(`## 제약 조건 및 요구사항\n${fields.constraints}`)
      if (fields.tone)          sections.push(`## 커뮤니케이션 톤\n${fields.tone}`)
      sections.push('\n---\n위 컨텍스트를 바탕으로 프로젝트를 설계하고 구현해주세요.\n각 기능의 상세 스펙, API 설계, 데이터베이스 스키마, 프로젝트 구조를 포함해주세요.')
      prompt = sections.join('\n\n')

    } else if (techniqueId === 'harness') {
      const sections: string[] = []
      if (fields.role)          sections.push(`## 역할 (Role)\n${fields.role}`)
      if (fields.context)       sections.push(`## 배경 컨텍스트 (Context)\n${fields.context}`)
      if (fields.task)          sections.push(`## 작업 목표 (Task)\n${fields.task}`)
      if (fields.goal)          sections.push(`## 핵심 목표 (Goal)\n${fields.goal}`)
      if (fields.non_goal)      sections.push(`## 비목표 (Non-Goal)\n${fields.non_goal}`)
      if (fields.must_have)     sections.push(`## Must-have\n${fields.must_have}`)
      if (fields.should_have)   sections.push(`## Should-have\n${fields.should_have}`)
      if (fields.nice_to_have)  sections.push(`## Nice-to-have\n${fields.nice_to_have}`)
      if (fields.input_guardrails)  sections.push(`## 입력 가드레일\n${fields.input_guardrails}`)
      if (fields.output_guardrails) sections.push(`## 출력 가드레일\n${fields.output_guardrails}`)
      if (fields.monitoring_rules)  sections.push(`## 모니터링 규칙\n${fields.monitoring_rules}`)
      if (fields.rollback_plan)     sections.push(`## 롤백 계획\n${fields.rollback_plan}`)
      if (fields.input_data)    sections.push(`## 입력 데이터 (Input)\n${fields.input_data}`)
      if (fields.output_format) sections.push(`## 출력 형식 (Output Format)\n${fields.output_format}`)
      if (fields.tone)          sections.push(`## 톤 & 스타일 (Tone)\n${fields.tone}`)
      if (fields.constraints)   sections.push(`## 제약 조건 (Constraints)\n${fields.constraints}`)
      if (fields.example)       sections.push(`## 예시 (Example)\n${fields.example}`)
      prompt = sections.join('\n\n')

    } else if (techniqueId === 'zero-shot') {
      const parts: string[] = []
      if (fields.role) parts.push(fields.role)
      parts.push('')
      if (fields.task) parts.push(fields.task)
      if (fields.output_format) parts.push(`\n출력 형식: ${fields.output_format}`)
      if (fields.constraints) parts.push(`\n제약 조건: ${fields.constraints}`)
      prompt = parts.join('\n')

    } else if (techniqueId === 'few-shot') {
      const parts: string[] = []
      if (fields.role) parts.push(fields.role)
      parts.push('')
      if (fields.task) parts.push(fields.task)
      parts.push('')
      if (fields.examples) parts.push(`예시:\n${fields.examples}`)
      parts.push('')
      if (fields.actual_input) parts.push(`이제 다음을 수행하세요:\n${fields.actual_input}`)
      if (fields.output_format) parts.push(`\n출력 형식: ${fields.output_format}`)
      if (fields.constraints) parts.push(`\n제약 조건: ${fields.constraints}`)
      prompt = parts.join('\n')

    } else if (techniqueId === 'chain-of-thought') {
      const parts: string[] = []
      if (fields.role) parts.push(fields.role)
      parts.push('')
      if (fields.task) parts.push(fields.task)
      parts.push('')
      parts.push('단계별로 차근차근 생각해 보세요:')
      if (fields.steps) parts.push(fields.steps)
      else parts.push('1단계: 문제를 분석합니다.\n2단계: 가능한 해결 방안을 도출합니다.\n3단계: 최적의 솔루션을 선택하고 설명합니다.')
      if (fields.output_format) parts.push(`\n최종 답변을 ${fields.output_format} 형식으로 제공하세요.`)
      if (fields.constraints) parts.push(`\n제약 조건: ${fields.constraints}`)
      prompt = parts.join('\n')

    } else if (techniqueId === 'tree-of-thought') {
      const parts: string[] = []
      if (fields.role) parts.push(fields.role)
      parts.push('')
      parts.push(`문제: ${fields.task || ''}`)
      parts.push('')
      parts.push('다음 접근법으로 분석하세요:')
      parts.push('')
      if (fields.approaches) parts.push(fields.approaches)
      else parts.push('접근법 A: 첫 번째 관점\n접근법 B: 두 번째 관점\n접근법 C: 세 번째 관점')
      parts.push('')
      parts.push('각 접근법의 장단점을 평가하고, 가장 적합한 해결책을 선택하여 최종 답변을 제시하세요.')
      if (fields.output_format) parts.push(`\n출력 형식: ${fields.output_format}`)
      if (fields.constraints) parts.push(`\n제약 조건: ${fields.constraints}`)
      prompt = parts.join('\n')

    } else if (techniqueId === 'role-prompting') {
      const parts: string[] = []
      parts.push(`당신은 ${fields.role_detail || '전문가'}입니다.`)
      if (fields.expertise) parts.push(fields.expertise)
      parts.push('')
      if (fields.task) parts.push(fields.task)
      if (fields.tone) parts.push(`\n${fields.tone} 톤으로 답변하세요.`)
      if (fields.output_format) parts.push(`출력 형식: ${fields.output_format}`)
      if (fields.constraints) parts.push(`\n제약 조건: ${fields.constraints}`)
      prompt = parts.join('\n')

    } else if (techniqueId === 'prompt-chaining') {
      const parts: string[] = ['## 프롬프트 체인 구조\n']
      if (fields.task) parts.push(`전체 목표: ${fields.task}\n`)
      if (fields.chain_steps) {
        const steps = fields.chain_steps.split('\n').filter((s: string) => s.trim())
        steps.forEach((step: string, i: number) => {
          parts.push(`### Step ${i + 1}: ${step.replace(/^(Step\s*\d+\s*[:：]\s*)/i, '')}`)
          if (i > 0) parts.push('(이전 단계의 결과를 바탕으로 진행)')
          parts.push('')
        })
      }
      if (fields.output_format) parts.push(`최종 출력 형식: ${fields.output_format}`)
      if (fields.constraints) parts.push(`\n제약 조건: ${fields.constraints}`)
      prompt = parts.join('\n')

    } else if (techniqueId === 'meta-prompting') {
      const parts: string[] = []
      parts.push('다음 프롬프트를 분석하고 개선해주세요:\n')
      parts.push(`원본 프롬프트:\n"${fields.original_prompt || ''}"`)
      parts.push('')
      if (fields.improvement_goal) parts.push(`개선 목표:\n- ${fields.improvement_goal}`)
      parts.push('')
      parts.push('다음 관점에서 개선하세요:\n1. 명확성과 구체성\n2. 컨텍스트 충분성\n3. 출력 형식 지정\n4. 잠재적 모호함 제거')
      parts.push('')
      parts.push('개선된 프롬프트와 변경 이유를 설명해주세요.')
      if (fields.constraints) parts.push(`\n${fields.constraints}`)
      prompt = parts.join('\n')
    }

    // 바이브 코딩 헤더
    const extraNotes = Object.entries(fields)
      .filter(([key, value]) => key.startsWith('custom_note_') && String(value || '').trim())
      .map(([, value], index) => `${index + 1}. ${String(value).trim()}`)
    if (extraNotes.length) {
      prompt += `\n\n## 추가 입력\n${extraNotes.join('\n')}`
    }

    if (purpose && purpose !== 'custom' && keyword) {
      const purposeInfo = PURPOSE_PRESETS.find(p => p.id === purpose)
      prompt = `[바이브 코딩 프로젝트]\n프로젝트 유형: ${purposeInfo?.label || purpose}\n핵심 키워드: ${keyword}\n\n` + prompt
    }

    const qualityReport = analyzePromptQualityEnhanced(prompt, fields)

    // 체이닝 단계 데이터
    let chainData = null
    if (techniqueId === 'prompt-chaining' && keyword) {
      const stepsRaw = fields.chain_steps || getChainSteps(purpose || 'custom', keyword)
      const steps = stepsRaw.split('\n').filter((s: string) => s.trim()).map((s: string) => s.replace(/^(Step\s*\d+\s*[:：]\s*)/i, '').trim())
      const role = getRoleForPurpose(purpose || 'custom')
      const purposeInfo = PURPOSE_PRESETS.find(p => p.id === purpose)
      chainData = steps.map((step: string, i: number) => {
        let sp = `${role}\n\n`
        sp += `## Step ${i + 1}/${steps.length}: ${step}\n`
        sp += `프로젝트: ${keyword} (${purposeInfo?.label || ''})\n`
        if (i > 0) sp += `\n[이전 Step ${i}의 결과를 기반으로 진행]\n`
        sp += `\n이 단계를 상세히 수행해주세요.`
        if (i < steps.length - 1) sp += `\n\n결과는 다음 단계에서 사용할 수 있도록 구조화하세요.`
        if (fields.constraints) sp += `\n\n제약: ${fields.constraints}`
        return { step: i + 1, title: step, prompt: sp.trim() }
      })
    }

    // 컨텍스트 문서 메타
    let contextDocMeta = null
    if (techniqueId === 'context-engineering') {
      const features = (fields.core_features || '').split('\n').filter((s: string) => s.trim())
      contextDocMeta = {
        filename: `${(fields.project_name || keyword || 'project').replace(/\s+/g, '-').toLowerCase()}-context.md`,
        sections: 8,
        features: features.length,
        tip: '이 문서를 context.md로 저장하여 AI 도구에 시스템 프롬프트로 제공하세요.',
      }
    }

    return c.json({
      prompt: applyPromptLanguage(prompt.trim(), language || 'ko'),
      technique: { name: tech.name, nameEn: tech.nameEn },
      qualityReport,
      tips: getPromptTips(techniqueId),
      chainData,
      contextDocMeta,
      language: language || 'ko',
    })
  } catch (err: any) {
    return c.json({ error: err?.message || '생성 중 오류가 발생했습니다.' }, 500)
  }
})
