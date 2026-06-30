# 이슈 #11 실행 권한 매니페스트

- 상태: running
- 시작: 2026-06-30T14:54:24+09:00
- deadline: 2026-06-30T15:54:24+09:00
- 현재 SHA: fd36e7261d5d7cca5cde97277e55b43983b59794
- 누적 수정 시도: 0 / 2
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
