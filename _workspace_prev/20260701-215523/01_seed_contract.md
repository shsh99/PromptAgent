# 이슈 #13 실행 Seed

- 이슈: #13
- 승인 시각: 2026-06-30T21:18:59+09:00
- 승인 근거: 사용자 메시지 `승인 계속진행`
- 설계 commit: `218999f`
- 계획 commit: `3efe202`
- 계약 해시: sha256:a39edf87c667ce2738b1f6fa303f212fd0727bf0cae3536500b3382b2818f23f

## 목표와 사용자 가치

PromptAgent 개발 하네스가 Codex에서 자동 발견되고, 구현 전 승인 계약과 구현 후 독립 검증 근거를 일관되게 보존하도록 한다.

## 범위

- 프로젝트 스킬을 `.agents/skills/` 단일 canonical 경로로 이동한다.
- 명세 결정화와 SHA-256 변조 검증을 구현한다.
- 기계 검증, 공격 시나리오, 보수·대안 독립 검토, 조건부 판정 흐름을 구현한다.
- 기존 오케스트레이터, 하네스 검증, 운영 문서를 갱신한다.

## 비목표

- Ouroboros MCP, OMC, Claude 전용 훅을 설치하지 않는다.
- 공유 Codex 플러그인이나 marketplace를 배포하지 않는다.
- 제품의 에이전트 추천 패키지 실행 기능을 추가하지 않는다.

## 소유 경계

- 결정 스크립트: `scripts/harness/`
- 프로젝트 스킬: `.agents/skills/`
- 역할 계약: `agents/`
- 검증: `tests/harness/`
- 운영 문서와 변경 이력: `AGENTS.md`, `docs/`

## 완료 조건

1. `node tests/harness/validate-harness.mjs`가 `.agents/skills/`와 신규 역할·스킬을 검증한다.
2. Seed 잠금·변조·줄바꿈 정규화 테스트가 통과한다.
3. 기계 실패·검토 일치·검토 불일치·예산 초과 라우팅 테스트가 통과한다.
4. 두 신규 스킬의 should-trigger·should-not-trigger corpus가 각 8개 이상 존재한다.
5. 기존 governance, Spring, React 테스트와 빌드가 통과한다.
6. PR 변경 문서, rollback, 외부 도구 비설치 결정이 기록된다.

## 권한과 위험

- 외부 쓰기는 `_workspace/00_authority_manifest.md` 범위를 따른다.
- 수정 예산은 전체 2회, 같은 SHA 1회, deadline 60분이다.
- 외부 MCP·자동 승인 CLI·전역 설정 변경은 금지한다.
- 숨겨진 추론이나 비밀값을 검증 증적으로 저장하지 않는다.

## 검증 명령

- `node tests/harness/validate-harness.mjs`
- `node --test tests/harness/seed-contract.test.mjs tests/harness/verification-cycle.test.mjs tests/harness/skill-trigger-contract.test.mjs`
- `node scripts/validate-governance.mjs --all`
- `backend/gradlew.bat -p backend clean test bootJar`
- React Vitest, TypeScript, Vite build
- `git diff --check`

## 변경 정책

이 파일은 해시 고정 후 수정하지 않는다. 범위 변경이 필요하면 `_workspace/01_seed_amendment-{n}.md`를 만들고 사용자 재승인을 기록한다.
