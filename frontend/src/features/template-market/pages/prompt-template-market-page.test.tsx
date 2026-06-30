import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'

import { detailFixture as detail, summaryFixture as summary } from '../test-fixtures'
import { PromptTemplateMarketPage } from './prompt-template-market-page'

const page = (items = [summary]) => ({ items, page: 0, size: 20, totalElements: items.length, totalPages: items.length ? 1 : 0 })
const response = (body: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': status >= 400 ? 'application/problem+json' : 'application/json' },
}))

afterEach(() => {
  vi.unstubAllGlobals()
  window.history.replaceState({}, '', '/')
})

it('목록 로딩 후 검증된 템플릿을 표시한다', async () => {
  let resolveFetch: (value: Response) => void = () => undefined
  vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise((resolve) => { resolveFetch = resolve })))
  render(<PromptTemplateMarketPage />)
  expect(screen.getByRole('status')).toHaveTextContent('템플릿을 불러오는 중…')
  resolveFetch(await response(page()))
  expect(await screen.findByRole('heading', { level: 3, name: summary.title })).toBeInTheDocument()
  expect(screen.getByText('검증 완료')).toBeInTheDocument()
  expect(screen.getByText('1개의 검증된 템플릿')).toBeInTheDocument()
})

it('검색 결과가 비면 필터를 초기화할 수 있다', async () => {
  vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => response(url.includes('query=') ? page([]) : page())))
  const user = userEvent.setup()
  render(<PromptTemplateMarketPage />)
  await screen.findByText(summary.title)
  await user.type(screen.getByLabelText('업무 검색'), '존재하지 않음')
  await user.click(screen.getByRole('button', { name: '템플릿 검색' }))
  expect(await screen.findByText('조건에 맞는 템플릿이 없습니다.')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '필터 초기화' }))
  expect(await screen.findByText(summary.title)).toBeInTheDocument()
})

it('목록 오류를 안내하고 키보드로 재시도한다', async () => {
  const fetchMock = vi.fn().mockRejectedValueOnce(new Error('network')).mockImplementation(() => response(page()))
  vi.stubGlobal('fetch', fetchMock)
  const user = userEvent.setup()
  render(<PromptTemplateMarketPage />)
  expect(await screen.findByText('템플릿을 불러오지 못했습니다.')).toBeInTheDocument()
  const retry = screen.getByRole('button', { name: '목록 다시 불러오기' })
  retry.focus()
  await user.keyboard('{Enter}')
  expect(await screen.findByText(summary.title)).toBeInTheDocument()
})

it('카테고리, 난이도, 검색어를 AND 필터로 요청하고 URL에 반영한다', async () => {
  const fetchMock = vi.fn().mockImplementation(() => response(page()))
  vi.stubGlobal('fetch', fetchMock)
  const user = userEvent.setup()
  render(<PromptTemplateMarketPage />)
  await screen.findByText(summary.title)
  await user.selectOptions(screen.getByLabelText('업무 카테고리'), 'WORK_EMAIL')
  await user.selectOptions(screen.getByLabelText('난이도'), 'BEGINNER')
  await user.type(screen.getByLabelText('업무 검색'), '회의 후속')
  await user.click(screen.getByRole('button', { name: '템플릿 검색' }))
  await waitFor(() => expect(fetchMock.mock.calls.at(-1)?.[0]).toContain('category=WORK_EMAIL'))
  expect(fetchMock.mock.calls.at(-1)?.[0]).toContain('difficulty=BEGINNER')
  expect(fetchMock.mock.calls.at(-1)?.[0]).toContain('query=%ED%9A%8C%EC%9D%98+%ED%9B%84%EC%86%8D')
  expect(window.location.search).toBe('?category=WORK_EMAIL&difficulty=BEGINNER&query=%ED%9A%8C%EC%9D%98+%ED%9B%84%EC%86%8D')
})

it('카드에서 상세를 열어 9개 필수 항목을 표시하고 닫으면 초점을 복귀한다', async () => {
  vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => response(url.endsWith(summary.id) ? detail : page())))
  const user = userEvent.setup()
  render(<PromptTemplateMarketPage />)
  const open = await screen.findByRole('button', { name: `${summary.title} 상세 보기` })
  await user.click(open)
  for (const label of ['역할', '목적', '배경과 입력', '대상 사용자', '제약 조건', '불확실성 처리', '출력 형식', '품질 기준', '최종 자체 점검']) {
    expect(await screen.findByRole('heading', { level: 4, name: label })).toBeInTheDocument()
  }
  await user.click(screen.getByRole('button', { name: '상세 닫기' }))
  expect(open).toHaveFocus()
})

it('상세 404를 목록 오류와 구분한다', async () => {
  const problem = { status: 404, code: 'TEMPLATE_NOT_FOUND', message: '공개 템플릿이 없습니다.' }
  vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => url.endsWith(summary.id) ? response(problem, 404) : response(page())))
  const user = userEvent.setup()
  render(<PromptTemplateMarketPage />)
  await user.click(await screen.findByRole('button', { name: `${summary.title} 상세 보기` }))
  expect(await screen.findByText('선택한 공개 템플릿을 찾을 수 없습니다.')).toBeInTheDocument()
})

it('상세 로딩과 일반 오류를 선택 상태 안에서 안내한다', async () => {
  let rejectDetail: (reason: Error) => void = () => undefined
  vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => url.endsWith(summary.id)
    ? new Promise((_, reject) => { rejectDetail = reject })
    : response(page())))
  const user = userEvent.setup()
  render(<PromptTemplateMarketPage />)
  await user.click(await screen.findByRole('button', { name: `${summary.title} 상세 보기` }))
  expect(screen.getByText('상세 프롬프트를 불러오는 중…')).toBeInTheDocument()
  rejectDetail(new Error('network'))
  expect(await screen.findByText('상세 프롬프트를 불러오지 못했습니다.')).toBeInTheDocument()
})

it('copyablePrompt 복사 성공과 실패를 aria-live로 정확히 알린다', async () => {
  const writeText = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('denied'))
  vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => response(url.endsWith(summary.id) ? detail : page())))
  const user = userEvent.setup()
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  render(<PromptTemplateMarketPage />)
  await user.click(await screen.findByRole('button', { name: `${summary.title} 상세 보기` }))
  const copy = await screen.findByRole('button', { name: '완성 프롬프트 복사' })
  await user.click(copy)
  expect(screen.getByRole('status', { name: '복사 결과' })).toHaveTextContent('프롬프트를 복사했습니다.')
  expect(writeText).toHaveBeenCalledWith(detail.copyablePrompt)
  await user.click(copy)
  expect(screen.getByRole('status', { name: '복사 결과' })).toHaveTextContent('복사하지 못했습니다. 아래 내용을 직접 선택해 복사하세요.')
})
