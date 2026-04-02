# LLM Code Review Policy

## Purpose

Use LLMs to catch obvious issues faster, while keeping humans responsible for the final call.

## Review Scope

LLM review should check:
- missing null checks
- unsafe assumptions
- naming drift
- unhandled empty states
- likely regressions
- poor separation of concerns
- missing docs or tests

## Review Output Format

Every LLM review should return:
- severity
- file
- line or region
- reason
- suggested fix
- confidence

## Do Not Use LLM Review For

- approval by itself
- security sign-off
- architectural final decisions
- release sign-off

## Human Review Still Required

Humans must verify:
- correctness
- product fit
- rollout risk
- compatibility with existing flows

## Review Workflow

1. Run the LLM review.
2. Summarize the findings.
3. Fix the confirmed issues.
4. Re-run targeted checks.
5. Open the PR.
6. Human review before merge.

