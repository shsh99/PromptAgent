import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchPromptTemplate, fetchPromptTemplates, parsePromptTemplateDetail, parsePromptTemplatePage } from './prompt-templates'
import { detailFixture, summaryFixture } from '../test-fixtures'

afterEach(() => vi.unstubAllGlobals())

describe('프롬프트 템플릿 API 계약', () => {
  it('목록과 상세 공개 응답을 런타임에 검증한다', () => {
    expect(parsePromptTemplatePage({ items: [summaryFixture], page: 0, size: 20, totalElements: 1, totalPages: 1 }).items[0].title)
      .toBe(summaryFixture.title)
    expect(parsePromptTemplateDetail(detailFixture).requiredSections.input.targetAudience).toBe('회의 참석자')
  })

  it('필수 9항목이나 목록 메타데이터가 빠진 응답을 거부한다', () => {
    expect(() => parsePromptTemplatePage({ items: [summaryFixture], page: 0 })).toThrow('목록 응답')
    expect(() => parsePromptTemplatePage({
      items: [{ ...summaryFixture, targetModels: [] }], page: 0, size: 20, totalElements: 1, totalPages: 1,
    })).toThrow('목록 응답')
    expect(() => parsePromptTemplateDetail({ ...detailFixture, copyablePrompt: '' })).toThrow('상세 응답')
  })

  it('category, difficulty, query를 URLSearchParams로 안전하게 인코딩한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [summaryFixture], page: 0, size: 20, totalElements: 1, totalPages: 1,
    }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    await fetchPromptTemplates({ category: 'WORK_EMAIL', difficulty: 'BEGINNER', query: '회의 후속' })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/prompt-templates?category=WORK_EMAIL&difficulty=BEGINNER&query=%ED%9A%8C%EC%9D%98+%ED%9B%84%EC%86%8D&page=0&size=20',
      expect.objectContaining({ headers: { Accept: 'application/json' } }),
    )
  })

  it('HTTP 오류의 문제 상세 메시지를 보존한다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: 404, code: 'TEMPLATE_NOT_FOUND', message: '요청한 공개 프롬프트 템플릿이 존재하지 않습니다.',
    }), { status: 404, headers: { 'Content-Type': 'application/problem+json' } })))
    await expect(fetchPromptTemplate('unknown')).rejects.toMatchObject({
      status: 404, code: 'TEMPLATE_NOT_FOUND',
      message: '요청한 공개 프롬프트 템플릿이 존재하지 않습니다.',
    })
  })
})
