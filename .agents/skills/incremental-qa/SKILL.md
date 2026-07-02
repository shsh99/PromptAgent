---
name: incremental-qa
description: "Use when a module, API, UI hook, database schema, migration, CI change, or review fix needs incremental verification, 재실행, 업데이트, 수정, regression testing, contract comparison, or release readiness review."
---

# Incremental QA

## 개요

완성 후 일괄 검사하지 않고 각 모듈 직후 경계 양쪽을 교차 비교한다. 존재 검사가 아니라 shape와 상태 전이의 실제 호환성을 증명한다.

## 입력

아키텍처 계약, 변경 diff, API 예시·타입, UI 훅·상태, DB 스키마·마이그레이션, 이전 QA 보고서를 읽는다.

## 워크플로우

1. 변경된 경계와 소비자를 식별한다.
2. API 응답 ↔ 프론트 훅, 도메인 ↔ 영속성, 마이그레이션 ↔ 구·신 데이터의 필드명·타입·nullability·enum을 비교한다.
3. 정상, 빈 값, 오류, 권한, 구버전 데이터의 최소 시나리오를 실행한다.
4. 결함은 근거 위치, 기대값·실제값, 재현, 소유자와 함께 즉시 반환한다.
5. 수정 후 영향 경계만 재실행하되 공유 계약이 바뀌면 모든 소비자를 재검증한다.

## 출력

`_workspace/05_qa-migration_report.md`에 경계별 통과·실패·미검증, 증거, 심각도, 소유자, 재검증 결과, 릴리스 차단 여부를 기록한다.

## 이전 산출물 개선

이전 보고서의 실패·미검증 항목을 우선 재검증한다. 해결된 항목은 새 증거와 함께 상태만 변경하고, 기존 기대값·실제값·재현 기록은 감사 이력으로 보존한다.

## 검증

관련 테스트를 실제 실행하고 결과와 exit code를 남긴다. API·UI·DB 세 소스 중 적용되는 양쪽 이상을 직접 읽었는지, migration 롤백과 기존 데이터 경로를 확인했는지 점검한다.

## 테스트 시나리오

- **정상 흐름:** API의 `updatedAt?: string`이 훅과 DB nullability에 일치하고 신규·기존 데이터 및 UI 빈 상태 테스트가 통과한다.
- **오류 흐름:** API는 `snake_case`, 훅은 `camelCase`를 기대한다. 양쪽 근거와 재현을 react-ui·spring-rag에 전달하고 수정 후 해당 경계만 재검증한다. 검사 명령 자체가 재실패하면 미검증 누락으로 보고한다.

## 흔한 실수

- 파일 존재를 통합 성공으로 간주: 실제 shape와 상태를 비교한다.
- 전체 완료까지 대기: 모듈 직후 검사해 결함 전파를 막는다.
