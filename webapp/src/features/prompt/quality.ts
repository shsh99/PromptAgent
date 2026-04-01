export type QualityCheck = {
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

type Language = 'ko' | 'en'

function normalizeText(input: string) {
  return String(input || '').trim().replace(/\s+/g, ' ')
}

function includesAny(text: string, tokens: string[]) {
  return tokens.some((token) => text.includes(token))
}

function labelFor(language: Language, ko: string, en: string) {
  return language === 'en' ? en : ko
}

function tipFor(language: Language, ko: string, en: string) {
  return language === 'en' ? en : ko
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
  if (passed) {
    scoreRef.value += 1
  } else if (suggestion) {
    suggestions.push(suggestion)
  }
}

function buildGrade(percentage: number): QualityReport['grade'] {
  if (percentage >= 90) return 'S'
  if (percentage >= 75) return 'A'
  if (percentage >= 60) return 'B'
  if (percentage >= 45) return 'C'
  return 'D'
}

export function buildPromptVerificationBlock(language: string) {
  const english = language === 'en'
  return english
    ? [
        '## Final verification',
        '- Is the goal and success criteria explicit?',
        '- Is the problem definition explicit?',
        '- Is the input data separated from the task?',
        '- Is the reasoning direction or workflow explicit?',
        '- Is the output format, length, and tone explicit?',
        '- Are constraints, assumptions, and exclusions explicit?',
        '- Are the examples separated cleanly from the task?',
        '- Is there a rubric or checklist for judging the result?',
        '- Is there a recovery path if the first answer is weak?',
        '- If anything is missing, fill it in before answering.',
      ].join('\n')
    : [
        '## 최종 검증',
        '- 목표와 성공 기준이 분명한가?',
        '- 문제 정의가 분명한가?',
        '- 입력 데이터가 작업과 분리되어 있는가?',
        '- 추론 방향이나 작업 흐름이 분명한가?',
        '- 출력 형식, 길이, 톤이 분명한가?',
        '- 제약 조건, 가정, 제외 항목이 분명한가?',
        '- 예시가 작업 본문과 분리되어 있는가?',
        '- 결과를 판단할 기준표나 체크리스트가 있는가?',
        '- 첫 답변이 약할 경우의 복구 경로가 있는가?',
        '- 빠진 내용이 있으면 답변 전에 채웠는가?',
      ].join('\n')
}

export function analyzePromptQualityEnhanced(
  prompt: string,
  fields: Record<string, string> = {},
  language: Language = 'ko',
) {
  const text = String(prompt || '').trim()
  const normalized = normalizeText(text)
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)

  const checks: QualityCheck[] = []
  const suggestions: string[] = []
  const modelHints: Record<string, string[]> = { gpt: [], claude: [], gemini: [] }
  const scoreRef = { value: 0 }

  const hasRole = Boolean(fields.role || fields.role_detail || fields.project_name || /you are|as an?|role:/i.test(text))
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'role',
    labelFor(language, '역할', 'Role'),
    hasRole,
    tipFor(language, '역할이 명확합니다.', 'The role is explicit.'),
    tipFor(language, '역할이나 페르소나를 한 문장으로 추가하세요.', 'Add a clear role or persona.'),
  )

  const taskText = normalizeText(fields.task || fields.project_goal || fields.goal || '')
  const hasTask = taskText.length > 20 || includesAny(normalized, ['output', 'analyze', 'generate', 'summarize', 'design', 'compare', 'evaluate', 'build', 'create', 'write', 'plan', 'draft'])
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'task',
    labelFor(language, '작업', 'Task'),
    hasTask,
    tipFor(language, '작업이 구체적입니다.', 'The task is explicit.'),
    tipFor(language, '목표와 기대 행동이 드러나도록 다시 작성하세요.', 'Define the goal as a concrete action the model can execute.'),
  )

  const hasProblemDefinition = Boolean(
    fields.problem_definition ||
      fields.project_goal ||
      includesAny(normalized, ['problem definition', 'problem statement', 'define the problem', '문제 정의', '핵심 문제', '해결하려는 문제']),
  )
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'problem_definition',
    labelFor(language, '문제 정의', 'Problem definition'),
    hasProblemDefinition,
    tipFor(language, '문제 정의가 있습니다.', 'Problem definition is present.'),
    tipFor(language, '해결하려는 문제를 먼저 한 문장으로 적어주세요.', 'Explain what problem this prompt is trying to solve before the task starts.'),
  )

  const hasInputData = Boolean(
    fields.input_data ||
      fields.actual_input ||
      includesAny(normalized, ['input data', 'input', 'reference', 'example input', '입력 데이터', '입력값', '참고 데이터']),
  )
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'input_data',
    labelFor(language, '입력 데이터', 'Input data'),
    hasInputData,
    tipFor(language, '입력 데이터가 분리되어 있습니다.', 'Input data is separated.'),
    tipFor(language, '작업 지시와 입력 데이터를 분리해서 적어주세요.', 'Separate the input data from the task so the model knows what to work on.'),
  )

  const hasReasoningGuidance = Boolean(
    fields.reasoning ||
      fields.chain_steps ||
      includesAny(normalized, ['reasoning', 'step by step', 'workflow', 'process', '추론', '생각 과정', '작업 흐름', '검토 순서']),
  )
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'reasoning_guidance',
    labelFor(language, '추론 방향', 'Reasoning guidance'),
    hasReasoningGuidance,
    tipFor(language, '추론 방향이 있습니다.', 'Reasoning guidance is present.'),
    tipFor(language, '문제를 푸는 순서나 검토 순서를 한 줄 더 추가하세요.', 'Tell the model how to approach the problem before it writes the answer.'),
  )

  const hasOutput = Boolean(fields.output_format || includesAny(normalized, ['json', 'markdown', 'table', 'bullet', 'steps', 'schema', 'format', 'template']))
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'output_format',
    labelFor(language, '출력 형식', 'Output format'),
    hasOutput,
    tipFor(language, '출력 형식이 명확합니다.', 'The output format is explicit.'),
    tipFor(language, 'JSON, 마크다운, 표 등 원하는 출력 형태를 명시하세요.', 'State whether the answer should be JSON, markdown, bullets, a table, or another structure.'),
  )

  const hasConstraints = Boolean(
    fields.constraints ||
      fields.input_guardrails ||
      fields.output_guardrails ||
      includesAny(normalized, ['must', 'should', 'avoid', 'do not', 'limit', 'at least', 'under', 'over', '반드시', '금지', '최대', '최소']),
  )
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'constraints',
    labelFor(language, '제약 조건', 'Constraints'),
    hasConstraints,
    tipFor(language, '제약 조건이 있습니다.', 'Constraints are present.'),
    tipFor(language, '길이, 금지 항목, 필수 항목 같은 가드레일을 추가하세요.', 'Mention length limits, required items, prohibited items, and any hard boundaries.'),
  )

  const hasContext = Boolean(fields.context || fields.expertise || fields.core_features || fields.project_goal || fields.project_name || lines.length > 4)
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'context',
    labelFor(language, '맥락', 'Context'),
    hasContext,
    tipFor(language, '맥락이 충분합니다.', 'Enough context is provided.'),
    tipFor(language, '배경 정보와 실제 작업을 분리해서 적어주세요.', 'Separate background information from the actual task so the model can orient itself quickly.'),
  )

  const hasExamples = Boolean(
    fields.examples ||
      fields.example ||
      includesAny(normalized, ['example', 'examples', 'few-shot', '예시', '샘플', 'reference output']),
  )
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'examples',
    labelFor(language, '예시', 'Examples'),
    hasExamples,
    tipFor(language, '예시가 있습니다.', 'Examples are present.'),
    tipFor(language, '샘플 입력/출력이나 참고 예시를 하나 추가하세요.', 'Add a sample input/output pair or a short reference example if the task benefits from it.'),
  )

  const hasSuccessCriteria = Boolean(fields.success_criteria || includesAny(normalized, ['success criteria', 'acceptance', 'rubric', 'judge', 'evaluate']))
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'success_criteria',
    labelFor(language, '성공 기준', 'Success criteria'),
    hasSuccessCriteria,
    tipFor(language, '성공 기준이 있습니다.', 'Success criteria are present.'),
    tipFor(language, '결과가 어떻게 판단될지 명시하세요.', 'Explain how the output will be judged or what the result should look like.'),
  )

  const hasEvaluation = Boolean(fields.evaluation || includesAny(normalized, ['evaluation', 'review', 'rubric', 'checklist', 'criteria']))
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'evaluation',
    labelFor(language, '평가 기준', 'Evaluation'),
    hasEvaluation,
    tipFor(language, '평가 기준이 있습니다.', 'Evaluation criteria are present.'),
    tipFor(language, '정답 비교 기준이나 체크리스트를 추가하세요.', 'Describe how to compare answers so the result is easier to verify.'),
  )

  const hasSelfCheck = Boolean(fields.self_check || includesAny(normalized, ['self-check', 'double-check', 'review your output', 'verify']))
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'self_check',
    labelFor(language, '자체 점검', 'Self-check'),
    hasSelfCheck,
    tipFor(language, '자체 점검 단계가 있습니다.', 'A self-check step is present.'),
    tipFor(language, '답변 전에 스스로 검토하도록 한 줄을 추가하세요.', 'Ask the model to review its own output before it responds.'),
  )

  const hasUncertainty = Boolean(fields.uncertainty || includesAny(normalized, ['if unsure', 'if uncertain', 'missing', 'ambiguous', 'assume']))
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'uncertainty',
    labelFor(language, '불확실성 처리', 'Uncertainty handling'),
    hasUncertainty,
    tipFor(language, '불확실성 처리 규칙이 있습니다.', 'Uncertainty handling is present.'),
    tipFor(language, '정보가 부족하거나 애매할 때 어떻게 할지 적어주세요.', 'State what to do when information is missing, ambiguous, or uncertain.'),
  )

  const ambiguous = includesAny(normalized, [
    'maybe',
    'something',
    'stuff',
    'things',
    'etc',
    'appropriate',
    'as needed',
    'whatever',
    '적절',
    '알아서',
    '대충',
    '등',
    '기타',
    '필요시',
  ])
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'ambiguity',
    labelFor(language, '모호성', 'Ambiguity'),
    !ambiguous,
    !ambiguous ? tipFor(language, '표현이 구체적입니다.', 'The wording is specific.') : tipFor(language, '표현이 아직 모호합니다.', 'The wording is still vague.'),
    tipFor(language, '모호한 표현을 구체적인 요구사항과 측정 가능한 조건으로 바꾸세요.', 'Replace vague phrases with concrete requirements and measurable terms.'),
  )

  const tokenWaste = normalized.length > 1200 || lines.filter((line, index) => lines.indexOf(line) !== index).length > 0 || /very very|please please/i.test(normalized)
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'token_efficiency',
    labelFor(language, '토큰 효율', 'Token efficiency'),
    !tokenWaste,
    !tokenWaste ? tipFor(language, '프롬프트가 간결합니다.', 'The prompt is concise.') : tipFor(language, '불필요한 반복이 보입니다.', 'There is avoidable repetition.'),
    tipFor(language, '중복 문장을 줄이고 긴 안내문을 압축하세요.', 'Remove repeated wording and compress long boilerplate where possible.'),
  )

  const hasFailureHandling = Boolean(
    fields.rollback_plan ||
      fields.feedback_loop ||
      fields.failure_response ||
      fields.recovery_prompt ||
      includesAny(normalized, ['failure', 'rollback', 'fallback', 'retry', 'if the first attempt fails', '실패', '복구', '재시도']),
  )
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'failure_handling',
    labelFor(language, '복구 경로', 'Failure handling'),
    hasFailureHandling,
    tipFor(language, '복구 경로가 있습니다.', 'Failure handling is present.'),
    tipFor(language, '첫 시도가 실패하면 어떻게 할지 추가하세요.', 'Explain what to do if the first attempt fails or the result is unusable.'),
  )

  const hasTone = Boolean(fields.tone || includesAny(normalized, ['formal', 'direct', 'friendly', 'concise', 'tone', '정중', '직설', '친근', '간결']))
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'tone',
    labelFor(language, '톤', 'Tone'),
    hasTone,
    tipFor(language, '톤이 정의되어 있습니다.', 'Tone is specified.'),
    tipFor(language, '정중한지, 직설적인지, 간결한지 명시하세요.', 'Clarify whether the answer should be formal, direct, friendly, or concise.'),
  )

  const hasModelFit = Boolean(fields.model_target || fields.model || includesAny(normalized, ['gpt', 'claude', 'gemini', 'model']))
  addCheck(
    checks,
    suggestions,
    scoreRef,
    'model_fit',
    labelFor(language, '모델 적합성', 'Model fit'),
    hasModelFit,
    tipFor(language, '모델 적합성이 고려되었습니다.', 'A model target is present.'),
    tipFor(language, '사용할 모델에 맞춰 스타일과 구조를 조정하세요.', 'Tune the style and structure for the model you plan to use.'),
  )

  if (!hasRole) {
    modelHints.gpt.push('역할이나 주제를 한 문장으로 먼저 제시하세요.')
    modelHints.claude.push('역할과 충분한 맥락 블록을 함께 넣으세요.')
    modelHints.gemini.push('역할이 분명한 직접 지시문을 사용하세요.')
  }
  if (!hasOutput) {
    modelHints.gpt.push('출력 형태를 글머리표나 단계로 정리하세요.')
    modelHints.claude.push('출력 형태를 자연스러운 문장으로 설명하세요.')
    modelHints.gemini.push('출력 규칙을 명시적으로 적으세요.')
  }
  if (!hasProblemDefinition) {
    modelHints.gpt.push('문제 정의를 한 문장으로 먼저 적으세요.')
    modelHints.claude.push('해결하려는 문제와 배경을 분리해서 적으세요.')
    modelHints.gemini.push('문제와 목표를 먼저 분명하게 써주세요.')
  }
  if (!hasInputData) {
    modelHints.gpt.push('입력 데이터와 작업 지시를 분리하세요.')
    modelHints.claude.push('참고 데이터와 실제 요청을 따로 블록으로 나누세요.')
    modelHints.gemini.push('입력 예시나 참고 데이터를 별도로 적으세요.')
  }
  if (!hasReasoningGuidance) {
    modelHints.gpt.push('문제를 푸는 순서나 검토 순서를 한 줄 더 추가하세요.')
    modelHints.claude.push('추론 순서를 단계적으로 안내하세요.')
    modelHints.gemini.push('작업 흐름이나 사고 방향을 명시하세요.')
  }
  if (!hasConstraints) {
    modelHints.gpt.push('가드레일과 길이 제한을 추가하세요.')
    modelHints.claude.push('제약 조건은 맥락과 분리해서 적으세요.')
    modelHints.gemini.push('짧은 해야 할 것/하지 말아야 할 것을 쓰세요.')
  }

  const total = checks.length
  const percentage = total === 0 ? 0 : Math.round((scoreRef.value / total) * 100)
  const grade = buildGrade(percentage)
  const failedLabels = checks.filter((check) => !check.passed).map((check) => check.label)
  const summary =
    failedLabels.length > 0
      ? language === 'en'
        ? `Needs work: ${failedLabels.slice(0, 3).join(', ')}${failedLabels.length > 3 ? ` and ${failedLabels.length - 3} more` : ''}`
        : `보완 필요: ${failedLabels.slice(0, 3).join(', ')}${failedLabels.length > 3 ? ` 외 ${failedLabels.length - 3}개` : ''}`
      : language === 'en'
        ? 'The prompt structure is strong and ready to execute.'
        : '프롬프트 구조가 안정적이고 실행 준비가 잘 되어 있습니다.'

  return {
    checks,
    score: scoreRef.value,
    total,
    percentage,
    grade,
    summary,
    suggestions,
    modelHints,
  }
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
      '다양한 케이스를 포함하면 더 좋은 결과를 얻습니다.',
    ],
    'chain-of-thought': [
      '단계별로 생각해보세요라는 지시가 핵심입니다.',
      '각 단계가 논리적으로 연결되도록 하세요.',
      '수학, 논리, 코드 디버깅에 특히 효과적입니다.',
    ],
    'tree-of-thought': [
      '최소 3가지 이상의 접근법을 제시하세요.',
      '각 접근법이 서로 다른 관점을 반영하도록 하세요.',
      '비교 평가 기준을 명시하면 더 좋은 결과를 얻습니다.',
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
      '반복적으로 개선하면 최적의 프롬프트를 얻습니다.',
    ],
    'context-engineering': [
      '프로젝트 전체 맥락을 먼저 설정하세요.',
      '문제 정의, 입력 데이터, 성공 기준을 분리해서 적으세요.',
      '기술 스택과 데이터 모델을 구체적으로 작성하면 효과가 큽니다.',
    ],
    harness: [
      '모든 섹션을 채울수록 좋습니다.',
      '프로젝트 전체 컨텍스트를 먼저 설정하고, 이후 작업 지시를 붙이세요.',
      '이 기법은 다른 기법들의 요소를 종합한 것입니다.',
    ],
  }

  return tipsMap[techniqueId] || tipsMap['zero-shot']
}
