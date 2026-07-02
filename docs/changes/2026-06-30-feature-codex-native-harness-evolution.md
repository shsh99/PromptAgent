# Codex 네이티브 하네스와 제한형 검증 루프

## PR 정보

- 관련 이슈: #13
- 대상 브랜치: `dev`
- 작업 브랜치: `feat/13-harness-evolution`
- 종료 조건: `Closes #13`

## 작업 목적

프로젝트 스킬을 Codex가 자동 발견하는 경로로 정리하고, 구현 전에 승인 계약을 고정하며, integration 결과를 제한된 독립 검토로 검증하는 재현 가능한 개발 하네스를 구축한다.

## 변경 내용

- 프로젝트 스킬의 canonical 경로를 `.agents/skills/`로 전환했다.
- `spec-crystallization`과 SHA-256 Seed 잠금·검증 도구를 추가했다.
- 기계 검증, 최대 2개 cycle, 시나리오 10+5개, 동일 실패 조기 중단을 결정하는 상태 계약을 추가했다.
- attacker, evidence guardian, solution challenger, judge 역할과 `adversarial-verification` 스킬을 추가했다.
- guardian과 challenger의 입력에서 상대 보고서를 배제하고, verdict가 불일치할 때만 judge를 호출하도록 오케스트레이터 회귀 계약을 고정했다.
- 운영 런북에 Seed 변조, 판정 실패, 반복 실패, rollback 절차를 추가했다.

## 영향 범위

- 저장소 로컬 개발 하네스, agent 역할 계약, governance·harness 테스트와 프로젝트 문서가 영향을 받는다.
- Spring Boot·React 제품 런타임, 공개 API, 데이터베이스 스키마에는 변경이 없다.
- 제품은 추천 에이전트 패키지를 실행하지 않는 기존 경계를 유지한다.

## 테스트 결과

- RED 근거: 변경 전 PR governance가 `PR 변경 범위에 docs/changes/*.md 변경 문서가 없습니다.`로 실패했다.
- Node.js 22.22.0에서 Seed·검증 cycle·스킬 트리거 테스트 36개가 통과했다.
- 문서 구조 검사, governance 31개, 하네스 구조 검사와 `git diff --check`가 모두 통과했다.

## 배포 및 마이그레이션 영향

제품 배포와 데이터 마이그레이션은 없다. 하네스 기준은 Node.js 22 이상이며 Ouroboros Python MCP, 별도 Agent OS, OMC·Claude Code 플러그인·훅 같은 외부 런타임은 설치하지 않는다.

## 위험 요소와 롤백

- 잘못 고정된 Seed나 불완전한 증거가 검증을 차단할 수 있으므로 amendment 재승인과 fail-closed 절차를 사용한다.
- 오류가 있으면 승인되지 않은 child commit을 제외하거나 integration에서 해당 commit을 revert한다. merge 이후에는 squash SHA를 되돌리는 별도 revert PR을 사용한다.
- 수정 2회, SHA별 1회, 60분 deadline과 동일 실패 2-cycle 중단 제한은 완화하지 않는다.

## AI 사용

Codex 프로젝트 오케스트레이터가 역할별 child worktree, 독립 검토, 기계 검증과 fan-in을 관리했다. Ouroboros의 인터뷰·Seed 고정·단계 검증과 OMC의 세션 상태·모드 소유권·동일 실패 중단 패턴만 선택 적용했으며 두 도구 전체나 외부 런타임은 도입하지 않았다. 생성된 코드와 문서는 자동 테스트와 분리된 검토 근거로 확인한다.

## 관련 문서

- [전체 시스템 아키텍처](../architecture/system-overview.md)
- [운영 런북](../operations/runbook.md)
- [모듈 구조](../architecture/module-structure.md)
- [Git 작업 흐름](../conventions/git-workflow.md)
- [설계 명세](../superpowers/specs/2026-06-30-codex-native-harness-evolution-design.md)
