# 이슈 #13 두 번째 차단 보고

## 상태

`blocked`

## 이번 실행에서 완료한 범위

- Windows casing 경로 우회 테스트와 canonical Git index 경로 처리
- tracked HEAD 조회 fail-closed
- 대소문자 후보 충돌 fail-closed
- Seed 테스트 11/11, 하네스, quick_validate, 이전 승인 Seed 검증
- Task 2 독립 품질 검토 승인과 integration 반영
- `spec-crystallization` with-skill GREEN 검증

## 미통합 Task 3

- child worktree: `C:\Users\ggg99\.config\superpowers\worktrees\PromptAgent\13-verification-cycle`
- branch: `feat/13-verification-cycle`
- commit: `c7468b4eaadd881874ae1f554f46f18883df0093`
- 전용 테스트: 22/22 통과
- 명세 검토: 실패

## 결함 1: 둘째 cycle 상한

`scenarioAllowance({ cycle: 2, existingCount: 0 })`이 15를 반환한다. 둘째 cycle은 누적 잔여가 충분해도 신규 시나리오를 최대 5개만 추가해야 한다. cycle별 최대와 누적 잔여의 최솟값을 사용하고 이 경계를 테스트해야 한다.

## 결함 2: CODEOWNERS 회귀 테스트

`.github/CODEOWNERS`는 `/.agents/skills/`로 전환됐지만 `tests/governance/workflows.test.mjs`가 기존 `/skills/` 기대값을 유지한다. 전체 결과는 30/31이며 Task 3 parent에서도 재현된다.

## 예산

- Windows canonical path 수정: 1회
- 다중 case-insensitive 후보 수정: 1회
- 누적: 2 / 2

## 재개 조건

사용자가 새 실행을 승인하면 현재 `_workspace/`를 보존하고 예산을 0/2로 초기화한다. CODEOWNERS 회귀 테스트와 Task 3 cycle 2 경계 테스트를 각각 RED로 확인한 뒤 두 최소 수정을 수행하고 독립 검토를 재개한다.
