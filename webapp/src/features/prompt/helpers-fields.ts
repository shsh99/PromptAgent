import {
  clearCache,
  getCacheStats,
  getChainSteps,
  getContextDetail,
  getCoreFeatures,
  getDataModel,
  getExpertise,
  getFewShotExamples,
  getApproaches,
  getRoleDetail,
  getRoleForPurpose,
  getTargetUser,
  getTechStack,
  normalizeKeyword,
  normalizePurpose,
  validateInput,
  registerPurposeConfig,
  getPurposeConfigKeys,
  type PurposeConfig,
} from './helpers-config'
import { PURPOSE_PRESETS } from './data'
import { analyzePromptQualityEnhanced, getPromptTips } from './quality'

export { validateInput, normalizePurpose, normalizeKeyword, clearCache, getCacheStats, registerPurposeConfig, getPurposeConfigKeys }
export type { PurposeConfig }

type FieldGenerator = (context: FieldGenerationContext) => Record<string, string>

export interface FieldGenerationContext {
  purpose: string
  keyword: string
  techniqueId: string
  purposeLabel: string
  customConfig?: Partial<PurposeConfig>
}

interface CheckWeight {
  [key: string]: number
}

const checkWeights: CheckWeight = {
  role: 1,
  task: 1.2,
  output_format: 1.3,
  constraints: 1.1,
  context: 1,
  ambiguity: 0.9,
  token_waste: 0.8,
  failure_boundaries: 0.7,
  tone: 0.6,
}

const fieldGenerators: Record<string, FieldGenerator> = {
  'context-engineering': ({ keyword, purpose, purposeLabel }) => ({
    project_name: keyword.split(/\s+/)[0] || keyword,
    project_goal: `${purposeLabel} 분야에서 "${keyword}"를 구현하는 프로젝트`,
    target_user: getTargetUser(purpose),
    tech_stack: getTechStack(purpose),
    core_features: getCoreFeatures(purpose, keyword),
    data_model: getDataModel(purpose, keyword),
    project_structure: 'webapp/src, webapp/public/static, docs, scripts, tests',
    existing_assets: '기존 템플릿, 분석기, 문서 구조를 재사용합니다.',
    workflow_steps: getChainSteps(purpose, keyword),
    code_conventions: '한국어 중심 문서, 재사용 가능한 helper 우선, 중복 로직 최소화',
    branch_strategy: 'main 배포 기준, feature/* 작업 브랜치 사용',
    code_review_rules: '동작 변경은 이유와 영향 범위를 함께 설명합니다.',
    testing_rules: '핵심 흐름은 빌드 후 수동 검증, 신규 기능은 최소 1회 재확인합니다.',
    deployment_rules: '배포 전 빌드 확인, 실패 시 변경 내용을 기록합니다.',
    risks: '과도한 복잡도, 입력 누락, 성능 저하 가능성을 점검합니다.',
    appendix_docs: 'README, docs/plan.md, docs/phase.md, docs/features/*',
    constraints: '한국어 UI, 반응형 디자인, 성능 최적화, 접근성 준수',
    tone: '전문적이고 체계적인',
  }),
  harness: ({ keyword, purpose, purposeLabel }) => ({
    role: getRoleForPurpose(purpose),
    context: `${purposeLabel} 프로젝트입니다. "${keyword}"를 개발하려 합니다. ${getContextDetail(purpose)}`,
    task: `"${keyword}" 프로젝트의 전체 아키텍처를 설계하고 핵심 기능과 구현 계획을 수립해주세요.`,
    goal: `${keyword} 프로젝트를 실제 구현 가능한 수준으로 구조화합니다.`,
    non_goal: '이번 단계에서 불필요한 부가기능과 과도한 이론 설명은 제외합니다.',
    must_have: '문제 정의, 입력 데이터, 출력 형식, 제약 조건, 평가 기준을 포함하세요.',
    should_have: '사무직 사용자도 이해할 수 있는 짧은 설명과 예시를 포함하세요.',
    nice_to_have: '템플릿 예시, 버전 비교, 복구 안내, 모델별 변환 힌트를 추가하세요.',
    input_data: `프로젝트 유형: ${purposeLabel}\n핵심 키워드: ${keyword}`,
    output_format: '마크다운 형식으로 1) 개요 2) 문제 정의 3) 핵심 기능 4) 데이터 모델 5) 구조 6) 구현 단계 7) 실패 대응',
    tone: '전문적이고 실용적인',
    constraints: '실제 구현 가능한 현실적인 설계, 한국어로 작성, 누락된 항목은 기본값으로 보완',
    input_guardrails: '모호한 표현은 구체적인 수치와 조건으로 바꾸고 빈칸이 있으면 추정값을 제안합니다.',
    output_guardrails: '출력 구조를 유지하고 필수 항목이 빠지면 자동 보완합니다.',
    monitoring_rules: '구조 누락, 모호성, 반복 표현, 실패 원인을 함께 확인합니다.',
    failure_response: '결과가 약하면 문제 정의와 제약 조건을 강화한 뒤 다시 작성합니다.',
    rollback_plan: '개선 전 버전과 비교하여 언제든 이전 구조로 되돌릴 수 있게 합니다.',
  }),
  'prompt-chaining': ({ keyword, purposeLabel, purpose }) => ({
    task: `"${keyword}" ${purposeLabel} 프로젝트를 처음부터 완성까지 단계별로 개발해주세요.`,
    chain_steps: getChainSteps(purpose, keyword),
    output_format: '각 단계별 상세 가이드 (마크다운)',
    constraints: '각 단계의 출력이 다음 단계의 입력이 되도록 연결, 한국어로 작성',
  }),
  'chain-of-thought': ({ keyword, purpose, purposeLabel }) => ({
    role: getRoleForPurpose(purpose),
    task: `"${keyword}" ${purposeLabel} 프로젝트의 최적 설계 방향을 분석해주세요.`,
    steps: `1단계: "${keyword}" 프로젝트의 핵심 요구사항을 분석합니다.\n2단계: 가능한 기술 스택과 아키텍처 옵션을 비교합니다.\n3단계: 사용자 경험, 성능, 확장성을 고려한 최적의 설계를 도출합니다.\n4단계: 구현 계획과 우선순위를 제시합니다.`,
    output_format: '단계별 분석 결과 + 최종 추천 (마크다운)',
    constraints: '실용적이고 현실적인 분석, 한국어로 작성',
  }),
  'tree-of-thought': ({ keyword, purpose, purposeLabel }) => ({
    role: getRoleForPurpose(purpose),
    task: `"${keyword}" ${purposeLabel} 프로젝트의 최적 아키텍처를 결정해주세요.`,
    approaches: getApproaches(purpose, keyword),
    output_format: '각 접근법 분석 + 최종 추천 (마크다운 표 포함)',
    constraints: '장단점을 객관적으로 비교, 한국어로 작성',
  }),
  'role-prompting': ({ keyword, purpose, purposeLabel }) => ({
    role_detail: getRoleDetail(purpose),
    expertise: getExpertise(purpose),
    task: `"${keyword}" ${purposeLabel}을 설계하고 구현 계획을 작성해주세요.`,
    tone: '전문적이면서도 이해하기 쉬운',
    output_format: '구조화된 마크다운 문서',
    constraints: '실무 경험 기반의 실용적 조언, 한국어로 작성',
  }),
  'few-shot': ({ keyword, purpose, purposeLabel }) => ({
    role: getRoleForPurpose(purpose),
    task: `아래 예시처럼 "${keyword}" 프로젝트에 대한 핵심 기능 명세를 작성해주세요.`,
    examples: getFewShotExamples(purpose),
    actual_input: `프로젝트: ${keyword} (${purposeLabel})`,
    output_format: '예시와 동일한 형식',
    constraints: '한국어로 작성',
  }),
  'zero-shot': ({ keyword, purpose, purposeLabel }) => ({
    role: getRoleForPurpose(purpose),
    task: `"${keyword}" ${purposeLabel}의 프로젝트 구조, 핵심 기능, 기술 스택을 설계해주세요.`,
    output_format: '마크다운 형식의 프로젝트 설계 문서',
    constraints: '실용적이고 구현 가능한 설계, 한국어로 작성',
  }),
  'meta-prompting': ({ keyword, purposeLabel }) => ({
    original_prompt: `"${keyword}" ${purposeLabel}을 만들어주세요.`,
    improvement_goal: '프롬프트를 더 구체적으로 개선하여 AI가 정확한 결과를 만들도록 해주세요.',
    constraints: '한국어로 작성',
  }),
}

