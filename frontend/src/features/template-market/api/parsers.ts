import { categories, difficulties, type PromptTemplateDetail, type PromptTemplatePage, type PromptTemplateSummary } from './types'

const categoryValues: ReadonlySet<string> = new Set(categories.map(([value]) => value))
const difficultyValues: ReadonlySet<string> = new Set(difficulties.map(([value]) => value))
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object'
const isText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0
const isTextArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isText)

const isSummary = (value: unknown): value is PromptTemplateSummary => {
  if (!isRecord(value)) return false
  return isText(value.id) && isText(value.version) && isText(value.title) && isText(value.summary)
    && isText(value.category) && categoryValues.has(value.category)
    && isText(value.categoryLabel) && isText(value.difficulty) && difficultyValues.has(value.difficulty)
    && isTextArray(value.targetModels) && value.targetModels.length > 0
    && isTextArray(value.tags) && value.verificationStatus === 'VERIFIED'
}

const isRequiredSections = (value: unknown): boolean => {
  if (!isRecord(value) || !isRecord(value.input) || !isRecord(value.constraints) || !isRecord(value.qualityCriteria)) return false
  return isText(value.role) && isText(value.objective)
    && isText(value.input.backgroundAndInput) && isText(value.input.targetAudience)
    && isText(value.constraints.rules) && isText(value.constraints.uncertaintyHandling)
    && isText(value.outputFormat) && isText(value.qualityCriteria.criteria) && isText(value.qualityCriteria.selfCheck)
}

export const parsePromptTemplatePage = (value: unknown): PromptTemplatePage => {
  if (!isRecord(value) || !Array.isArray(value.items) || !value.items.every(isSummary)
    || !isNumber(value.page) || !isNumber(value.size) || !isNumber(value.totalElements) || !isNumber(value.totalPages)) {
    throw new Error('프롬프트 템플릿 목록 응답이 올바르지 않습니다.')
  }
  return value as unknown as PromptTemplatePage
}

export const parsePromptTemplateDetail = (value: unknown): PromptTemplateDetail => {
  if (!isSummary(value) || !isRecord(value) || !isRequiredSections(value.requiredSections) || !isText(value.copyablePrompt)) {
    throw new Error('프롬프트 템플릿 상세 응답이 올바르지 않습니다.')
  }
  return value as unknown as PromptTemplateDetail
}
