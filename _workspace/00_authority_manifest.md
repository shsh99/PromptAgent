# 권한 및 실행 매니페스트

- 상태: `running`
- 실행 모드: 새 실행
- 이슈: `#13 [기능] Codex 네이티브 하네스와 제한형 검증 루프 구축`
- 통합 브랜치: `feat/13-harness-evolution`
- 시작 SHA: `4d6f1ea69213c8a1c0fec55ce8f1c43d3edb52f9`
- 시작 시각: `2026-07-01T22:19:12.9996213+09:00`
- deadline: `2026-07-01T23:19:12.9996213+09:00`
- 누적 수정 시도: `0/2`
- 같은 SHA 수정 상한: `1회`
- 실행당 이슈: `1/1`

## 외부 쓰기 권한

| 작업 | 권한 | 범위 |
|---|---|---|
| 이슈 생성 | allowed | 저장소 `shsh99/PromptAgent`, 이 실행에서는 기존 #13만 사용 |
| push | allowed | `feat/13-harness-evolution`, 1회 |
| PR | allowed | 위 브랜치에서 `dev` 대상, 1회 |
| merge | allowed | 성공한 CI와 독립 검토 후 squash merge, 1회 |
| close | allowed | 이슈 #13 명시 close, 1회 |
| deploy | denied | 모든 환경 |

## 이번 실행 범위

1. CODEOWNERS 스킬 경로 회귀 테스트를 현재 `.agents/skills/` 계약과 동기화한다.
2. 검증 cycle 2의 신규 시나리오 상한을 5개로 제한한다.
3. 승인된 검증 cycle을 통합한 뒤 적대적 검증 스킬, 역할, 오케스트레이터 연결과 문서를 완성한다.

## 보존 근거

- 직전 실행 산출물: `_workspace_prev/20260701-221912/`
- 직전 차단 보고서: `_workspace_prev/20260701-221912/03_blocked_status.md`
- 검증 cycle 후보 commit: `c7468b4eaadd881874ae1f554f46f18883df0093`