export function generateAutoFields(purpose: string, keyword: string, techniqueId: string): Record<string, string> {
  const validation = validateInput(purpose, keyword)
  if (!validation.valid) {
    console.warn('Input validation errors:', validation.errors)
  }

  const normalizedPurpose = normalizePurpose(purpose)
  const normalizedKeyword = normalizeKeyword(keyword)
  const purposeInfo = {
    label: PURPOSE_PRESETS.find((item) => item.id === normalizedPurpose)?.label || normalizedPurpose,
  }
  const generator = fieldGenerators[techniqueId] || fieldGenerators['zero-shot']
  return generator({
    purpose: normalizedPurpose,
    keyword: normalizedKeyword,
    techniqueId,
    purposeLabel: purposeInfo.label,
  })
}

export function analyzePromptQuality(prompt: string, fields: Record<string, string>) {
  const result = analyzePromptQualityEnhanced(prompt, fields)
  return {
    checks: result.checks.map((c) => ({ label: c.label, passed: c.passed, tip: c.tip })),
    score: Math.round(result.score),
    total: Math.round(result.total),
    percentage: result.percentage,
    grade: result.grade,
  }
}

export function analyzeAndEnhancePrompt(
  prompt: string,
  purpose: string,
  keyword: string,
  techniqueId: string,
): { fields: Record<string, string>; analysis: ReturnType<typeof analyzePromptQualityEnhanced>; tips: string[] } {
  const fields = generateAutoFields(purpose, keyword, techniqueId)
  const analysis = analyzePromptQualityEnhanced(prompt, fields)
  const tips = getPromptTips(techniqueId)
  return { fields, analysis, tips }
}
