# 이슈 #13 실행 권한 매니페스트

- 상태: running
- 시작: 2026-06-30T21:18:59+09:00
- deadline: 2026-06-30T22:18:59+09:00
- 기준 dev SHA: fc2e304dc71f462c725842b9d40c08ebba0ec24c
- 현재 integration branch: `feat/13-harness-evolution`
- 누적 수정 시도: 1 / 2
- 실행당 이슈: #13 한 개
- 이전 실행: `_workspace_prev/20260630-211859/`

## 외부 쓰기 권한

| 작업 | 권한 | 범위 | 최대 횟수 | 만료 조건 |
|---|---|---|---:|---|
| 이슈 생성 | allowed | PromptAgent #13 | 1 | 생성 완료 |
| push | allowed | `feat/13-harness-evolution` | 2 | 이 실행 종료 |
| PR | allowed | 위 브랜치에서 `dev` 대상 | 1 | 이 실행 종료 |
| merge | allowed | checks 통과 후 squash merge | 1 | 이 실행 종료 |
| close | allowed | 병합 후 이슈 #13 | 1 | 이 실행 종료 |
| deploy | denied | 모든 환경 | 0 | 별도 사용자 승인 전 |

## 실행 범위와 한도

- Codex 네이티브 저장소 스킬 전환과 제한형 검증 루프만 다룬다.
- Ouroboros MCP와 OMC 전체 설치는 수행하지 않는다.
- 같은 SHA 수정은 최대 1회, 전체 수정은 최대 2회다.
- CI pending은 최대 20분이며 전체 deadline을 넘지 않는다.
- 승인된 다음 이슈는 없으므로 #13 종료 후 실행을 종료한다.

## 수정 기록

- 1회차: Task 1 품질 검토에서 `.github/CODEOWNERS`의 레거시 `/skills/` 경로를 발견했다. canonical 경로와 stale-reference 검사 범위를 수정한 뒤 재검토한다.
