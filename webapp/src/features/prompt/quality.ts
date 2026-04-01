type QualityCheck = {
  key: string
  label: string
  passed: boolean
  tip: string
}

type QualityReport = {
  checks: QualityCheck[]
  score: number
  total: number
  percentage: number
  grade: 'S' | 'A' | 'B' | 'C' | 'D'
  summary: string
  suggestions: string[]
  modelHints: Record<string, string[]>
}

function normalizeText(input: string) {
  return String(input || '').trim().replace(/\s+/g, ' ')
}

function includesAny(text: string, tokens: string[]) {
  return tokens.some((token) => text.includes(token))
}

function addCheck(
  checks: QualityCheck[],
  suggestions: string[],
  scoreRef: { value: number },
  key: string,
  label: string,
  passed: boolean,
  tip: string,
  suggestion?: string,
) {
  checks.push({ key, label, passed, tip })
  if (passed) scoreRef.value += 1
  else if (suggestion) suggestions.push(suggestion)
}

function buildGrade(percentage: number): QualityReport['grade'] {
  if (percentage >= 90) return 'S'
  if (percentage >= 75) return 'A'
  if (percentage >= 60) return 'B'
  if (percentage >= 45) return 'C'
  return 'D'
}

function localizeQualityText(text: string, language: string) {
  if (language === 'en') return text
  const map: Record<string, string> = {
    Role: '역할',
    Task: '작업',
    'Output format': '출력 형식',
    Constraints: '제약 조건',
    Context: '맥락',
    'Success criteria': '성공 기준',
    Evaluation: '평가',
    'Self-check': '자체 점검',
    'Uncertainty handling': '불확실성 처리',
    Ambiguity: '모호성',
    'Token efficiency': '토큰 효율',
    'Failure handling': '실패 대응',
    Tone: '톤',
    'Model fit': '모델 적합성',
    'The role is explicit.': '역할이 분명합니다.',
    'Add a clear role or persona.': '명확한 역할이나 페르소나를 추가하세요.',
    'State who the model should be and what perspective it should use.': '모델이 누구의 관점으로 답해야 하는지 적어주세요.',
    'The task is explicit.': '작업이 분명합니다.',
    'Describe the task in one clear sentence.': '작업을 한 문장으로 분명하게 적어주세요.',
    'Define the goal as a concrete action the model can execute.': '모델이 실행할 수 있는 구체적인 행동으로 목표를 적어주세요.',
    'The output format is explicit.': '출력 형식이 분명합니다.',
    'Specify the output format.': '출력 형식을 명시하세요.',
    'State whether the answer should be JSON, markdown, bullets, a table, or another structure.': 'JSON, 마크다운, 목록, 표 등 원하는 구조를 적어주세요.',
    'Constraints are present.': '제약 조건이 있습니다.',
    'Add constraints or guardrails.': '제약 조건이나 가드레일을 추가하세요.',
    'Mention length limits, required items, prohibited items, and any hard boundaries.': '길이 제한, 필수 항목, 금지 항목을 적어주세요.',
    'Enough context is provided.': '맥락이 충분합니다.',
    'Add background or context.': '배경이나 맥락을 추가하세요.',
    'Separate background information from the actual task so the model can orient itself quickly.': '배경 정보와 실제 작업을 분리하면 모델이 더 빨리 이해합니다.',
    'Success criteria are present.': '성공 기준이 있습니다.',
    'Add success criteria.': '성공 기준을 추가하세요.',
    'Explain how the output will be judged or what the result should look like.': '출력을 어떻게 판단할지 적어주세요.',
    'Evaluation criteria are present.': '평가 기준이 있습니다.',
    'Add a rubric or evaluation guide.': '루브릭이나 평가 가이드를 추가하세요.',
    'Describe how to compare answers so the result is easier to verify.': '답변을 비교하는 기준을 적어주세요.',
    'A self-check step is present.': '자체 점검 단계가 있습니다.',
    'Add a short self-check step.': '짧은 자체 점검 단계를 추가하세요.',
    'Ask the model to review its own output before it responds.': '응답 전 자기 검토를 요청하세요.',
    'Uncertainty handling is present.': '불확실성 처리 규칙이 있습니다.',
    'Add a rule for uncertainty or assumptions.': '불확실성이나 가정 처리 규칙을 추가하세요.',
    'State what to do when information is missing, ambiguous, or uncertain.': '정보가 부족하거나 모호할 때 어떻게 할지 적어주세요.',
    'The wording is specific.': '표현이 구체적입니다.',
    'The wording is still vague.': '표현이 아직 모호합니다.',
    'Replace vague phrases with concrete requirements and measurable terms.': '모호한 표현을 측정 가능한 요구사항으로 바꾸세요.',
    'The prompt is concise.': '프롬프트가 간결합니다.',
    'There is avoidable repetition.': '불필요한 반복이 있습니다.',
    'Remove repeated wording and compress long boilerplate where possible.': '중복 문장을 줄이고 긴 설명은 압축하세요.',
    'Failure handling is present.': '실패 대응이 있습니다.',
    'Add fallback or failure handling.': '대체 경로나 실패 대응을 추가하세요.',
    'Explain what to do if the first attempt fails or the result is unusable.': '첫 시도가 실패하거나 결과가 부족할 때 어떻게 할지 적어주세요.',
    'Tone is specified.': '톤이 지정되어 있습니다.',
    'Specify the tone.': '톤을 지정하세요.',
    'Clarify whether the answer should be formal, direct, friendly, or concise.': '답변이 격식 있는지, 직설적인지, 친근한지, 간결한지 적어주세요.',
    'A model target is present.': '모델 대상이 지정되어 있습니다.',
    'Consider tailoring the prompt to a model family.': '모델 계열에 맞춰 프롬프트를 다듬는 것을 고려하세요.',
    'Tune the style and structure for the model you plan to use.': '사용할 모델에 맞게 스타일과 구조를 조정하세요.',
    'The prompt structure is strong and ready to execute.': '프롬프트 구조가 안정적이고 실행 준비가 되어 있습니다.',
    'Needs work:': '개선 필요:',
    'and more': '외',
    'No summary available.': '요약이 없습니다.',
    Summary: '요약',
    Suggestions: '다음 개선',
    'Add a clear role or persona in one sentence.': '명확한 역할이나 페르소나를 한 문장으로 추가하세요.',
    'Separate role, context, and constraints into distinct blocks.': '역할, 맥락, 제약 조건을 분리해서 작성하세요.',
    'State the task and expected output structure up front.': '작업과 기대되는 출력 구조를 먼저 적어주세요.',
    'Add a visible output format section.': '출력 형식 섹션을 추가하세요.',
    'Describe the expected structure of the answer.': '답변의 구조를 분명하게 설명하세요.',
    'Specify the shape of the response before the task starts.': '작업 전에 응답 형태를 명시하세요.',
    'Add length limits and prohibited items.': '길이 제한과 금지 항목을 추가하세요.',
    'Split hard constraints from optional preferences.': '필수 제약과 선택 사항을 분리하세요.',
    'Say what should not happen as well as what should happen.': '해야 할 것뿐 아니라 하지 말아야 할 것도 적어주세요.',
    'Add a success rubric and a quick self-check.': '성공 기준과 짧은 자체 점검을 추가하세요.',
    'Make the acceptance criteria explicit.': '수용 기준을 분명하게 적어주세요.',
    'Add a simple verification step before the final answer.': '최종 답변 전에 간단한 검증 단계를 추가하세요.',
  }
  return map[text] || text
}

