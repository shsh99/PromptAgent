---
name: repository-governance
description: Use when issues, branches, Korean commits, pull requests, repository policy, CI checks, deployments, secrets, rollbacks, or release workflows are created, 재실행, 업데이트, 수정, fixed, audited, or reviewed.
---

# Repository Governance

## 개요

저장소 변경을 이슈에서 검증·병합까지 추적 가능하게 만들고 자동화에는 최소 권한과 재현 가능한 로컬 진입점을 적용한다.

## 입력

이슈·브랜치·PR 상태, 저장소 정책, 변경 범위, 로컬 검증 명령, CI 로그, 배포 환경을 읽는다.

## 워크플로우

1. 한글 이슈의 목적·범위·완료 조건을 확인한다.
2. 허용된 이슈 연결 브랜치와 한글 커밋·PR 규칙을 적용한다.
3. 로컬과 CI가 같은 결정적 명령을 실행하도록 한다.
4. workflow 권한을 최소화하고 비밀은 값이 아닌 이름·회전 절차만 문서화한다.
5. 필수 checks, 리뷰, 롤백 가능성을 확인한 후에만 병합 가능 상태를 보고한다.

## 출력

정책·자동화 변경과 `_workspace/04_devops-governance_result.md`에 브랜치·PR, 권한, checks, 배포·롤백 영향, 차단 요소를 기록한다.

## 이전 산출물 개선

이전 실패 로그와 gate 상태를 읽고 영향받은 검증만 재실행한다. 과거 로그를 삭제하거나 성공으로 덮어쓰지 말고, 시도별 SHA·명령·결과를 보존한다.

## 검증

저장소가 제공하는 governance·test·build 명령과 `git diff --check`를 실행한다. 최신 커밋의 필수 checks, PR 대상, 이슈 연결, 한글 제목을 확인한다.

## 테스트 시나리오

- **정상 흐름:** 이슈 연결 `feat/` 브랜치의 한글 PR이 `dev`를 대상으로 하고 최소 권한 CI의 모든 필수 checks를 통과한다.
- **오류 흐름:** 필수 secret이 없어 배포 gate가 실패한다. 값을 우회하거나 출력하지 않고 필요한 권한·조치와 재실행 범위를 보고한다.

## 흔한 실수

- 오래된 check로 승인: 최신 SHA의 결과만 사용한다.
- 쓰기 권한을 workflow 전체에 부여: 필요한 job에만 좁힌다.
