# 이슈 #13 부분 재실행 권한 매니페스트

- 상태: running
- 시작: 2026-07-01T21:55:23+09:00
- deadline: 2026-07-01T22:55:23+09:00
- 현재 integration SHA: `b0a72774aae939a59a53c943fa2a5afa5575321b`
- 수정 대상 child SHA: `ab0d7bf91b2c53e31118ddd399c0cefba44d5835`
- 누적 수정 시도: 1 / 2
- 실행당 이슈: #13 한 개
- 이전 실행: `_workspace_prev/20260701-215523/`

## 외부 쓰기 권한

| 작업 | 권한 | 범위 | 최대 횟수 | 만료 조건 |
|---|---|---|---:|---|
| 이슈 생성 | allowed | PromptAgent #13 기존 이슈 | 0 | 이 실행 종료 |
| push | allowed | `feat/13-harness-evolution` | 2 | 이 실행 종료 |
| PR | allowed | 위 브랜치에서 `dev` 대상 | 1 | 이 실행 종료 |
| merge | allowed | checks 통과 후 squash merge | 1 | 이 실행 종료 |
| close | allowed | 병합 후 이슈 #13 | 1 | 이 실행 종료 |
| deploy | denied | 모든 환경 | 0 | 별도 사용자 승인 전 |

## 재실행 범위와 한도

- 이전 승인 설계·계획·Seed와 Task 1 승인을 재사용한다.
- Task 2의 Windows 경로 casing 우회 실패 테스트와 최소 수정부터 재개한다.
- Task 2 재승인 후 계획의 Task 3~6을 순서대로 수행한다.
- 같은 SHA 수정은 최대 1회, 전체 수정은 최대 2회다.
- CI pending은 최대 20분이며 전체 deadline을 넘지 않는다.
- 승인된 다음 이슈는 없으므로 #13 종료 후 실행을 종료한다.

## 수정 기록

- 1회차: `ab0d7bf`의 Windows casing fail-open을 재현했다. Git index canonical path 조회와 tracked HEAD 조회 fail-closed를 TDD로 수정한다.