export function buildPromptVerificationBlock(language: string) {
  const english = language === 'en'
  return english
    ? [
        '## Final verification',
        '- Is the goal and success criteria explicit?',
        '- Is the output format, length, and tone explicit?',
        '- Are constraints, assumptions, and exclusions explicit?',
        '- Are the input data and examples separated cleanly?',
        '- Is there a rubric or checklist for judging the result?',
        '- If anything is missing, fill it in before answering.',
      ].join('\n')
    : [
        '## 최종 검증',
        '- 목표와 성공 기준이 분명한가?',
        '- 출력 형식, 길이, 어조가 분명한가?',
        '- 제약 조건, 가정, 제외 항목이 분명한가?',
        '- 입력 데이터와 예시가 분리되어 있는가?',
        '- 결과를 판단할 기준표나 체크리스트가 있는가?',
        '- 빠진 부분이 있으면 답변 전에 먼저 채웠는가?',
      ].join('\n')
}

export function analyzePromptQualityEnhanced(prompt: string, fields: Record<string, string>, language = 'ko') {
  const text = String(prompt || '').trim()
  const normalized = normalizeText(text)
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)

  const checks: QualityCheck[] = []
  const suggestions: string[] = []
  const modelHints: Record<string, string[]> = { gpt: [], claude: [], gemini: [] }
  const scoreRef = { value: 0 }

  const hasRole = Boolean(
    fields.role ||
      fields.role_detail ||
      fields.project_name ||
      /you are|as an?|role:/i.test(text),
  )
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'role',
    'Role',
    hasRole,
    hasRole ? 'The role is explicit.' : 'Add a clear role or persona.',
    'State who the model should be and what perspective it should use.',
  )

  const taskText = normalizeText(fields.task || fields.project_goal || fields.goal || '')
  const hasTask = taskText.length > 20 || includesAny(normalized, [
    'output',
    'analyze',
    'generate',
    'summarize',
    'design',
    'compare',
    'evaluate',
    'build',
    'create',
    'write',
    'plan',
    'draft',
  ])
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'task',
    'Task',
    hasTask,
    hasTask ? 'The task is explicit.' : 'Describe the task in one clear sentence.',
    'Define the goal as a concrete action the model can execute.',
  )

  const hasOutput = Boolean(
    fields.output_format ||
      includesAny(normalized, ['json', 'markdown', 'table', 'bullet', 'steps', 'schema', 'format', 'template']),
  )
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'output_format',
    'Output format',
    hasOutput,
    hasOutput ? 'The output format is explicit.' : 'Specify the output format.',
    'State whether the answer should be JSON, markdown, bullets, a table, or another structure.',
  )

  const hasConstraints = Boolean(
    fields.constraints ||
      fields.input_guardrails ||
      fields.output_guardrails ||
      includesAny(normalized, ['must', 'should', 'avoid', 'do not', 'limit', 'at least', 'under', 'over']),
  )
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'constraints',
    'Constraints',
    hasConstraints,
    hasConstraints ? 'Constraints are present.' : 'Add constraints or guardrails.',
    'Mention length limits, required items, prohibited items, and any hard boundaries.',
  )

  const hasContext = Boolean(
    fields.context ||
      fields.expertise ||
      fields.core_features ||
      fields.project_goal ||
      fields.project_name ||
      lines.length > 4,
  )
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'context',
    'Context',
    hasContext,
    hasContext ? 'Enough context is provided.' : 'Add background or context.',
    'Separate background information from the actual task so the model can orient itself quickly.',
  )

  const hasSuccessCriteria = Boolean(
    fields.success_criteria ||
      fields.acceptance_criteria ||
      includesAny(normalized, ['success criteria', 'acceptance criteria', '성공 기준', '합격 기준']),
  )
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'success_criteria',
    'Success criteria',
    hasSuccessCriteria,
    hasSuccessCriteria ? 'Success criteria are present.' : 'Add success criteria.',
    'Explain how the output will be judged or what “done” looks like.',
  )

  const hasEvaluation = Boolean(
    fields.evaluation || fields.rubric || includesAny(normalized, ['evaluation criteria', 'rubric', '평가 기준', '체크리스트']),
  )
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'evaluation',
    'Evaluation',
    hasEvaluation,
    hasEvaluation ? 'Evaluation criteria are present.' : 'Add a rubric or evaluation guide.',
    'Describe how to compare answers so the result is easier to verify.',
  )

  const hasSelfCheck = Boolean(
    fields.self_check ||
      includesAny(normalized, ['self-check', 'self check', 'checklist', '자가 점검', '최종 검증']),
  )
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'self_check',
    'Self-check',
    hasSelfCheck,
    hasSelfCheck ? 'A self-check step is present.' : 'Add a short self-check step.',
    'Ask the model to review its own output before it responds.',
  )

  const hasUncertainty = Boolean(
    fields.uncertainty_rule ||
      includesAny(normalized, ['uncertain', 'uncertainty', '[uncertain]', 'assumption', '가정', '불확실']),
  )
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'uncertainty',
    'Uncertainty handling',
    hasUncertainty,
    hasUncertainty ? 'Uncertainty handling is present.' : 'Add a rule for uncertainty or assumptions.',
    'State what to do when information is missing, ambiguous, or uncertain.',
  )

  const ambiguous = [
    /\b(something|someone|stuff|things|etc|whatever|good|nice|appropriate|maybe|possibly)\b/i,
    /뭔가|적당히|좋게|대충|예쁘게|알아서|적절히/,
  ].some((pattern) => pattern.test(normalized))
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'ambiguity',
    'Ambiguity',
    !ambiguous,
    ambiguous ? 'The wording is still vague.' : 'The wording is specific.',
    'Replace vague phrases with concrete requirements and measurable terms.',
  )

  const repeatedLines = lines.filter((line, index) => lines.indexOf(line) !== index).length
  const tokenWaste = normalized.length > 1200 || repeatedLines > 0 || /very very|please please/i.test(normalized)
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'token_waste',
    'Token efficiency',
    !tokenWaste,
    tokenWaste ? 'There is avoidable repetition.' : 'The prompt is concise.',
    'Remove repeated wording and compress long boilerplate where possible.',
  )

  const hasFailure = Boolean(
    fields.rollback_plan ||
      fields.feedback_loop ||
      includesAny(normalized, ['failure', 'rollback', 'fallback', 'retry', 'if it fails', '실패', '예외', '재시도']),
  )
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'failure_boundaries',
    'Failure handling',
    hasFailure,
    hasFailure ? 'Failure handling is present.' : 'Add fallback or failure handling.',
    'Explain what to do if the first attempt fails or the result is unusable.',
  )

  const hasTone = Boolean(fields.tone || includesAny(normalized, ['tone', '어조', '말투', '문체']))
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'tone',
    'Tone',
    hasTone,
    hasTone ? 'Tone is specified.' : 'Specify the tone.',
    'Clarify whether the answer should be formal, direct, friendly, or concise.',
  )

  const hasModelTarget = Boolean(fields.model_target || includesAny(normalized, ['gpt', 'claude', 'gemini', 'genspark']))
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'model_target',
    'Model fit',
    hasModelTarget,
    hasModelTarget ? 'A model target is present.' : 'Consider tailoring the prompt to a model family.',
    'Tune the style and structure for the model you plan to use.',
  )

  if (!hasRole) {
    modelHints.gpt.push('Add a clear role or persona in one sentence.')
    modelHints.claude.push('Separate role, context, and constraints into distinct blocks.')
    modelHints.gemini.push('State the task and expected output structure up front.')
  }
  if (!hasOutput) {
    modelHints.gpt.push('Add a visible output format section.')
    modelHints.claude.push('Describe the expected structure of the answer.')
    modelHints.gemini.push('Specify the shape of the response before the task starts.')
  }
  if (!hasConstraints) {
    modelHints.gpt.push('Add length limits and prohibited items.')
    modelHints.claude.push('Split hard constraints from optional preferences.')
    modelHints.gemini.push('Say what should not happen as well as what should happen.')
  }
  if (!hasSuccessCriteria || !hasEvaluation || !hasSelfCheck) {
    modelHints.gpt.push('Add a success rubric and a quick self-check.')
    modelHints.claude.push('Make the acceptance criteria explicit.')
    modelHints.gemini.push('Add a simple verification step before the final answer.')
  }

  const total = checks.length
  const percentage = Math.round((scoreRef.value / total) * 100)
  const grade = buildGrade(percentage)
  const failedLabels = checks.filter((check) => !check.passed).map((check) => check.label)
  const summary = failedLabels.length
    ? `Needs work: ${failedLabels.slice(0, 3).join(', ')}${failedLabels.length > 3 ? ' and more' : ''}`
    : 'The prompt structure is strong and ready to execute.'

  const localizedChecks = checks.map((check) => ({
    ...check,
    label: localizeQualityText(check.label, language),
    tip: localizeQualityText(check.tip, language),
  }))
  const localizedSuggestions = suggestions.map((item) => localizeQualityText(item, language))
  const localizedHints = Object.fromEntries(
    Object.entries(modelHints).map(([key, hints]) => [key, hints.map((hint) => localizeQualityText(hint, language))]),
  )

  return {
    checks: localizedChecks,
    score: scoreRef.value,
    total,
    percentage,
    grade,
    summary: localizeQualityText(summary, language),
    suggestions: localizedSuggestions,
    modelHints: localizedHints,
  } satisfies QualityReport
}

