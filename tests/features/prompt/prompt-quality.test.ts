import assert from 'node:assert/strict'

import {
  analyzePromptQualityEnhanced,
  buildPromptVerificationBlock,
} from '../../../webapp/src/features/prompt/quality'
import {
  buildGenerateResult,
  buildImproveResult,
} from '../../../webapp/src/features/prompt/prompt-services'

const sparsePrompt = 'Write something.'
const completePrompt = [
  'You are a senior product manager.',
  'Create a launch brief for the new onboarding flow.',
  'Return the result in markdown with headings and bullets.',
  'Keep it under 300 words and avoid technical jargon.',
  'Include success criteria and a quick self-check.',
].join('\n')

const sparseReport = analyzePromptQualityEnhanced(sparsePrompt, {})
const completeReport = analyzePromptQualityEnhanced(completePrompt, {
  role: 'You are a senior product manager.',
  task: 'Create a launch brief for the new onboarding flow.',
  output_format: 'markdown',
  constraints: 'Keep it under 300 words.',
  success_criteria: 'The brief is concise and actionable.',
  self_check: 'Verify clarity before answering.',
})

assert.ok(completeReport.score > sparseReport.score, 'Complete prompts should score higher than sparse prompts.')
assert.equal(completeReport.grade !== 'D', true, 'Complete prompts should not be graded as D.')
assert.ok(completeReport.suggestions.length >= 0)

const englishBlock = buildPromptVerificationBlock('en')
const koreanBlock = buildPromptVerificationBlock('ko')

assert.match(englishBlock, /Final verification/)
assert.ok(koreanBlock.startsWith('## '))
assert.ok(englishBlock.includes('success criteria'))

const generateResult = buildGenerateResult({
  techniqueId: 'context-engineering',
  inputFields: {
    project_name: 'Prompt Builder',
    project_goal: 'Improve prompt quality workflows.',
    target_user: 'Product teams',
    tech_stack: 'TypeScript, Hono, Vite',
    core_features: 'Prompt generation\nQuality analysis',
    data_model: 'PromptTemplate, PromptRun',
    constraints: 'Keep the explanation concise.',
    tone: 'Clear and practical',
  },
  purpose: 'web-app',
  keyword: 'onboarding',
  language: 'en',
  promptStyle: 'gpt',
  workflowState: 'new',
})

assert.ok(generateResult.prompt.includes('Final verification'), 'Generated prompt should include the verification block.')
assert.ok(generateResult.prompt.includes('Problem definition'), 'Generated prompt should include the strategic guidance block.')
assert.ok(generateResult.prompt.includes('Input data'), 'Generated prompt should include input data guidance.')
assert.ok(generateResult.qualityReport.percentage >= 0)
assert.ok(Array.isArray(generateResult.variants))

const lowComplexityResult = buildGenerateResult({
  techniqueId: 'context-engineering',
  inputFields: {
    complexity: 'low',
    project_name: 'Prompt Builder',
    project_goal: 'Improve prompt quality workflows.',
    target_user: 'Product teams',
    tech_stack: 'TypeScript, Hono, Vite',
    core_features: 'Prompt generation\nQuality analysis',
    data_model: 'PromptTemplate, PromptRun',
    constraints: 'Keep the explanation concise.',
    tone: 'Clear and practical',
  },
  purpose: 'web-app',
  keyword: 'onboarding',
  language: 'en',
  promptStyle: 'gpt',
  workflowState: 'new',
})

const highComplexityResult = buildGenerateResult({
  techniqueId: 'context-engineering',
  inputFields: {
    complexity: 'high',
    project_name: 'Prompt Builder',
    project_goal: 'Improve prompt quality workflows.',
    target_user: 'Product teams',
    tech_stack: 'TypeScript, Hono, Vite',
    core_features: 'Prompt generation\nQuality analysis',
    data_model: 'PromptTemplate, PromptRun',
    constraints: 'Keep the explanation concise.',
    tone: 'Clear and practical',
  },
  purpose: 'web-app',
  keyword: 'onboarding',
  language: 'en',
  promptStyle: 'gpt',
  workflowState: 'new',
})

assert.ok(lowComplexityResult.prompt.includes('## System'))
assert.ok(lowComplexityResult.prompt.includes('## Template'))
assert.ok(lowComplexityResult.prompt.includes('## User Input'))
assert.ok(lowComplexityResult.prompt.includes('Quick verification'))
assert.ok(highComplexityResult.prompt.includes('Final verification'))
assert.ok(highComplexityResult.prompt.length > lowComplexityResult.prompt.length)

const improveResult = buildImproveResult({
  prompt: 'Write a better prompt for onboarding.',
  goal: 'Make the prompt more actionable.',
})

assert.ok(improveResult.improvedPrompt.includes('Execution Guidance'))
assert.ok(improveResult.improvedPrompt.includes('##'))
