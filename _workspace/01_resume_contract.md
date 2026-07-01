# 이슈 #13 부분 재실행 계약

## 재사용 입력

- 설계: `docs/superpowers/specs/2026-06-30-codex-native-harness-evolution-design.md`
- 계획: `docs/superpowers/plans/2026-06-30-codex-native-harness-evolution.md`
- 승인 Seed: `_workspace_prev/20260701-215523/01_seed_contract.md`
- 차단 근거: `_workspace_prev/20260701-215523/03_blocked_status.md`
- Task 2 child SHA: `ab0d7bf91b2c53e31118ddd399c0cefba44d5835`

## 확인된 근본 원인

Windows 파일시스템은 `seed.md`와 `SEED.md`를 같은 파일로 읽지만 `git show HEAD:SEED.md`는 Git tree의 case-sensitive 경로를 찾지 못한다. 기존 구현이 HEAD 조회 실패를 untracked로 해석해 fail-open으로 재잠금을 허용했다.

## 수정 가설

사용자 입력 경로를 직접 `git show`에 전달하지 않는다. 먼저 Git index에서 case-insensitive하게 일치하는 canonical tracked path를 결정하고 그 경로로 HEAD blob을 읽는다. tracked 경로를 확인했는데 HEAD blob을 읽지 못하면 fail-closed로 종료한다.

## 완료 조건

1. 임시 Git 저장소에서 `seed.md`를 commit한 뒤 `SEED.md` casing으로 재잠금 우회를 재현하는 테스트가 수정 전 FAIL한다.
2. 최소 수정 후 casing 우회 CLI가 nonzero이고 파일을 변경하지 않는다.
3. 신규 untracked Seed 잠금과 기존 locked Seed idempotent 실행은 유지된다.
4. Seed 전체 테스트, 하네스, quick_validate, 실제 승인 Seed 검증, diff check가 통과한다.
