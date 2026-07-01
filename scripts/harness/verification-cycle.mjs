const VERDICTS = new Set(['PASS', 'FAIL', 'UNVERIFIED'])

const assertObject = (value, name) => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${name} must be an object`)
  }
}

const assertNonNegativeSafeInteger = (value, name) => {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative safe integer`)
  }
}

const assertBoolean = (value, name) => {
  if (typeof value !== 'boolean') throw new TypeError(`${name} must be a boolean`)
}

export const decideVerificationRoute = (state) => {
  assertObject(state, 'state')
  assertNonNegativeSafeInteger(state.cycle, 'cycle')
  assertNonNegativeSafeInteger(state.sameFailureCount, 'sameFailureCount')
  assertNonNegativeSafeInteger(state.modificationCount, 'modificationCount')
  assertBoolean(state.deadlineExceeded, 'deadlineExceeded')
  assertBoolean(state.mechanicalPassed, 'mechanicalPassed')

  if (
    state.modificationCount >= 2
    || state.sameFailureCount >= 2
    || state.cycle > 2
    || state.deadlineExceeded
  ) return 'BLOCKED'

  if (!state.mechanicalPassed) return 'RETURN_TO_OWNER'
  if (!VERDICTS.has(state.guardianVerdict) || !VERDICTS.has(state.challengerVerdict)) {
    return 'BLOCKED'
  }
  if (state.guardianVerdict !== state.challengerVerdict) return 'JUDGE'
  if (state.guardianVerdict === 'PASS') return 'ACCEPT'
  return 'RETURN_TO_OWNER'
}

export const scenarioAllowance = (input) => {
  assertObject(input, 'input')
  assertNonNegativeSafeInteger(input.cycle, 'cycle')
  assertNonNegativeSafeInteger(input.existingCount, 'existingCount')

  const cycleLimit = input.cycle === 1 ? 10 : input.cycle === 2 ? 15 : 0
  return Math.max(0, cycleLimit - input.existingCount)
}
