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
- 외부 쓰기별 사용자 승인과 승인 범위
- 현재 브랜치·이슈·PR·checks 상태
- 기존 `_workspace/` 산출물과 저장소 정책

## 권한 매니페스트

실행 시작 시 `_workspace/00_authority_manifest.md`를 만들고 `이슈 생성`, `push`, `PR`, `merge`, `close`, `deploy` 각각을 `allowed` 또는 `denied`로 기록한다. 각 권한의 승인 범위에는 저장소, 이슈·브랜치, 대상 환경, 최대 횟수, 만료 조건을 적는다. 명시되지 않은 권한은 미승인으로 간주하며 해당 외부 쓰기 직전에 정지하고 승인을 요청한다. 읽기·로컬 검증은 계속할 수 있지만 권한을 묶거나 확대 해석하지 않는다.

devops-governance는 이 매니페스트에서 현재 작업과 환경에 대한 `merge` 또는 `deploy` 승인을 다시 확인한다. 매니페스트와 사용자 지시가 충돌하면 더 좁은 승인 범위를 적용하고 `blocked`로 보고한다.

## 서브에이전트 팀 운영

관리자 오케스트레이션은 **B 방식의 subagent-driven 팀 배정**으로 재현한다. 프로젝트 환경 기본 또는 역할 적합 모델을 선택하며 특정 벤더 모델명을 하드코딩하지 않는다.

| 역할 | 입력 | 출력 | 의존성 |
|------|------|------|--------|
| architecture | 이슈·제품 문서 | 계약·작업 경계 | 없음 |
| spring-rag / react-ui / devops-governance | 계약·허용 경로·검증 명령 | 독립 commit·결과 산출물 | architecture, 필요 시 선행 계약 |
| qa-migration 검토 에이전트 | 계약·구현 diff·테스트 결과 | 독립 검토 보고서 | 해당 구현 완료 |

각 작업은 전용 **worktree**, 이슈 연결 **branch**, 단일 담당자의 **commit 소유**를 갖는다. 배정 메시지에 역할, 입력, 출력, 의존성, 허용 파일, 완료 조건을 넣는다. 파일 또는 계약 중첩은 병렬화하지 않으며, 예상치 못한 충돌은 임의 병합하지 않고 관리자에게 즉시 보고한다. 구현자는 자기 결과를 승인하지 않고 분리된 qa-migration 검토 에이전트가 명세·품질을 확인한 뒤 수정 작업을 원 소유자에게 돌려보낸다.

## 실행 예산과 종료 조건

- 기본 **CI pending timeout**은 20분이다. 시간 내 최종 상태가 없으면 `blocked`로 기록하고 재개 조건을 남긴다.
- 같은 **SHA별 최대 수정 1회**만 허용한다. 새 실패를 무한히 고치지 말고 한도 도달 시 `blocked`로 전환한다.
- **실행당 최대 이슈** 수는 1개다. 추가 요청은 사용자가 승인한 **승인 backlog**에만 기록한다.
- 상태는 `running`, `blocked`, `completed` 중 하나로 기록한다. `blocked`에는 원인, 마지막 SHA, 필요한 승인·수동 조치, 재개 조건을 포함한다.
- 현재 이슈 종료 후 **승인된 다음 이슈**가 없으면 실행을 종료한다. 승인 backlog를 임의 확장하거나 자동 재귀 호출하지 않는다. **무한 루프 금지**가 모든 재시도·다음 작업 규칙보다 우선한다.

## 워크플로우

