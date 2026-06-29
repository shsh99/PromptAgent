import { render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { App } from './app'

afterEach(() => vi.unstubAllGlobals())

it('presents the three product entry points with accessible navigation', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
    status: 'UP',
    service: 'prompt-agent-api',
    version: '0.1.0',
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })))

  render(<App />)

  expect(screen.getByRole('link', { name: '본문으로 건너뛰기' })).toHaveAttribute('href', '#main-content')
  expect(screen.getByRole('heading', { level: 1, name: '업무를 실행 가능한 AI 지침으로' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 2, name: '프롬프트 마켓' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 2, name: '상세 생성기' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 2, name: '에이전트 추천기' })).toBeInTheDocument()
  expect(await screen.findByText('API 연결됨')).toBeInTheDocument()
})

it('announces backend connection failures without hiding product navigation', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

  render(<App />)

  expect(await screen.findByText('API 연결 확인 필요')).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 2, name: '프롬프트 마켓' })).toBeInTheDocument()
})
