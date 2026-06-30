/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

it('모바일에서 갱신 오류 재시도 버튼을 44px 이상으로 유지한다', () => {
  const css = readFileSync('src/features/template-market/template-market.css', 'utf8')
  const mobile = css.slice(css.indexOf('@media (max-width: 600px)'))
  expect(mobile).toMatch(/\.market-results__summary button[^}]*min-height:\s*44px/s)
})
