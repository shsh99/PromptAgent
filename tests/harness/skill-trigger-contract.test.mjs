import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const fixtures = JSON.parse(readFileSync(new URL('./skill-trigger-fixtures.json', import.meta.url), 'utf8'))

for (const [skillName, corpus] of Object.entries(fixtures)) {
  test(`${skillName} 트리거 corpus는 8/8 계약을 지킨다`, () => {
    assert.equal(corpus.shouldTrigger.length, 8)
    assert.equal(corpus.shouldNotTrigger.length, 8)
    assert.equal(new Set(corpus.shouldTrigger).size, 8)
    assert.equal(new Set(corpus.shouldNotTrigger).size, 8)
    assert.ok([...corpus.shouldTrigger, ...corpus.shouldNotTrigger]
      .every((entry) => typeof entry === 'string' && entry.trim().length > 0))
    assert.deepEqual(
      corpus.shouldTrigger.filter((entry) => new Set(corpus.shouldNotTrigger).has(entry)),
      [],
    )
  })
}
