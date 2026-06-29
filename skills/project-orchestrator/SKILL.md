---
name: project-orchestrator
description: Use when starting or continuing project delivery, including Korean issue-driven features, 재실행, 업데이트, 수정, 보완, partial reruns, review fixes, pull requests, CI failures, merges, or next-task selection.
---

# Project Orchestrator

## 개요

한글 이슈를 하나의 추적 가능한 작업 단위로 삼아 설계·구현·점진 QA·저장소 운영을 연결한다. 근거가 남는 순차 게이트와 소유 경계가 전체 처리량보다 우선한다.

## 실행 모드

1. `_workspace/`가 없으면 **초기 실행**이다.
2. `_workspace/`가 있고 새 입력·새 이슈라면 **새 실행**이다. 기존 디렉터리를 `_workspace_prev/{timestamp}/`로 이동하여 모든 산출물을 보존한 뒤 새 `_workspace/`를 만든다.
3. `_workspace/`가 있고 특정 결과의 수정·보완 요청이면 **부분 재실행**이다. 관련 산출물과 의존 결과를 읽고 해당 담당자와 영향받는 QA만 호출한다.

모드를 판단할 수 없으면 기존 파일을 덮어쓰지 말고 사용자에게 선택을 요청한다.

## 입력

- 사용자 목표와 완료 조건
- 현재 브랜치·이슈·PR·checks 상태
- 기존 `_workspace/` 산출물과 저장소 정책

## 워크플로우

1. 완료 조건, 범위, 위험을 담은 **한글 이슈**를 생성하거나 확인한다.
2. 최신 `dev`에서 `feat/{issue-number}-{slug}` 브랜치를 만든다.
3. architecture에 계약을 맡기고 결과를 `_workspace/01_architecture_contract.md`에 받는다.
4. 파일·계약 소유가 **비중첩**인 작업만 병렬 실행한다. 공유 파일, 같은 API/스키마, 선행 계약 의존이 있으면 순차 실행한다.
5. spring-rag, react-ui, devops-governance에 이슈·허용 경로·검증·산출물 경로를 지정해 배정한다.
6. 모듈 하나가 끝날 때마다 qa-migration이 API·UI·DB 경계를 교차 검증한다.
7. 리뷰 결함을 소유자에게 반환하고 수정 후 영향 경계를 재검증한다. 실패는 원인을 보정해 **1회 재시도**한다. 다시 실패하면 해당 결과 없이 진행 가능한지 판단하고 최종 보고에 **누락**과 영향을 명시한다.
8. 범위, 테스트, `git diff --check`를 확인한 뒤 한글 커밋을 만들고 브랜치를 push한다.
9. 한글 제목·본문과 이슈 연결로 `dev` 대상 PR을 만든다.
10. 필수 checks와 리뷰를 확인한다. 실패하면 소유자 수정 → 검증 → push를 반복하며, 해결되지 않은 필수 check가 있으면 병합하지 않는다.
11. 승인된 PR을 **squash merge**하고 로컬 `dev`를 checkout하여 `git pull --ff-only origin dev`로 동기화한다.
12. 이슈·산출물 상태를 정리하고 우선순위에 따라 다음 한글 이슈를 선택하거나 생성한다.

## 출력

- `_workspace/{phase}_{agent}_{artifact}.md` 중간 산출물(삭제하지 않음)
- 담당·의존성·검증 상태표
- 한글 이슈·커밋·PR, checks, squash merge, `dev` 동기화 결과
- 누락, 잔여 위험, 다음 작업

## 에러 정책

상충 결과는 삭제하지 말고 출처와 선택 근거를 병기한다. 외부 권한·비밀·보호 규칙이 막으면 우회하지 않는다. 각 실패는 1회 재시도 후 누락 또는 차단으로 보고한다.

## 검증

- 브랜치가 이슈 번호를 포함하고 PR 대상이 `dev`인지 확인한다.
- 변경 파일이 담당 범위와 일치하고 비중첩 병렬 조건을 지켰는지 확인한다.
- 모듈별 QA, 전체 테스트, 필수 checks, squash merge SHA, 최신 `dev`를 근거로 남긴다.
- `_workspace/`와 `_workspace_prev/` 산출물이 보존되었는지 확인한다.

## 테스트 시나리오

- **정상 흐름:** 새 기능 요청에 한글 이슈를 만들고 `feat/42-intent-search`에서 백엔드와 비중첩 UI 작업을 병렬 배정한다. 모듈별 QA와 checks 통과 후 한글 커밋·push·`dev` PR·squash merge·`dev` 동기화·다음 이슈까지 기록한다.
- **오류 흐름:** 부분 재실행 중 QA 명령이 실패한다. 환경을 보정해 1회 재시도하고 재실패 시 해당 검증을 누락으로 표시하여 필수 gate라면 병합을 중단하며 기존 산출물은 보존한다.

## 흔한 실수

- 기존 `_workspace/` 덮어쓰기: 감사 추적이 끊기므로 먼저 실행 모드를 판정한다.
- 파일만 다르면 병렬화: 같은 계약을 바꾸면 중첩 작업이므로 순차화한다.
- checks 대기 없이 병합: 최신 커밋의 필수 checks를 확인한다.
