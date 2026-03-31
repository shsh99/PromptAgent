// ===== routes.ts ??API ?붾뱶?ъ씤??=====
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
    return c.json({ error: '濡쒓렇 ??μ뿉 ?ㅽ뙣?덉뒿?덈떎.' }, 400)
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
    return c.json({ error: '?섎せ???붿껌?낅땲??' }, 400)
  }
})

// ?? POST /api/auto-fill ???????????????????????????????????????????
apiRouter.post('/auto-fill', async (c) => {
  try {
    const { purpose, keyword, techniqueId } = await c.req.json()
    if (!purpose || !keyword || !techniqueId)
      return c.json({ error: '紐⑹쟻, ?ㅼ썙?? 湲곕쾿 ID媛 ?꾩슂?⑸땲??' }, 400)
    return c.json({ fields: generateAutoFields(purpose, keyword, techniqueId) })
  } catch {
    return c.json({ error: '?섎せ???붿껌?낅땲??' }, 400)
  }
})

// ?? POST /api/generate-chain ??????????????????????????????????????
apiRouter.post('/generate-chain', async (c) => {
  try {
    const { purpose, keyword, fields, language } = await c.req.json()
    if (!keyword) return c.json({ error: '?ㅼ썙?쒓? ?꾩슂?⑸땲??' }, 400)

    const p = PURPOSE_PRESETS.find(pp => pp.id === purpose)
    const purposeLabel = p?.label || purpose || '?꾨줈?앺듃'
    const role = getRoleForPurpose(purpose || 'custom')
    const stepsRaw = fields?.chain_steps || getChainSteps(purpose || 'custom', keyword)
    const steps = String(stepsRaw)
      .split('\n')
      .map((s: string) => stripStepPrefix(s))
      .filter((s: string) => s.trim())

    const chainPrompts = steps.map((step: string, i: number) => {
      const stepNum = i + 1
      const totalSteps = steps.length
      let prompt = `${role}`
      prompt += '\n\n## Step ' + stepNum + '/' + totalSteps + '\n'
      prompt += '목표: ' + keyword + ' (' + purposeLabel + ')\n'
      prompt += '현재 단계: ' + step + '\n\n'
      prompt += '이 단계의 결과를 실행 가능한 형태로 정리하세요.\n'
      if (i > 0) prompt += '이전 단계의 결과를 이어받아 작성하세요.\n'
      prompt += '\n\n## 출력 형식\n- 단계별 결과\n- 실행 가능한 액션\n- 다음 단계 입력'
      if (fields?.output_format) prompt += '\n\n## 사용자 출력 형식\n' + fields.output_format
      if (fields?.constraints) prompt += '\n\n## 제약 조건\n' + fields.constraints
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
    return c.json({ error: '?섎せ???붿껌?낅땲??' }, 400)
  }
})

apiRouter.post('/generate-context-doc', async (c) => {
  try {
    const { purpose, keyword, fields, language } = await c.req.json()
    if (!keyword) return c.json({ error: '?ㅼ썙?쒓? ?꾩슂?⑸땲??' }, 400)

    const p = PURPOSE_PRESETS.find(pp => pp.id === purpose)
    const purposeLabel = p?.label || purpose || '?꾨줈?앺듃'
    const projectName = fields?.project_name || keyword
    const projectGoal = fields?.project_goal || (purposeLabel + ' 분야에서 "' + keyword + '"을(를) 구현하는 프로젝트')
    const targetUser = fields?.target_user || getTargetUser(purpose || 'custom')
    const techStack = fields?.tech_stack || getTechStack(purpose || 'custom')
    const features = (fields?.core_features || getCoreFeatures(purpose || 'custom', keyword))
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean)
    const dataModel = fields?.data_model || getDataModel(purpose || 'custom', keyword)
    const constraints = fields?.constraints || '웹 성능, 반응형 UI, 유지보수성'
    const tone = fields?.tone || '친절하고 실무적인 톤'

    const doc: string[] = []
    doc.push('# ' + projectName + ' - 프로젝트 컨텍스트 문서')
    doc.push('')
    doc.push('이 문서는 AI 도구와 공유할 프로젝트 컨텍스트입니다.')
    doc.push('')
    doc.push('## 1. 프로젝트 개요')
    doc.push('- 프로젝트명: ' + projectName)
    doc.push('- 유형: ' + purposeLabel)
    doc.push('- 목표: ' + projectGoal)
    doc.push('- 대상 사용자: ' + targetUser)
    doc.push('')
    doc.push('## 2. 기술 스택')
    String(techStack).split(',').map((t: string) => t.trim()).filter(Boolean).forEach((t: string) => doc.push('- ' + t))
    doc.push('')
    doc.push('## 3. 핵심 기능')
    features.forEach((feature: string, index: number) => {
      doc.push('### 3.' + (index + 1) + '. ' + feature)
      doc.push('- 상세 설명: AI가 자동으로 채울 수 있는 영역입니다.')
      doc.push('- 우선순위: 프로젝트 초기에는 핵심 기능을 먼저 구현하세요.')
      doc.push('')
    })
    doc.push('## 4. 데이터 모델')
    String(dataModel).split('\n').map((s: string) => s.trim()).filter(Boolean).forEach((item: string) => doc.push('- ' + item))
    doc.push('')
    doc.push('## 5. 제약 조건 및 요구사항')
    String(constraints).split(',').map((s: string) => s.trim()).filter(Boolean).forEach((item: string) => doc.push('- ' + item))
    doc.push('')
    doc.push('## 6. 커뮤니케이션 가이드')
    doc.push('- 톤: ' + tone)
    doc.push('- 언어: 한국어 우선')
    doc.push('- 답변 형식: 구조화된 섹션과 목록 우선')
    doc.push('')
    doc.push('## 7. 프로젝트 구조 예시')
    doc.push('```')
    doc.push(projectName + '/')
    doc.push('  src/')
    doc.push('    components/   # UI 컴포넌트')
    doc.push('    pages/        # 화면')
    doc.push('    api/          # API 연동')
    doc.push('    utils/        # 공용 유틸')
    doc.push('    types/        # 타입 정의')
    doc.push('  public/         # 정적 파일')
    doc.push('  tests/          # 테스트')
    doc.push('  README.md')
    doc.push('```')
    doc.push('')
    doc.push('## 8. 개발 진행 규칙')
    doc.push('1. 한 번에 너무 많은 기능을 넣지 말고 작은 단위로 구현하세요.')
    doc.push('2. 각 기능은 테스트 가능한 상태로 유지하세요.')
    doc.push('3. 코드 변경은 이유와 함께 기록하세요.')
    doc.push('4. 오류가 있으면 우회하지 말고 원인을 먼저 정리하세요.')
    doc.push('5. 성능과 사용성을 함께 고려하세요.')

    return c.json({
      document: applyPromptLanguage(doc.join('\n'), language || 'ko'),
      filename: (projectName.replace(/\s+/g, '-').toLowerCase() + '-context.md'),
      sections: 8,
      features: features.length,
      language: language || 'ko',
    })
  } catch {
    return c.json({ error: '?섎せ???붿껌?낅땲??' }, 400)
  }
})

apiRouter.post('/improve', async (c) => {
  try {
    const { prompt, goal } = await c.req.json()
    if (!prompt || !String(prompt).trim())
      return c.json({ error: '媛쒖꽑???꾨＼?꾪듃媛 ?꾩슂?⑸땲??' }, 400)

    const lines = String(prompt).trim().split('\n').map((l: string) => l.trim()).filter(Boolean)
    const inferredGoal = goal?.trim() || '??紐낇솗??吏?쒖? 異쒕젰 ?뺤떇??媛뽰텣 ?꾨＼?꾪듃濡?媛쒖꽑'
    const improvedPrompt = [
      '## ??븷',
      '?뱀떊? 二쇱뼱吏?紐⑺몴瑜?媛???⑥쑉?곸쑝濡??ъ꽦?섎뒗 ?꾨Ц AI ?댁떆?ㅽ꽩?몄엯?덈떎.',
      '',
      '## ?묒뾽 紐⑺몴',
      inferredGoal,
      '',
      '## ?먮낯 ?붿껌 ?붿빟',
      ...lines.slice(0, 6).map((l: string) => `- ${l}`),
      '',
      '## 실행 지침',
      '- 프롬프트를 바로 실행 가능한 작업 단위로 정리하세요.',
      '- 모호한 표현은 줄이고 구체적인 지시로 바꾸세요.',
      '- 필요하면 체크리스트를 포함하세요.',
      '- 출력은 실행 가능한 형태로 유지하세요.',
      '',
      '## 異쒕젰 ?뺤떇',
      '- ?듭떖 寃곌낵',
      '- ?몃? ?④퀎',
      '- 二쇱쓽?ы빆 ?먮뒗 ?쒖빟 議곌굔',
      '',
      '## ?쒖빟 議곌굔',
      '- 洹쇨굅 ?녿뒗 ?댁슜? ?⑥젙?섏? ?딆뒿?덈떎.',
      '- ?꾨씫???뺣낫媛 ?덉쑝硫??꾩슂??媛?뺤쓣 紐낆떆?⑸땲??',
      '- 遺덊븘?뷀븳 ?ν솴???놁씠 紐낇솗?섍쾶 ?묒꽦?⑸땲??',
      '',
      '## ?먮낯 ?꾨＼?꾪듃',
      String(prompt).trim(),
    ].join('\n')

    return c.json({ improvedPrompt })
  } catch {
    return c.json({ error: '?섎せ???붿껌?낅땲??' }, 400)
  }
})

apiRouter.post('/optimize', async (c) => {
  try {
    const { prompt, output, goal, modelTarget, language } = await c.req.json()
    if (!String(prompt || '').trim() || !String(output || '').trim()) {
      return c.json({ error: 'prompt? output??紐⑤몢 ?꾩슂?⑸땲??' }, 400)
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
      improvements.push('紐⑺몴瑜???臾몄옣?쇰줈 異붽??섏꽭??')
    }
    if (outputText.length < 80) {
      issues.push('output_too_short')
      improvements.push('異쒕젰 湲몄씠 ?쒖빟怨??꾩슂???몃? ?섏???紐낆떆?섏꽭??')
    }
    if (/[{[]/.test(goalText) && !/[{[]/.test(outputText)) {
      issues.push('format_mismatch')
      improvements.push('JSON ?먮뒗 ???뺤떇泥섎읆 ?먰븯??異쒕젰 援ъ“瑜?遺꾨챸??吏?뺥븯?몄슂.')
    }
    if (!lowerOutput.includes(lowerGoal.split(/\s+/).filter(Boolean)[0] || '')) {
      issues.push('goal_alignment')
      improvements.push('紐⑺몴? 吏곸젒 ?곌껐?섎뒗 ?듭떖 ?ㅼ썙?쒕? 異쒕젰 ?붽뎄?ы빆???ｌ쑝?몄슂.')
    }
    if (!['step', 'steps', 'step-by-step'].some((token) => lowerPrompt.includes(token)) && !lowerPrompt.includes('단계') && !lowerPrompt.includes('순서')) {
      issues.push('reasoning_missing')
      improvements.push('?④퀎?곸쑝濡??앷컖????理쒖쥌 寃곌낵瑜?異쒕젰?섎룄濡?吏?쒗븯?몄슂.')
    }
    if (!['example', 'input', 'output'].some((token) => lowerPrompt.includes(token)) && !lowerPrompt.includes('예시')) {
      improvements.push('?낅젰-異쒕젰 ?덉떆瑜??섎굹 異붽??섎㈃ 寃곌낵 ?덉젙?깆씠 ?щ씪媛묐땲??')
    }

    const optimizeSeed = [
      '## ??븷',
      '?뱀떊? ?꾨＼?꾪듃 理쒖쟻???꾩슦誘몄엯?덈떎.',
      '',
      '## 臾몄젣 ?뺤쓽',
      goalText ? `?닿껐?댁빞 ??紐⑺몴: ${goalText}` : '?쒓났??寃곌낵 ?쇰뱶諛깆쓣 諛뷀깢?쇰줈 ?꾨＼?꾪듃瑜?媛쒖꽑?섏꽭??',
      '',
      '## 입력 데이터',
      `?먮낯 ?꾨＼?꾪듃:\n${promptText}`,
      '',
      `寃곌낵:\n${outputText}`,
      '',
      '## ?묒뾽',
      '?ㅼ쓬 ?ㅽ뻾?먯꽌 ???섏? 寃곌낵媛 ?섏삤?꾨줉 ?꾨＼?꾪듃瑜??ㅼ떆 ?묒꽦?섏꽭??',
      '',
      '## ?쒖빟 議곌굔',
      '- ?꾨＼?꾪듃??吏㏃?留?紐낇솗?댁빞 ?⑸땲??',
      '- 異쒕젰 援ъ“瑜?遺꾨챸?섍쾶 ?곸뼱???⑸땲??',
      '- 鍮좎쭊 媛?쒕젅?쇨낵 ?덉떆瑜?異붽??섏꽭??',
      '',
      '## ?ш퀬 諛⑺뼢',
      '- ??寃곌낵媛 ?ㅽ뙣?덈뒗吏 癒쇱? ?먮떒?섏꽭??',
      '- ?꾩슂??援ъ“留?理쒖냼?쒖쑝濡?異붽??섏꽭??',
      '- ?먮낯 ?꾨＼?꾪듃???좎슜??遺遺꾩? ?좎??섏꽭??',
      '',
      '## 異쒕젰 ?뺤떇',
      '- improved_prompt',
      '- issues',
      '- improvements',
      '- next_action',
      '',
      '## ?됯? 湲곗?',
      '- 명확성',
      '- 형식 일치',
      '- 紐⑺몴 ?쇱튂',
      '- ?ㅽ뻾 媛?μ꽦',
      '',
      '## ?덉떆',
      '- ?낅젰 -> 湲곕??섎뒗 異쒕젰 ?숈옉',
    ].join('\n')

    const improvedPrompt = [
      '## 理쒖쟻???꾨＼?꾪듃',
      goalText ? `紐⑺몴: ${goalText}` : '紐⑺몴: ?꾨＼?꾪듃??異쒕젰 ?덉쭏???믪씠湲?',
      '',
      '### 臾몄젣 ?뺤쓽',
      goalText || '?꾩옱 ?꾨＼?꾪듃??援ъ“? 異쒕젰 ?쒖뼱媛 ???꾩슂?⑸땲??',
      '',
      '### 입력 데이터',
      outputText,
      '',
      '### ?묒뾽',
      '?ㅽ뙣 ?먯씤??遺꾩꽍?섍퀬 ?ㅼ쓬 ?ㅽ뻾???꾪븳 ?꾨＼?꾪듃濡??ㅼ떆 ?묒꽦?섏꽭??',
      '',
      '### ?쒖빟 議곌굔',
      '- ?뺤떇, 踰붿쐞, 異쒕젰 湲몄씠瑜?遺꾨챸?섍쾶 ?곸뼱???⑸땲??',
      '- 寃곌낵媛 遺덉븞?뺥븯硫??덉떆瑜?異붽??섏꽭??',
      '- 紐⑺몴瑜??볦낀????蹂듦뎄??吏?쒕? ?ы븿?섏꽭??',
      '',
      '### 출력 스키마',
      '- improved_prompt',
      '- issues',
      '- improvements',
      '- next_action',
      '',
      '### ?됯? 湲곗?',
      '- 명확성',
      '- 실행 가능성',
      '- 목표 일치',
      '- 재사용 가능성',
      '',
      '### 湲곗? ?꾨＼?꾪듃',
      promptText,
    ].join('\n')

    const nextAction = issues.length
      ? `吏묒쨷????ぉ: ${issues.slice(0, 3).join(', ')}`
      : '?섏젙???꾨＼?꾪듃瑜???踰????ㅽ뻾?섍퀬 寃곌낵瑜?鍮꾧탳?섏꽭??'
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
    return c.json({ error: err?.message || '理쒖쟻?붿뿉 ?ㅽ뙣?덉뒿?덈떎.' }, 500)
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
    const tech = TECHNIQUES[techniqueId]
    const autoFields = generateAutoFields(purpose || 'custom', keyword || '', techniqueId)
    const fields = { ...autoFields, ...(inputFields || {}) } as Record<string, string>
    if (!tech) return c.json({ error: '?좏슚?섏? ?딆? 湲곕쾿?낅땲??' }, 400)

    let prompt = ''

    if (techniqueId === 'context-engineering') {
      const sections: string[] = []
      sections.push('# ?꾨줈?앺듃 而⑦뀓?ㅽ듃 臾몄꽌\n')
      if (fields.project_name)  sections.push(`## ?꾨줈?앺듃紐?n${fields.project_name}`)
      if (fields.project_goal)  sections.push(`## ?꾨줈?앺듃 紐⑺몴\n${fields.project_goal}`)
      if (fields.target_user)   sections.push(`## ????ъ슜??n${fields.target_user}`)
      if (fields.tech_stack)    sections.push(`## 湲곗닠 ?ㅽ깮\n${fields.tech_stack}`)
      if (fields.core_features) {
        const flist = fields.core_features.split('\n').filter((s: string) => s.trim())
        sections.push(`## ?듭떖 湲곕뒫\n${flist.map((f: string, i: number) => `${i + 1}. ${f.trim()}`).join('\n')}`)
      }
      if (fields.data_model)    sections.push(`## ?곗씠??紐⑤뜽\n${fields.data_model}`)
      if (fields.constraints)   sections.push(`## ?쒖빟 議곌굔 諛??붽뎄?ы빆\n${fields.constraints}`)
      if (fields.tone)          sections.push(`## 而ㅻ??덉??댁뀡 ??n${fields.tone}`)
      sections.push('\n---\n??而⑦뀓?ㅽ듃瑜?諛뷀깢?쇰줈 ?꾨줈?앺듃瑜??ㅺ퀎?섍퀬 援ы쁽?댁＜?몄슂.\n媛?湲곕뒫???곸꽭 ?ㅽ럺, API ?ㅺ퀎, ?곗씠?곕쿋?댁뒪 ?ㅽ궎留? ?꾨줈?앺듃 援ъ“瑜??ы븿?댁＜?몄슂.')
      prompt = sections.join('\n\n')

    } else if (techniqueId === 'harness') {
      const sections: string[] = []
      if (fields.role)          sections.push(`## ??븷 (Role)\n${fields.role}`)
      if (fields.context)       sections.push(`## 諛곌꼍 而⑦뀓?ㅽ듃 (Context)\n${fields.context}`)
      if (fields.task)          sections.push(`## ?묒뾽 紐⑺몴 (Task)\n${fields.task}`)
      if (fields.goal)          sections.push(`## ?듭떖 紐⑺몴 (Goal)\n${fields.goal}`)
      if (fields.non_goal)      sections.push(`## 鍮꾨ぉ??(Non-Goal)\n${fields.non_goal}`)
      if (fields.must_have)     sections.push(`## Must-have\n${fields.must_have}`)
      if (fields.should_have)   sections.push(`## Should-have\n${fields.should_have}`)
      if (fields.nice_to_have)  sections.push(`## Nice-to-have\n${fields.nice_to_have}`)
      if (fields.input_guardrails)  sections.push(`## ?낅젰 媛?쒕젅??n${fields.input_guardrails}`)
      if (fields.output_guardrails) sections.push(`## 異쒕젰 媛?쒕젅??n${fields.output_guardrails}`)
      if (fields.monitoring_rules)  sections.push(`## 紐⑤땲?곕쭅 洹쒖튃\n${fields.monitoring_rules}`)
      if (fields.rollback_plan)     sections.push(`## 濡ㅻ갚 怨꾪쉷\n${fields.rollback_plan}`)
      if (fields.input_data)    sections.push(`## ?낅젰 ?곗씠??(Input)\n${fields.input_data}`)
      if (fields.output_format) sections.push(`## 異쒕젰 ?뺤떇 (Output Format)\n${fields.output_format}`)
      if (fields.tone)          sections.push(`## ??& ?ㅽ???(Tone)\n${fields.tone}`)
      if (fields.constraints)   sections.push(`## ?쒖빟 議곌굔 (Constraints)\n${fields.constraints}`)
      if (fields.example)       sections.push(`## ?덉떆 (Example)\n${fields.example}`)
      prompt = sections.join('\n\n')

    } else if (techniqueId === 'zero-shot') {
      const parts: string[] = []
      if (fields.role) parts.push(fields.role)
      parts.push('')
      if (fields.task) parts.push(fields.task)
      if (fields.output_format) parts.push(`\n異쒕젰 ?뺤떇: ${fields.output_format}`)
      if (fields.constraints) parts.push(`\n?쒖빟 議곌굔: ${fields.constraints}`)
      prompt = parts.join('\n')

    } else if (techniqueId === 'few-shot') {
      const parts: string[] = []
      if (fields.role) parts.push(fields.role)
      parts.push('')
      if (fields.task) parts.push(fields.task)
      parts.push('')
      if (fields.examples) parts.push(`?덉떆:\n${fields.examples}`)
      parts.push('')
      if (fields.actual_input) parts.push(`?댁젣 ?ㅼ쓬???섑뻾?섏꽭??\n${fields.actual_input}`)
      if (fields.output_format) parts.push(`\n異쒕젰 ?뺤떇: ${fields.output_format}`)
      if (fields.constraints) parts.push(`\n?쒖빟 議곌굔: ${fields.constraints}`)
      prompt = parts.join('\n')

    } else if (techniqueId === 'chain-of-thought') {
      const parts: string[] = []
      if (fields.role) parts.push(fields.role)
      parts.push('')
      if (fields.task) parts.push(fields.task)
      parts.push('')
      parts.push('?④퀎蹂꾨줈 李④렐李④렐 ?앷컖??蹂댁꽭??')
      if (fields.steps) parts.push(fields.steps)
      else parts.push('1?④퀎: 臾몄젣瑜?遺꾩꽍?⑸땲??\n2?④퀎: 媛?ν븳 ?닿껐 諛⑹븞???꾩텧?⑸땲??\n3?④퀎: 理쒖쟻???붾（?섏쓣 ?좏깮?섍퀬 ?ㅻ챸?⑸땲??')
      if (fields.output_format) parts.push(`\n理쒖쥌 ?듬???${fields.output_format} ?뺤떇?쇰줈 ?쒓났?섏꽭??`)
      if (fields.constraints) parts.push(`\n?쒖빟 議곌굔: ${fields.constraints}`)
      prompt = parts.join('\n')

    } else if (techniqueId === 'tree-of-thought') {
      const parts: string[] = []
      if (fields.role) parts.push(fields.role)
      parts.push('')
      parts.push(`臾몄젣: ${fields.task || ''}`)
      parts.push('')
      parts.push('?ㅼ쓬 ?묎렐踰뺤쑝濡?遺꾩꽍?섏꽭??')
      parts.push('')
      if (fields.approaches) parts.push(fields.approaches)
      else parts.push('1. 접근 A: 빠르게 실행\n2. 접근 B: 안정성 중심\n3. 접근 C: 창의성 중심')
      parts.push('')
      parts.push('媛??묎렐踰뺤쓽 ?λ떒?먯쓣 ?됯??섍퀬, 媛???곹빀???닿껐梨낆쓣 ?좏깮?섏뿬 理쒖쥌 ?듬????쒖떆?섏꽭??')
      if (fields.output_format) parts.push(`\n異쒕젰 ?뺤떇: ${fields.output_format}`)
      if (fields.constraints) parts.push(`\n?쒖빟 議곌굔: ${fields.constraints}`)
      prompt = parts.join('\n')

    } else if (techniqueId === 'role-prompting') {
      const parts: string[] = []
      parts.push(`?뱀떊? ${fields.role_detail || '?꾨Ц媛'}?낅땲??`)
      if (fields.expertise) parts.push(fields.expertise)
      parts.push('')
      if (fields.task) parts.push(fields.task)
      if (fields.tone) parts.push(`\n${fields.tone} ?ㅼ쑝濡??듬??섏꽭??`)
      if (fields.output_format) parts.push(`異쒕젰 ?뺤떇: ${fields.output_format}`)
      if (fields.constraints) parts.push(`\n?쒖빟 議곌굔: ${fields.constraints}`)
      prompt = parts.join('\n')

    } else if (techniqueId === 'prompt-chaining') {
      const parts: string[] = ['## ?꾨＼?꾪듃 泥댁씤 援ъ“\n']
      if (fields.task) parts.push(`?꾩껜 紐⑺몴: ${fields.task}\n`)
      if (fields.chain_steps) {
        const steps = fields.chain_steps.split('\n').filter((s: string) => s.trim())
        steps.forEach((step: string, i: number) => {
          parts.push(`### Step ${i + 1}: ${stripStepPrefix(step)}`)
          if (i > 0) parts.push('(?댁쟾 ?④퀎??寃곌낵瑜?諛뷀깢?쇰줈 吏꾪뻾)')
          parts.push('')
        })
      }
      if (fields.output_format) parts.push(`理쒖쥌 異쒕젰 ?뺤떇: ${fields.output_format}`)
      if (fields.constraints) parts.push(`\n?쒖빟 議곌굔: ${fields.constraints}`)
      prompt = parts.join('\n')

    } else if (techniqueId === 'meta-prompting') {
      const parts: string[] = []
      parts.push('?ㅼ쓬 ?꾨＼?꾪듃瑜?遺꾩꽍?섍퀬 媛쒖꽑?댁＜?몄슂:\n')
      parts.push(`?먮낯 ?꾨＼?꾪듃:\n"${fields.original_prompt || ''}"`)
      parts.push('')
      if (fields.improvement_goal) parts.push(`媛쒖꽑 紐⑺몴:\n- ${fields.improvement_goal}`)
      parts.push('')
      parts.push('?ㅼ쓬 愿?먯뿉??媛쒖꽑?섏꽭??\n1. 紐낇솗?깃낵 援ъ껜??n2. 而⑦뀓?ㅽ듃 異⑸텇??n3. 異쒕젰 ?뺤떇 吏??n4. ?좎옱??紐⑦샇???쒓굅')
      parts.push('')
      parts.push('媛쒖꽑???꾨＼?꾪듃? 蹂寃??댁쑀瑜??ㅻ챸?댁＜?몄슂.')
      if (fields.constraints) parts.push(`\n${fields.constraints}`)
      prompt = parts.join('\n')
    }

    // 諛붿씠釉?肄붾뵫 ?ㅻ뜑
    const additionalInputs: string[] = []
    ;(selectedAdvancedFields || []).forEach((item: any, index: number) => {
      const fieldId = item?.id || item?.fieldId || ''
      if (!fieldId) return
      const label = item?.label || fieldId
      const rawValue = String(fields[fieldId] || item?.value || '').trim()
      const fallback = rawValue || '값 없음 - 입력이 비어 있어도 이 항목을 고려하여 작성'
      additionalInputs.push(`${index + 1}. ${label}: ${fallback}`)
    })

    ;(customBlankFields || []).forEach((item: any, index: number) => {
      const fieldId = item?.id || item?.fieldId || `custom_note_${index + 1}`
      const label = item?.label || `추가 입력 ${index + 1}`
      const rawValue = String(fields[fieldId] || item?.value || '').trim()
      const fallback = rawValue || '빈 입력 - 사용자가 내용을 비워두었어도 문맥상 적절한 내용을 보완'
      additionalInputs.push(`${additionalInputs.length + 1}. ${label}: ${fallback}`)
    })

    const legacyNotes = Object.entries(fields)
      .filter(([key, value]) => key.startsWith('custom_note_') && String(value || '').trim())
      .map(([, value]) => String(value).trim())
      .filter(Boolean)
    legacyNotes.forEach((note) => {
      if (!additionalInputs.some((line) => line.includes(note))) {
        additionalInputs.push(`${additionalInputs.length + 1}. ${note}`)
      }
    })

    if (additionalInputs.length) {
      prompt += `\n\n## 추가한 입력 (추가한 입력을 고려할것)\n${additionalInputs.join('\n')}`
    }

    const styleProfile = getPromptStyleProfile(promptStyle || 'gpt', language || 'ko')
    prompt += `\n\n## AI ?ㅽ????꾨━??n${styleProfile.label}\n${styleProfile.lines.join('\n')}`

    const workflowProfile = getWorkflowStateProfile(workflowState, language || 'ko')
    const workflowBlock = [
      '## 작업 상태',
      workflowProfile.title,
      workflowProfile.summary,
      '',
      `## ${workflowProfile.sectionTitle}`,
      ...workflowProfile.bullets.map((line) => `- ${line}`),
    ].join('\n')
    prompt = `${workflowBlock}\n\n${prompt}`

    if (purpose && purpose !== 'custom' && keyword) {
      const purposeInfo = PURPOSE_PRESETS.find(p => p.id === purpose)
      prompt = `[바이브 코딩 프로젝트]\n프로젝트 유형: ${purposeInfo?.label || purpose}\n작업 키워드: ${keyword}\n\n` + prompt
    }

    const qualityReport = analyzePromptQualityEnhanced(prompt, fields)

    // 泥댁씠???④퀎 ?곗씠??
    let chainData = null
    if (techniqueId === 'prompt-chaining' && keyword) {
      const stepsRaw = fields.chain_steps || getChainSteps(purpose || 'custom', keyword)
      const steps = stepsRaw.split('\n').filter((s: string) => s.trim()).map((s: string) => stripStepPrefix(s))
      const role = getRoleForPurpose(purpose || 'custom')
      const purposeInfo = PURPOSE_PRESETS.find(p => p.id === purpose)
      chainData = steps.map((step: string, i: number) => {
        let sp = `${role}\n\n`
        sp += `## Step ${i + 1}/${steps.length}: ${step}\n`
        sp += `?꾨줈?앺듃: ${keyword} (${purposeInfo?.label || ''})\n`
        if (i > 0) sp += `\n[?댁쟾 Step ${i}??寃곌낵瑜?湲곕컲?쇰줈 吏꾪뻾]\n`
        sp += `\n???④퀎瑜??곸꽭???섑뻾?댁＜?몄슂.`
        if (i < steps.length - 1) sp += `\n\n寃곌낵???ㅼ쓬 ?④퀎?먯꽌 ?ъ슜?????덈룄濡?援ъ“?뷀븯?몄슂.`
        if (fields.constraints) sp += `\n\n?쒖빟: ${fields.constraints}`
        return { step: i + 1, title: step, prompt: sp.trim() }
      })
    }

    // 而⑦뀓?ㅽ듃 臾몄꽌 硫뷀?
    let contextDocMeta = null
    if (techniqueId === 'context-engineering') {
      const features = (fields.core_features || '').split('\n').filter((s: string) => s.trim())
      contextDocMeta = {
        filename: `${(fields.project_name || keyword || 'project').replace(/\s+/g, '-').toLowerCase()}-context.md`,
        sections: 8,
        features: features.length,
        tip: '??臾몄꽌瑜?context.md濡???ν븯??AI ?꾧뎄???쒖뒪???꾨＼?꾪듃濡??쒓났?섏꽭??',
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
    return c.json({ error: err?.message || '?앹꽦 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.' }, 500)
  }
})