export function getPromptTips(techniqueId: string): string[] {
  const tipsMap: Record<string, string[]> = {
    'zero-shot': [
      '명확하고 구체적인 지시를 사용하세요.',
      '모호한 표현 대신 정확한 용어를 사용하세요.',
      '한 번에 하나의 작업만 요청하면 효과적입니다.',
    ],
    'few-shot': [
      '예시는 2~5개가 적당합니다.',
      '예시의 형식을 일관되게 유지하세요.',
      '다양한 케이스를 포함하면 결과가 안정적입니다.',
    ],
    'chain-of-thought': [
      '"단계별로 생각해보세요"라는 지시가 핵심입니다.',
      '각 단계가 논리적으로 연결되도록 하세요.',
      '수학, 논리, 코드 디버깅에 특히 효과적입니다.',
    ],
    'tree-of-thought': [
      '최소 3가지 이상의 접근법을 제시하세요.',
      '각 접근법이 서로 다른 관점을 반영하도록 하세요.',
      '비교 기준을 명시하면 더 좋은 결과를 얻을 수 있습니다.',
    ],
    'role-prompting': [
      '구체적인 경력과 전문 분야를 명시하세요.',
      '역할에 맞는 페르소나를 자세히 설정하세요.',
      '복합 역할도 가능합니다.',
    ],
    'prompt-chaining': [
      '각 단계의 출력이 다음 단계의 입력이 됩니다.',
      '단계를 3~5개로 나누는 것이 적당합니다.',
      '복잡한 프로젝트 기획에 매우 효과적입니다.',
    ],
    'meta-prompting': [
      '원본 프롬프트를 먼저 사용해보고 개선하세요.',
      'AI에게 변경 이유를 설명하도록 요청하세요.',
      '반복적으로 개선하면 더 좋은 결과를 얻을 수 있습니다.',
    ],
    'context-engineering': [
      '프로젝트 전체 맥락을 먼저 설정하세요.',
      '이 문서를 시스템 프롬프트처럼 사용할 수 있습니다.',
      '기술 스택과 데이터 모델을 구체적으로 작성하면 효과가 큽니다.',
    ],
    harness: [
      '모든 섹션을 채울수록 좋습니다.',
      '프로젝트 전체 컨텍스트를 먼저 정리하세요.',
      '이 방식은 다른 기법들의 요소를 종합한 것입니다.',
    ],
  }
  return tipsMap[techniqueId] || tipsMap['zero-shot']
}
