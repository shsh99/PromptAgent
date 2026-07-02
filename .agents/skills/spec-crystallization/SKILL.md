---
name: spec-crystallization
description: "Use when approved requirements need a new execution contract, or when 재실행, 업데이트, 수정 requests could alter an approved Seed; do not use for simple read-only investigation."
---

# 명세 결정화

승인된 요구사항을 재현 가능한 실행 계약으로 고정한다. 저장소 사실과 사용자 승인을 추정이나 일정 압력보다 우선한다.

## 입력

- 사용자 목표, 승인 문구, 완료 조건, 범위와 비목표
- 저장소의 `AGENTS.md`, 제품·아키텍처·컨벤션 문서, 현재 코드와 테스트
- 기존 `_workspace/` Seed·amendment, authority manifest, 브랜치와 이슈 상태

## 워크플로우

1. 저장소 파일과 Git 상태를 조사해 사실을 먼저 확정한다. 기억이나 사용자 설명만으로 저장소 사실을 대체하지 않는다.
2. 목표, 범위, 비목표, 소유 경계, 완료 조건, 권한·위험, 검증 명령을 정리한다. 승인 전에 불명확한 결정을 질문하되 한 번에 질문 하나만 한다.
3. 최초 실행이면 `_workspace/01_seed_contract.md`에 `계약 해시: sha256:PENDING`인 후보 Seed를 작성한다. 기존 원본 Seed를 덮어쓰지 않는다.
4. 사용자가 후보 전체를 승인한 뒤 다음 명령으로 잠그고 즉시 검증한다.

   ```powershell
   node scripts/harness/seed-contract.mjs lock _workspace/01_seed_contract.md
   node scripts/harness/seed-contract.mjs verify _workspace/01_seed_contract.md
   ```

5. 잠긴 Seed의 재실행·업데이트·수정은 원본을 그대로 두고 다음 빈 번호의 `_workspace/01_seed_amendment-{n}.md`에 변경 전후 해시, 변경 범위, 영향받는 완료 조건별 검증 명령, 사용자 재승인을 기록한다. amendment도 승인 후 같은 `lock`과 `verify` 명령으로 잠근다.
6. 해시 불일치, 승인 누락, 범위 충돌이 있으면 구현을 시작하지 말고 차이와 필요한 승인 하나를 보고한다.

## 출력

- 최초 승인 계약: `_workspace/01_seed_contract.md`
- 변경 계약: `_workspace/01_seed_amendment-{n}.md`
- 각 계약의 64자리 SHA-256, 승인 근거, 변경 전후 해시
- 완료 조건별 실행 가능한 검증 명령과 결과 기록 위치

원본 프롬프트, 비밀값, 개인정보, 숨겨진 추론은 Seed나 로그에 기록하지 않는다.

## 검증

- `node scripts/harness/seed-contract.mjs verify _workspace/01_seed_contract.md`
- amendment가 있으면 각 파일에 `node scripts/harness/seed-contract.mjs verify <amendment-path>`를 실행한다.
- `node --test tests/harness/seed-contract.test.mjs`
- `node tests/harness/validate-harness.mjs`
- `git diff --check`

검증 실패를 승인으로 대체하거나 새 해시로 재잠금하지 않는다. 오류 메시지에는 비밀값이나 전체 계약 본문을 출력하지 않는다.

## 테스트 시나리오

- 정상 흐름: PENDING Seed 승인 후 잠금하면 64자리 해시가 기록되고 `verify`가 성공한다.
- 정상 흐름: CRLF와 LF 계약은 동일한 canonical hash를 만든다.
- 오류 흐름: 잠긴 Seed 본문 변조, PENDING 상태, 해시 행 누락은 `verify` 실패로 구현을 차단한다.
- 오류 흐름: deadline·관리자 지시가 있어도 미승인 범위 확대는 원본 수정 대신 amendment와 재승인으로 전환한다.

## 이전 산출물 개선

기존 Seed와 amendment를 먼저 읽고 유효한 해시를 검증한다. 부분 재실행은 요청된 변경만 다음 amendment에 추가하고 기존 산출물의 이름·본문·승인 이력을 보존한다. 이전 산출물이 불완전해도 원본을 보정하지 말고 누락 사실과 보완 내용을 새 amendment에 남긴다.
