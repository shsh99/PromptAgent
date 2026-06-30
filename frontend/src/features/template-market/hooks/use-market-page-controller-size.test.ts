/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

it('useMarketPageController 함수 물리 줄 수를 50줄 이하로 유지한다', () => {
  const lines = readFileSync('src/features/template-market/hooks/use-market-page-controller.ts', 'utf8').split(/\r?\n/)
  const start = lines.findIndex((line) => line.startsWith('export const useMarketPageController'))
  let end = lines.length - 1
  while (end >= 0 && lines[end] !== '}') end -= 1
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end - start + 1).toBeLessThanOrEqual(50)
})
