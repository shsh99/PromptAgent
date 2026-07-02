# 권한 및 실행 매니페스트

- 상태: `blocked`
- 실행 모드: 새 실행
- 이슈: `#13 [기능] Codex 네이티브 하네스와 제한형 검증 루프 구축`
- 통합 브랜치: `feat/13-harness-evolution`
- 시작 SHA: `f34a254e88711585cd76a329f8d1a30b291dc891`
- 시작 시각: `2026-07-02T13:48:31.4329389+09:00`
- deadline: `2026-07-02T14:48:31.4329389+09:00`
- 누적 수정 시도: `2/2`
- 같은 SHA 수정 상한: `1회`
- 실행당 이슈: `1/1`

## 외부 쓰기 권한

| 작업 | 권한 | 범위 |
|---|---|---|
| 이슈 생성 | allowed | 저장소 `shsh99/PromptAgent`, 기존 #13만 사용 |
| push | allowed | `feat/13-harness-evolution`, 1회 |
| PR | allowed | 위 브랜치에서 `dev` 대상, 1회 |
| merge | allowed | 성공한 CI와 독립 검토 후 squash merge, 1회 |
| close | allowed | 이슈 #13 명시 close, 1회 |
| deploy | denied | 모든 환경 |

## 이번 실행 범위

1. Task 4 후보의 기계 실패 상태를 `RETURN_TO_OWNER`와 수정 횟수 증가 계약에 맞춘다.
2. 판정자 실패를 fail-closed `blocked`로 고정한다.
3. Task 4 재검토 후 Task 5 오케스트레이터 통합과 Task 6 문서·전체 검증·PR 절차를 이어간다.

## 보존 근거

- 직전 실행 산출물: `_workspace_prev/20260702-134831/`
- 직전 차단 보고서: `_workspace_prev/20260702-134831/03_blocked_status.md`
- Task 4 후보 commit: `6a9cabddd9cc529cb49151f354477a59ae0de707`

## 수정 시도 기록

1. `6a9cabd` 명세 검토의 상태 전이 결함 2건을 원 child branch에 반환
2. `a33b529` 명세 검토의 `adversarial-verification` workflow 회귀 token 누락을 원 child branch에 반환

## 차단 상태

- 마지막 통합 구현 SHA: `51e7d0f`
- 차단 시각: `2026-07-02T14:04:00+09:00`
- 원인: Task 5 보정 후 독립 입력 회귀 token 누락이 남았고 총 수정 시도 `2/2`, 같은 SHA 보정 `1/1` 소진
- 미통합 child commits: `a33b5297b8dc2b243a2a8fa05dc314487a95fb84`, `9d8813c3d11caa19a7e159bb9ebe047eda4f966a`
- 재개 조건: 사용자가 새 실행을 승인하고 새 수정 예산·deadline을 발급한다.