1. 권한 매니페스트와 실행 예산을 기록한다. 외부 쓰기는 해당 권한이 허용된 경우에만 수행한다.
2. 완료 조건, 범위, 위험을 담은 **한글 이슈**를 생성하거나 확인한다.
3. 최신 `dev`에서 `feat/{issue-number}-{slug}` 브랜치를 만든다.
4. architecture에 계약을 맡기고 결과를 `_workspace/01_architecture_contract.md`에 받는다.
5. 파일·계약 소유가 **비중첩**인 작업만 독립 worktree에서 병렬 실행한다.
6. 구현 결과마다 분리된 qa-migration이 API·UI·DB 경계와 명세를 검토한다.
7. 리뷰 결함을 원 commit 소유자에게 반환한다. 일반 실패는 **1회 재시도**, CI 수정은 SHA별 한도 안에서만 수행한다.
8. 범위, 테스트, `git diff --check`를 확인한 뒤 한글 커밋을 만들고 승인된 경우에만 branch를 push한다.
9. 한글 제목·본문과 이슈 연결로 승인된 `dev` 대상 PR을 만든다.
10. 필수 checks를 CI pending timeout까지 확인한다. 실패·pending 한도를 넘으면 `blocked`로 정지한다.
11. `merge`가 승인된 PR만 **squash merge**하고 로컬 `dev`를 `git pull --ff-only origin dev`로 동기화한다.
12. `dev`는 기본 브랜치가 아닐 수 있으므로 PR 문구의 **자동 close**에 의존하지 않는다. 승인된 `close` 권한으로 issue API 또는 `gh issue close`를 호출해 명시적으로 닫고 상태를 재조회한다. 실패하면 `blocked`와 수동 조치를 기록한다.
13. 현재 이슈를 정리하고 승인된 다음 이슈가 있을 때만 새 실행을 시작한다. 없으면 종료한다.

## 출력

- `_workspace/{phase}_{agent}_{artifact}.md` 중간 산출물(삭제하지 않음)
- 담당·의존성·검증 상태표
- 한글 이슈·커밋·PR, checks, squash merge, `dev` 동기화 결과
- 누락, 잔여 위험, 다음 작업

## 에러 정책

상충 결과는 삭제하지 말고 출처와 선택 근거를 병기한다. 외부 권한·비밀·보호 규칙이 막으면 우회하지 않는다. 각 실패는 1회 재시도 후 누락 또는 차단으로 보고한다.

## 런타임 및 통합

하네스 검증의 기준 런타임은 **Node.js 22**이며 테스트 시작 시 실제 버전을 진단 출력한다. 이 작업에서는 `package.json`을 수정하지 않는다. 하네스 검증을 npm의 **표준 script**로 연결하는 작업은 저장소 통합 단계에서 수행하고, 그 전에는 `node tests/harness/validate-harness.mjs`를 직접 실행한다.

## 이전 산출물 개선

부분 재실행에서는 관련 `_workspace/` 산출물과 사용자 피드백을 읽고 요청된 계약만 갱신한다. 새 실행에서는 기존 결과를 `_workspace_prev/{timestamp}/`에 보존하고, 재사용한 결정과 폐기한 결정의 이유를 새 산출물에 기록한다.

## 검증

- 브랜치가 이슈 번호를 포함하고 PR 대상이 `dev`인지 확인한다.
- 변경 파일이 담당 범위와 일치하고 비중첩 병렬 조건을 지켰는지 확인한다.
- 모듈별 QA, 전체 테스트, 필수 checks, squash merge SHA, 최신 `dev`를 근거로 남긴다.
- authority manifest, 실행 예산, 명시적 issue close 결과와 최종 상태를 확인한다.
- `_workspace/`와 `_workspace_prev/` 산출물이 보존되었는지 확인한다.

## 테스트 시나리오

- **정상 흐름:** 승인된 한글 이슈 1개를 독립 worktree에 배정하고 분리 검토와 checks를 통과한다. 승인된 push·PR·squash merge 후 issue API로 명시 close하고 `dev`를 동기화한다. 승인된 다음 이슈가 없어 종료한다.
- **오류 흐름:** CI가 20분 동안 pending이거나 명시 close가 실패한다. 추가 수정·다음 이슈를 자동 반복하지 않고 `blocked` 상태, 마지막 SHA, 수동 조치와 재개 조건을 기록하며 기존 산출물을 보존한다.

## 흔한 실수

- 기존 `_workspace/` 덮어쓰기: 감사 추적이 끊기므로 먼저 실행 모드를 판정한다.
- 파일만 다르면 병렬화: 같은 계약을 바꾸면 중첩 작업이므로 순차화한다.
- checks 대기 없이 병합: 최신 커밋의 필수 checks를 확인한다.
- PR 병합이 이슈를 닫았다고 가정: `dev` 병합 후 이슈 상태를 API로 확인하고 명시 close한다.
- backlog를 자동 실행: 승인과 실행당 이슈 한도를 확인하고 종료한다.
