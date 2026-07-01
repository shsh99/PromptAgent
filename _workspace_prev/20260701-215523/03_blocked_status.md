# 이슈 #13 차단 보고

## 상태

`blocked`

## 완료된 범위

- 이슈 #13 설계와 구현 계획 승인
- 승인 Seed 수동 SHA-256 고정
- 신규 스킬 없는 RED 기준선 기록
- 프로젝트 스킬 5개를 `.agents/skills/`로 이동
- `.github/CODEOWNERS` canonical 경로 동기화
- Task 1 명세·품질 검토 승인 및 integration 반영

## 미통합 Task 2

- child worktree: `C:\Users\ggg99\.config\superpowers\worktrees\PromptAgent\13-seed-contract`
- branch: `feat/13-seed-contract`
- 최초 구현 SHA: `70c4850a62f2b02d5d132192567a6ea40462124a`
- 수정 SHA: `ab0d7bf91b2c53e31118ddd399c0cefba44d5835`
- integration branch에는 두 commit을 cherry-pick하지 않았다.

## 재현 결함

Windows에서 Git index의 경로가 `seed.md`일 때 사용자가 CLI에 `SEED.md`를 전달하면 파일 read는 성공하지만 `git show HEAD:SEED.md`는 실패한다. 현재 구현은 이를 untracked 파일처럼 취급해 `PENDING`과 변경된 본문을 새 유효 해시로 다시 잠근다.

## 필요한 수정

1. 실패 테스트에서 tracked `seed.md`를 잠가 commit한다.
2. 본문과 해시를 변경한 뒤 CLI에 다른 casing인 `SEED.md`를 전달한다.
3. Git index에서 canonical tracked path를 조회한다.
4. tracked 상태인데 HEAD blob 조회가 실패하면 fail-closed로 종료한다.
5. CLI가 nonzero이고 원본 파일을 변경하지 않는지 검증한다.

## 예산

- Task 1 CODEOWNERS 수정: 1회
- Task 2 불변성·CLI·metadata 수정: 1회
- 누적: 2 / 2

## 재개 조건

사용자가 새 실행을 승인하면 `_workspace/`를 이전 실행으로 보존하고 수정 예산을 0/2로 초기화한다. 위 재현 테스트를 RED로 확인한 뒤 Task 2만 부분 재실행하고 명세·품질 재검토를 다시 수행한다.
