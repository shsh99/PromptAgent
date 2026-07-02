# 새 실행 재개 계약

## 재사용하는 결정

- 이슈 #13의 승인 설계와 구현 계획을 유지한다.
- Codex 네이티브 `.agents/skills/`, 승인 Seed, 제한형 검증 cycle 구조를 유지한다.
- 기존 Task 1·2의 승인 commit과 GREEN 검증 근거를 재사용한다.

## 수정할 확인된 결함

1. `tests/governance/workflows.test.mjs`가 이전 `/skills/` CODEOWNERS 경로를 기대한다.
2. `scenarioAllowance({ cycle: 2, existingCount: 0 })`가 15를 반환하지만 cycle 2 신규 상한은 5다.

두 항목은 서로 다른 child branch와 독립 검토로 처리한다. 각 수정은 매니페스트의 총 수정 시도 한도를 1회씩 소비한다. 이후 새 결함이 확인되면 추가 수정하지 않고 `blocked`로 전환한다.

## 검증 순서

1. 실패 재현과 최근 변경 비교
2. 회귀 테스트 RED 확인
3. 최소 수정과 전용 테스트 GREEN
4. 하네스·diff 검증
5. 구현자와 분리된 명세 검토, 품질 검토
6. 승인 commit만 통합 브랜치에 cherry-pick
