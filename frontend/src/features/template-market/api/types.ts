export const categories = [
  ['WORK_EMAIL', '업무 메일'],
  ['YOUTUBE_EDITING', '유튜브 편집'],
  ['WEBSITE_DEVELOPMENT', '웹사이트 개발'],
  ['CODE_DEBUGGING', '코드 오류 수정'],
  ['REPORT_WRITING', '보고서 작성'],
  ['IMAGE_GENERATION', '이미지 생성'],
  ['DATA_ANALYSIS', '데이터 분석'],
  ['MEETING_PLANNING', '회의·기획'],
] as const

export const difficulties = [
  ['BEGINNER', '입문'],
  ['INTERMEDIATE', '중급'],
  ['ADVANCED', '고급'],
] as const

export type PromptCategory = typeof categories[number][0]
export type PromptDifficulty = typeof difficulties[number][0]

export interface PromptTemplateSummary {
  id: string
  version: string
  title: string
  summary: string
  category: PromptCategory
  categoryLabel: string
  difficulty: PromptDifficulty
  targetModels: string[]
  tags: string[]
  verificationStatus: 'VERIFIED'
}

export interface RequiredSections {
  role: string
  objective: string
  input: { backgroundAndInput: string; targetAudience: string }
  constraints: { rules: string; uncertaintyHandling: string }
  outputFormat: string
  qualityCriteria: { criteria: string; selfCheck: string }
}

export interface PromptTemplateDetail extends PromptTemplateSummary {
  requiredSections: RequiredSections
  copyablePrompt: string
}

export interface PromptTemplatePage {
  items: PromptTemplateSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface TemplateFilters {
  category?: PromptCategory
  difficulty?: PromptDifficulty
  query?: string
  page?: number
}
