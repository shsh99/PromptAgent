import { TECHNIQUES, PURPOSE_PRESETS } from './data'
import {
  generateAutoFields,
  analyzePromptQualityEnhanced,
  getPromptTips,
  getRoleForPurpose,
  getChainSteps,
  getCoreFeatures,
  getDataModel,
  getTechStack,
  getTargetUser,
} from './helpers'

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

function getWorkflowStateProfile(state: string) {
  const normalized = String(state || 'new').toLowerCase()
  const profiles = {
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
  } as const
  return profiles[normalized as keyof typeof profiles] || profiles.new
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

type GenerateArgs = {
  techniqueId: string
  inputFields: Record<string, string>
  purpose: string
  keyword: string
  language: string
  promptStyle: string
  workflowState: string
  selectedAdvancedFields?: any[]
  customBlankFields?: any[]
}

export function buildGenerateResult(args: GenerateArgs) {
  const {
    techniqueId,
    inputFields,
    purpose,
    keyword,
    language,
    promptStyle,
    workflowState,
    selectedAdvancedFields = [],
    customBlankFields = [],
  } = args

  const tech = TECHNIQUES[techniqueId]
  const autoFields = generateAutoFields(purpose || 'custom', keyword || '', techniqueId)
  const fields = { ...autoFields, ...(inputFields || {}) } as Record<string, string>
  if (!tech) {
    return { error: '유효하지 않은 기술입니다.' }
  }

  let prompt = ''

  if (techniqueId === 'context-engineering') {
    const sections: string[] = []
    sections.push('# 프로젝트 컨텍스트 문서')
    if (fields.project_name) sections.push(`## 프로젝트명\n${fields.project_name}`)
    if (fields.project_goal) sections.push(`## 프로젝트 목표\n${fields.project_goal}`)
    if (fields.target_user) sections.push(`## 대상 사용자\n${fields.target_user}`)
    if (fields.tech_stack) sections.push(`## 기술 스택\n${fields.tech_stack}`)
    if (fields.core_features) {
      const flist = fields.core_features.split('\n').filter((s: string) => s.trim())
      sections.push(`## 핵심 기능\n${flist.map((f: string, i: number) => `${i + 1}. ${f.trim()}`).join('\n')}`)
    }
    if (fields.data_model) sections.push(`## 데이터 모델\n${fields.data_model}`)
    if (fields.constraints) sections.push(`## 제약 조건 및 요구사항\n${fields.constraints}`)
    if (fields.tone) sections.push(`## 커뮤니케이션 톤\n${fields.tone}`)
    sections.push('---')
    sections.push('이 문서를 바탕으로 프로젝트를 구조화하고 구현하세요.')
    sections.push('각 기능별 세부 스텝, API 설계, 데이터베이스 스키마, 운영 관점을 포함하세요.')
    prompt = sections.join('\n\n')
  } else if (techniqueId === 'harness') {
    const sections: string[] = []
    if (fields.role) sections.push(`## 역할 (Role)\n${fields.role}`)
    if (fields.context) sections.push(`## 배경 컨텍스트 (Context)\n${fields.context}`)
    if (fields.task) sections.push(`## 작업 목표 (Task)\n${fields.task}`)
    if (fields.goal) sections.push(`## 핵심 목표 (Goal)\n${fields.goal}`)
    if (fields.non_goal) sections.push(`## 비목표 (Non-Goal)\n${fields.non_goal}`)
    if (fields.must_have) sections.push(`## Must-have\n${fields.must_have}`)
    if (fields.should_have) sections.push(`## Should-have\n${fields.should_have}`)
    if (fields.nice_to_have) sections.push(`## Nice-to-have\n${fields.nice_to_have}`)
    if (fields.input_guardrails) sections.push(`## 입력 가드레일\n${fields.input_guardrails}`)
    if (fields.output_guardrails) sections.push(`## 출력 가드레일\n${fields.output_guardrails}`)
    if (fields.monitoring_rules) sections.push(`## 모니터링 규칙\n${fields.monitoring_rules}`)
    if (fields.rollback_plan) sections.push(`## 롤백 계획\n${fields.rollback_plan}`)
    if (fields.input_data) sections.push(`## 입력 데이터 (Input)\n${fields.input_data}`)
    if (fields.output_format) sections.push(`## 출력 형식 (Output Format)\n${fields.output_format}`)
    if (fields.tone) sections.push(`## 톤 & 스타일 (Tone)\n${fields.tone}`)
    if (fields.constraints) sections.push(`## 제약 조건 (Constraints)\n${fields.constraints}`)
    if (fields.example) sections.push(`## 예시 (Example)\n${fields.example}`)
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
    if (fields.actual_input) parts.push(`실제 입력:\n${fields.actual_input}`)
    if (fields.output_format) parts.push(`\n출력 형식: ${fields.output_format}`)
    if (fields.constraints) parts.push(`\n제약 조건: ${fields.constraints}`)
    prompt = parts.join('\n')
  } else if (techniqueId === 'chain-of-thought') {
    const parts: string[] = []
    if (fields.role) parts.push(fields.role)
    parts.push('')
    if (fields.task) parts.push(fields.task)
    parts.push('')
    parts.push('단계별로 차근차근 생각해보세요.')
    if (fields.steps) parts.push(fields.steps)
    else parts.push('1단계: 문제를 분석합니다.\n2단계: 가능한 해결책을 정리합니다.\n3단계: 최적의 답을 선택하고 설명합니다.')
    if (fields.output_format) parts.push(`\n최종 답변은 ${fields.output_format} 형식으로 제공하세요.`)
    if (fields.constraints) parts.push(`\n제약 조건: ${fields.constraints}`)
    prompt = parts.join('\n')
  } else if (techniqueId === 'tree-of-thought') {
    const parts: string[] = []
    if (fields.role) parts.push(fields.role)
    parts.push('')
    parts.push(`문제: ${fields.task || ''}`)
    parts.push('')
    parts.push('다음 여러 접근법을 비교해보세요.')
    parts.push('')
    if (fields.approaches) parts.push(fields.approaches)
    else parts.push('1. 접근 A: 빠르게 실행\n2. 접근 B: 안정성 중심\n3. 접근 C: 창의성 중심')
    parts.push('')
    parts.push('각 접근법의 장단점을 평가하고, 가장 적합한 선택지를 고른 뒤 이유를 설명하세요.')
    if (fields.output_format) parts.push(`\n출력 형식: ${fields.output_format}`)
    if (fields.constraints) parts.push(`\n제약 조건: ${fields.constraints}`)
    prompt = parts.join('\n')
  } else if (techniqueId === 'role-prompting') {
    const parts: string[] = []
    parts.push(`당신은 ${fields.role_detail || '전문가'}입니다.`)
    if (fields.expertise) parts.push(fields.expertise)
    parts.push('')
    if (fields.task) parts.push(fields.task)
    if (fields.tone) parts.push(`\n${fields.tone} 말투로 답변하세요.`)
    if (fields.output_format) parts.push(`출력 형식: ${fields.output_format}`)
    if (fields.constraints) parts.push(`\n제약 조건: ${fields.constraints}`)
    prompt = parts.join('\n')
  } else if (techniqueId === 'prompt-chaining') {
    const parts: string[] = ['## 프롬프트 체이닝 구조\n']
    if (fields.task) parts.push(`## 전체 목표\n${fields.task}\n`)
    if (fields.chain_steps) {
      const steps = fields.chain_steps.split('\n').filter((s: string) => s.trim())
      steps.forEach((step: string, i: number) => {
        parts.push(`### Step ${i + 1}: ${stripStepPrefix(step)}`)
        if (i > 0) parts.push('이전 단계의 결과를 바탕으로 이어서 진행하세요.')
        parts.push('')
      })
    }
    if (fields.output_format) parts.push(`## 최종 출력 형식\n${fields.output_format}`)
    if (fields.constraints) parts.push(`\n제약 조건: ${fields.constraints}`)
    prompt = parts.join('\n')
  } else if (techniqueId === 'meta-prompting') {
    const parts: string[] = []
    parts.push('다음 프롬프트를 분석하고 개선하세요.\n')
    parts.push(`## 원본 프롬프트\n"${fields.original_prompt || ''}"`)
    parts.push('')
    if (fields.improvement_goal) parts.push(`## 개선 목표\n- ${fields.improvement_goal}`)
    parts.push('')
    parts.push('다음 관점에서 개선하세요.')
    parts.push('1. 명확성')
    parts.push('2. 컨텍스트 충분성')
    parts.push('3. 출력 형식의 일관성')
    parts.push('4. 불필요한 모호성 제거')
    parts.push('')
    parts.push('개선한 이유도 함께 설명하세요.')
    if (fields.constraints) parts.push(`\n${fields.constraints}`)
    prompt = parts.join('\n')
  }

  const additionalInputs: string[] = []
  selectedAdvancedFields.forEach((item: any, index: number) => {
    const fieldId = item?.id || item?.fieldId || ''
    if (!fieldId) return
    const label = item?.label || fieldId
    const rawValue = String(fields[fieldId] || item?.value || '').trim()
    const fallback = rawValue || '값 없음 - 입력이 비어 있어도 이 항목을 고려하여 작성'
    additionalInputs.push(`${index + 1}. ${label}: ${fallback}`)
  })

  customBlankFields.forEach((item: any, index: number) => {
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
  prompt += `\n\n## AI 스타일 가이드\n${styleProfile.label}\n${styleProfile.lines.join('\n')}`

  const workflowProfile = getWorkflowStateProfile(workflowState)
  const workflowBlock = [
    '## 작업 상태',
    workflowProfile.title,
    workflowProfile.summary,
    '',
    `## ${workflowProfile.sectionTitle}`,
    ...workflowProfile.bullets.map((line) => `- ${line}`),
    ...(workflowProfile.exampleLines?.length
      ? ['', `## ${workflowProfile.exampleTitle || '예시 입력'}`, ...workflowProfile.exampleLines]
      : []),
  ].join('\n')
  prompt = `${workflowBlock}\n\n${prompt}`

  if (purpose && purpose !== 'custom' && keyword) {
    const purposeInfo = PURPOSE_PRESETS.find((p) => p.id === purpose)
    prompt = `[바이브 코딩 프로젝트]\n프로젝트 유형: ${purposeInfo?.label || purpose}\n작업 키워드: ${keyword}\n\n${prompt}`
  }

  const qualityReport = analyzePromptQualityEnhanced(prompt, fields)

  let chainData: any = null
  if (techniqueId === 'prompt-chaining' && keyword) {
    const stepsRaw = fields.chain_steps || getChainSteps(purpose || 'custom', keyword)
    const steps = stepsRaw.split('\n').filter((s: string) => s.trim()).map((s: string) => stripStepPrefix(s))
    const role = getRoleForPurpose(purpose || 'custom')
    const purposeInfo = PURPOSE_PRESETS.find((p) => p.id === purpose)
    chainData = steps.map((step: string, i: number) => {
      let sp = `${role}\n\n`
      sp += `## Step ${i + 1}/${steps.length}: ${step}\n`
      sp += `프로젝트: ${keyword} (${purposeInfo?.label || ''})\n`
      if (i > 0) sp += `\n[이전 Step ${i}의 결과를 바탕으로 진행]\n`
      sp += `\n이 단계를 구체적으로 실행 가능한 형태로 작성하세요.`
      if (i < steps.length - 1) sp += `\n\n다음 단계에서 활용할 수 있도록 핵심만 정리하세요.`
      if (fields.constraints) sp += `\n\n제약: ${fields.constraints}`
      return { step: i + 1, title: step, prompt: sp.trim() }
    })
  }

  let contextDocMeta: any = null
  if (techniqueId === 'context-engineering') {
    const features = (fields.core_features || '').split('\n').filter((s: string) => s.trim())
    contextDocMeta = {
      filename: `${(fields.project_name || keyword || 'project').replace(/\s+/g, '-').toLowerCase()}-context.md`,
      sections: 8,
      features: features.length,
      tip: '이 문서를 context.md로 저장하면 AI가 프로젝트 맥락을 더 안정적으로 이해할 수 있습니다.',
    }
  }

  return {
    prompt: applyPromptLanguage(prompt.trim(), language || 'ko'),
    technique: { name: tech.name, nameEn: tech.nameEn },
    qualityReport,
    tips: getPromptTips(techniqueId),
    chainData,
    contextDocMeta,
    language: language || 'ko',
  }
}

type ImproveArgs = { prompt: string; goal?: string; language?: string }

export function buildImproveResult(args: ImproveArgs) {
  const { prompt, goal } = args
  const lines = String(prompt).trim().split('\n').map((l) => l.trim()).filter(Boolean)
  const inferredGoal = goal?.trim() || '출력 형식과 목적이 분명한 개선된 프롬프트'
  const improvedPrompt = [
    '## 역할',
    '당신은 주어진 목표를 더 명확하고 실행 가능하게 다듬는 전문 AI 프롬프트 개선자입니다.',
    '',
    '## 작업 목표',
    inferredGoal,
    '',
    '## 원본 요청 요약',
    ...lines.slice(0, 6).map((l) => `- ${l}`),
    '',
    '## 실행 지침',
    '- 프롬프트를 바로 실행 가능한 작업 단위로 정리하세요.',
    '- 모호한 표현은 줄이고 구체적인 지시로 바꾸세요.',
    '- 필요하면 체크리스트를 포함하세요.',
    '- 출력은 실행 가능한 형태로 유지하세요.',
    '',
    '## 출력 형식',
    '- 개선된 프롬프트',
    '- 바뀐 점',
    '- 주의할 점 또는 제약 조건',
    '',
    '## 제약 조건',
    '- 근거 없는 내용을 추가하지 마세요.',
    '- 필요한 정보가 부족하면 질문을 먼저 제안하세요.',
    '- 불필요한 장황함 없이 명확하게 작성하세요.',
    '',
    '## 원본 프롬프트',
    String(prompt).trim(),
  ].join('\n')
  return { improvedPrompt }
}

type OptimizeArgs = { prompt: string; output: string; goal?: string; modelTarget?: string; language?: string }

export function buildOptimizeResult(args: OptimizeArgs) {
  const { prompt, output, goal, modelTarget, language } = args
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
    improvements.push('출력 길이와 제약을 더 구체적으로 정의하세요.')
  }
  if (/[{[]/.test(goalText) && !/[{[]/.test(outputText)) {
    issues.push('format_mismatch')
    improvements.push('JSON 또는 표 형식 등 목표한 출력 구조를 명시하세요.')
  }
  if (!lowerOutput.includes(lowerGoal.split(/\s+/).filter(Boolean)[0] || '')) {
    issues.push('goal_alignment')
    improvements.push('목표와 직접 연결되는 핵심 문구를 출력 지침에 포함하세요.')
  }
  if (
    !['step', 'steps', 'step-by-step'].some((token) => lowerPrompt.includes(token)) &&
    !lowerPrompt.includes('단계') &&
    !lowerPrompt.includes('순서')
  ) {
    issues.push('reasoning_missing')
    improvements.push('단계별 사고 또는 실행 순서를 추가하세요.')
  }
  if (!['example', 'input', 'output'].some((token) => lowerPrompt.includes(token)) && !lowerPrompt.includes('예시')) {
    improvements.push('예시 입력과 출력 예시를 하나 추가하면 결과 안정성이 높아집니다.')
  }

  const optimizeSeed = [
    '## 역할',
    '당신은 주어진 프롬프트를 실제 실행 결과 기준으로 개선하는 전문가입니다.',
    '',
    '## 문제 정의',
    goalText ? `달성해야 할 목표: ${goalText}` : '성공한 결과를 바탕으로 프롬프트를 개선하세요.',
    '',
    '## 입력 데이터',
    `원본 프롬프트:\n${promptText}`,
    '',
    `결과:\n${outputText}`,
    '',
    '## 작업',
    '다음 실행에서 더 좋은 결과가 나오도록 프롬프트를 다시 작성하세요.',
    '',
    '## 제약 조건',
    '- 프롬프트의 의도를 유지하되 더 명확하게 만드세요.',
    '- 출력 구조를 분명하게 만드세요.',
    '- 필요한 경우 예시와 체크리스트를 추가하세요.',
    '',
    '## 출력 형식',
    '- improved_prompt',
    '- issues',
    '- improvements',
    '- next_action',
    '',
    '## 평가 기준',
    '- 명확성',
    '- 형식 일치',
    '- 목표 일치',
    '- 실행 가능성',
    '',
    '## 예시',
    '- 입력과 출력의 차이를 반영해 개선합니다.',
  ].join('\n')

  const improvedPrompt = [
    '## 최적화 프롬프트',
    goalText ? `목표: ${goalText}` : '목표: 프롬프트의 실행 품질을 높이기',
    '',
    '### 문제 정의',
    goalText || '현재 프롬프트의 구조와 출력 품질을 더 높여야 합니다.',
    '',
    '### 입력 데이터',
    outputText,
    '',
    '### 작업',
    '실패 원인을 분석하고 다음 실행을 위한 개선된 프롬프트를 제안하세요.',
    '',
    '### 제약 조건',
    '- 형식, 범위, 출력 길이를 분명하게 작성하세요.',
    '- 결과가 불안정하면 예시를 추가하세요.',
    '- 목표를 직접적으로 달성할 수 있도록 구성하세요.',
    '',
    '### 출력 스키마',
    '- improved_prompt',
    '- issues',
    '- improvements',
    '- next_action',
    '',
    '### 평가 기준',
    '- 명확성',
    '- 실행 가능성',
    '- 목표 일치',
    '- 재사용 가능성',
    '',
    '### 기준 프롬프트',
    promptText,
  ].join('\n')

  const nextAction = issues.length
    ? `집중 개선 항목: ${issues.slice(0, 3).join(', ')}`
    : '수정한 프롬프트를 다시 실행하고 결과를 비교하세요.'
  const score = Math.max(0, 100 - issues.length * 18)
  const promptLanguage = language || 'ko'
  const localizedIssues = promptLanguage === 'en' ? issues.map((item) => applyPromptLanguage(item, promptLanguage)) : issues
  const localizedImprovements =
    promptLanguage === 'en' ? improvements.map((item) => applyPromptLanguage(item, promptLanguage)) : improvements
  const localizedNextAction = promptLanguage === 'en' ? applyPromptLanguage(nextAction, promptLanguage) : nextAction
  const localizedOptimizeSeed = applyPromptLanguage(optimizeSeed, promptLanguage)
  const localizedImprovedPrompt = applyPromptLanguage(improvedPrompt, promptLanguage)

  return {
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
  }
}

type ChainArgs = { purpose: string; keyword: string; fields: Record<string, string>; language: string }

export function buildChainResult(args: ChainArgs) {
  const { purpose, keyword, fields, language } = args
  const p = PURPOSE_PRESETS.find((pp) => pp.id === purpose)
  const purposeLabel = p?.label || purpose || '프롬프트'
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

  return {
    totalSteps: steps.length,
    project: keyword,
    purpose: purposeLabel,
    chainPrompts,
    language: language || 'ko',
  }
}

type ContextArgs = { purpose: string; keyword: string; fields: Record<string, string>; language: string }

export function buildContextDocResult(args: ContextArgs) {
  const { purpose, keyword, fields, language } = args
  const p = PURPOSE_PRESETS.find((pp) => pp.id === purpose)
  const purposeLabel = p?.label || purpose || '프롬프트'
  const projectName = fields?.project_name || keyword
  const projectGoal = fields?.project_goal || `${purposeLabel} 분야에서 "${keyword}"을(를) 구현하는 프로젝트`
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
  String(techStack)
    .split(',')
    .map((t: string) => t.trim())
    .filter(Boolean)
    .forEach((t: string) => doc.push('- ' + t))
  doc.push('')
  doc.push('## 3. 핵심 기능')
  features.forEach((feature: string, index: number) => {
    doc.push('### 3.' + (index + 1) + '. ' + feature)
    doc.push('- 상세 설명: AI가 자동으로 채울 수 있는 영역입니다.')
    doc.push('- 우선순위: 프로젝트 초기에는 핵심 기능을 먼저 구현하세요.')
    doc.push('')
  })
  doc.push('## 4. 데이터 모델')
  String(dataModel)
    .split('\n')
    .map((s: string) => s.trim())
    .filter(Boolean)
    .forEach((item: string) => doc.push('- ' + item))
  doc.push('')
  doc.push('## 5. 제약 조건 및 요구사항')
  String(constraints)
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean)
    .forEach((item: string) => doc.push('- ' + item))
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

  return {
    document: applyPromptLanguage(doc.join('\n'), language || 'ko'),
    filename: projectName.replace(/\s+/g, '-').toLowerCase() + '-context.md',
    sections: 8,
    features: features.length,
    language: language || 'ko',
  }
}
