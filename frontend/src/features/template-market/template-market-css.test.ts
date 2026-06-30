/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

it('갱신 오류 재시도 버튼을 기본 24px, 모바일 44px 이상으로 유지한다', () => {
  const css = readFileSync('src/features/template-market/template-market.css', 'utf8')
  const mobileStart = css.indexOf('@media (max-width: 600px)')
  const base = css.slice(0, mobileStart)
  const mobile = css.slice(mobileStart)
  expect(base).toMatch(/\.market-results__summary button[^}]*min-height:\s*24px/s)
  expect(mobile).toMatch(/\.market-results__summary button[^}]*min-height:\s*44px/s)
})
