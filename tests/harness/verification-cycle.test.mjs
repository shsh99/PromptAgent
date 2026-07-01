import assert from 'node:assert/strict'
import test from 'node:test'

import {
  decideVerificationRoute,
  scenarioAllowance,
} from '../../scripts/harness/verification-cycle.mjs'

const passingState = (overrides = {}) => ({
  cycle: 1,
  sameFailureCount: 0,
  modificationCount: 0,
  deadlineExceeded: false,
  mechanicalPassed: true,
  guardianVerdict: 'PASS',
  challengerVerdict: 'PASS',
  ...overrides,
})

test('수정 횟수가 2 이상이면 다른 결과보다 BLOCKED를 우선한다', () => {
  assert.equal(decideVerificationRoute(passingState({ modificationCount: 2 })), 'BLOCKED')
})

test('동일 실패가 2회 이상이면 BLOCKED를 반환한다', () => {
  assert.equal(decideVerificationRoute(passingState({ sameFailureCount: 2 })), 'BLOCKED')
})

test('검증 cycle이 2를 넘으면 BLOCKED를 반환한다', () => {
  assert.equal(decideVerificationRoute(passingState({ cycle: 3 })), 'BLOCKED')
})

test('deadline을 넘으면 BLOCKED를 반환한다', () => {
  assert.equal(decideVerificationRoute(passingState({ deadlineExceeded: true })), 'BLOCKED')
})

test('기계 검증 실패는 소유자에게 반환한다', () => {
  assert.equal(decideVerificationRoute(passingState({ mechanicalPassed: false })), 'RETURN_TO_OWNER')
})

test('누락된 guardian 판정은 fail-closed로 BLOCKED를 반환한다', () => {
  assert.equal(decideVerificationRoute(passingState({ guardianVerdict: undefined })), 'BLOCKED')
})

test('허용되지 않은 challenger 판정은 fail-closed로 BLOCKED를 반환한다', () => {
  assert.equal(decideVerificationRoute(passingState({ challengerVerdict: 'UNKNOWN' })), 'BLOCKED')
})

test('guardian과 challenger 판정이 다르면 JUDGE를 반환한다', () => {
  assert.equal(decideVerificationRoute(passingState({ challengerVerdict: 'FAIL' })), 'JUDGE')
})

test('guardian과 challenger가 모두 PASS이면 ACCEPT를 반환한다', () => {
  assert.equal(decideVerificationRoute(passingState()), 'ACCEPT')
})

test('guardian과 challenger가 모두 FAIL이면 소유자에게 반환한다', () => {
  assert.equal(decideVerificationRoute(passingState({
    guardianVerdict: 'FAIL', challengerVerdict: 'FAIL',
  })), 'RETURN_TO_OWNER')
})

test('guardian과 challenger가 모두 UNVERIFIED이면 소유자에게 반환한다', () => {
  assert.equal(decideVerificationRoute(passingState({
    guardianVerdict: 'UNVERIFIED', challengerVerdict: 'UNVERIFIED',
  })), 'RETURN_TO_OWNER')
})

test('차단 조건은 기계 검증 실패보다 우선한다', () => {
  assert.equal(decideVerificationRoute(passingState({
    deadlineExceeded: true, mechanicalPassed: false,
  })), 'BLOCKED')
})

test('state가 객체가 아니면 TypeError를 던진다', () => {
  for (const state of [undefined, null, [], 'state']) {
    assert.throws(() => decideVerificationRoute(state), TypeError)
  }
})

test('라우팅 정수 필드는 0 이상의 안전한 정수만 허용한다', () => {
  for (const field of ['cycle', 'sameFailureCount', 'modificationCount']) {
    for (const value of [undefined, NaN, '1', -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
      assert.throws(() => decideVerificationRoute(passingState({ [field]: value })), RangeError)
    }
  }
})

test('라우팅 boolean 필드는 실제 boolean만 허용한다', () => {
  for (const field of ['deadlineExceeded', 'mechanicalPassed']) {
    for (const value of [undefined, 0, 1, 'false', null]) {
      assert.throws(() => decideVerificationRoute(passingState({ [field]: value })), TypeError)
    }
  }
})

test('첫 cycle은 누적 8개에서 2개를 추가 허용한다', () => {
  assert.equal(scenarioAllowance({ cycle: 1, existingCount: 8 }), 2)
})

test('둘째 cycle은 누적 10개에서 5개를 추가 허용한다', () => {
  assert.equal(scenarioAllowance({ cycle: 2, existingCount: 10 }), 5)
})

test('둘째 cycle은 누적 14개에서 누적 상한까지 1개만 허용한다', () => {
  assert.equal(scenarioAllowance({ cycle: 2, existingCount: 14 }), 1)
})

test('누적 시나리오가 15개 이상이면 추가를 허용하지 않는다', () => {
  assert.equal(scenarioAllowance({ cycle: 1, existingCount: 15 }), 0)
})

test('지원하지 않는 cycle은 추가를 허용하지 않는다', () => {
  assert.equal(scenarioAllowance({ cycle: 0, existingCount: 0 }), 0)
  assert.equal(scenarioAllowance({ cycle: 3, existingCount: 0 }), 0)
})

test('시나리오 입력이 객체가 아니면 TypeError를 던진다', () => {
  for (const input of [undefined, null, [], 'input']) {
    assert.throws(() => scenarioAllowance(input), TypeError)
  }
})

test('시나리오 정수 필드는 0 이상의 안전한 정수만 허용한다', () => {
  for (const field of ['cycle', 'existingCount']) {
    for (const value of [undefined, NaN, '1', -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
      const input = { cycle: 1, existingCount: 0, [field]: value }
      assert.throws(() => scenarioAllowance(input), RangeError)
    }
  }
})
