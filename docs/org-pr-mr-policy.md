# PR and MR Policy

## Purpose

This document defines the review contract for pull requests and merge requests.

## Required PR Content

- what changed
- why it changed
- files touched
- screenshots or recordings if UI changed
- testing notes
- rollback note if the change is risky

## Required MR Content

If the team uses merge requests instead of pull requests, the same rules apply.

The term does not matter.
The review contract does.

## Review Checklist

- [ ] Scope is narrow
- [ ] Behavior changes are explained
- [ ] Tests or manual verification are listed
- [ ] No unrelated files are included
- [ ] Existing features were preserved
- [ ] New UI still works in light and dark mode
- [ ] AI usage is documented if applicable
- [ ] Rollback path is clear

## Approval Rules

At least one human reviewer must approve.

For high-risk changes, require:
- 1 reviewer for code quality
- 1 reviewer for product behavior
- 1 reviewer for release readiness if the change is user-facing

## Merge Rules

Do not merge if:
- the checklist is incomplete
- the diff is too broad
- the PR message is vague
- the branch contains unrelated edits
- a risky AI-backed change is unreviewed

## AI-Assisted Review Rules

LLM review can be used for:
- bug risk detection
- missing tests
- inconsistent naming
- incomplete doc updates
- likely regressions

LLM review cannot replace:
- human judgment
- release ownership
- security review

