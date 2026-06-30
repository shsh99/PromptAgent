# 이슈 #11 실행 권한 매니페스트

- 상태: blocked
- 시작: 2026-06-30T14:54:24+09:00
- deadline: 2026-06-30T15:54:24+09:00
- 현재 integration SHA: f6debff
- backend 후보 SHA: 7a74b14484d6dcb5a36074d5711595846bcc6fa5
- frontend 후보 SHA: 352cd7df51ad53638cfded1dbb278496e143563d
- 누적 수정 시도: 2 / 2
- 실행당 이슈: #11 한 개

## 외부 쓰기 권한

| 작업 | 권한 | 범위 | 최대 횟수 | 만료 조건 |
|---|---|---|---:|---|
| 이슈 생성 | allowed | PromptAgent #11은 이미 생성됨 | 0 | 이 실행 종료 |
| push | allowed | `feat/11-prompt-market` | 2 | 이 실행 종료 |
| PR | allowed | 위 브랜치에서 `dev` 대상 | 1 | 이 실행 종료 |
| merge | allowed | PR checks 통과 후 squash merge | 1 | 이 실행 종료 |
| close | allowed | 병합 후 이슈 #11 | 1 | 이 실행 종료 |
| deploy | denied | 모든 환경 | 0 | 별도 사용자 승인 전 |

## 실행 한도

- 같은 SHA 수정은 최대 1회다.
- 전체 수정은 SHA 변경과 무관하게 최대 2회다.
- CI pending은 최대 20분이며 전체 deadline을 넘지 않는다.
- 승인된 다음 이슈는 없으므로 #11 종료 후 이번 실행을 종료한다.

## 차단 상태

- 원인: backend 독립 검토 수정 2회로 전체 수정 시도 상한에 도달한 뒤 frontend 독립 검토에서 추가 결함이 발견됐다.
- 미해결: 6개 상위 그룹 렌더 구조, stale 요청 응답 차단, exact API key 검증, 페이지 이동·popstate 복원, 상세 loading 취소·초점, 갱신 오류 버튼 hit target.
- 보존 상태: backend와 frontend child worktree 및 후보 commit은 삭제·통합하지 않고 유지한다.
- 필요한 조치: 사용자가 이슈 #11에 대한 새 실행을 승인하면 현재 산출물을 `_workspace_prev/`에 보존하고 수정 예산을 새로 부여한 뒤 frontend 결함부터 재개한다.
