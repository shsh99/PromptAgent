---
name: spring-rag-development
description: Use when Spring APIs, Java domain logic, persistence, embeddings, retrieval, vector search, or RAG behavior is created, 재실행, 업데이트, 수정, fixed, migrated, or reviewed.
---

# Spring RAG Development

## 개요

API·도메인·데이터·검색 경계를 명시적으로 연결하고, 외부 모델이 실패해도 예측 가능한 백엔드를 만든다.

## 입력

이슈와 완료 조건, 아키텍처 계약, 허용 경로, 이전 산출물, 데이터·운영 제약을 읽는다. 계약이 모호하면 구현 전에 질문하거나 가정을 기록한다.

## 워크플로우

1. API 요청·응답, 오류, 권한, nullability 계약을 테스트로 고정한다.
2. `api/application/domain/infrastructure` 경계를 유지하며 최소 구현한다.
3. RAG는 수집·청킹·임베딩·검색·재정렬·생성 단계를 분리하고 모델·인덱스 버전을 기록한다.
4. 타임아웃, 빈 검색, 공급자 실패, 민감정보, 비용 상한의 fallback을 구현한다.
5. 스키마 변경은 순방향·역방향 호환성과 롤백을 설명한다.

## 출력

코드·테스트와 `_workspace/02_spring-rag_result.md`에 API 예시, 스키마 영향, RAG 설정, 검증 결과, 잔여 위험을 기록한다.

## 이전 산출물 개선

이전 결과의 API 예시·스키마·테스트를 회귀 기준으로 읽는다. 사용자 피드백과 부분 재실행 범위에 해당하는 코드·테스트·결과만 갱신하고, 호환성 결정은 근거와 함께 보존한다.

## 검증

모듈 단위 테스트, API 경계 통합 테스트, 빈 결과·타임아웃·재시도·구버전 데이터 시나리오를 실행한다. 응답 shape를 architecture 계약과 qa-migration에 전달한다.

## 테스트 시나리오

- **정상 흐름:** 의도 검색 API가 계약된 필드와 출처를 반환하며 단위·통합 테스트와 구버전 데이터 읽기가 통과한다.
- **오류 흐름:** 임베딩 공급자 타임아웃을 재현하고 제한된 fallback 응답과 관측 가능 로그를 검증한다. 계약 변경이 필요하면 임의 수정하지 않고 차단을 보고한다.

## 흔한 실수

- 컨트롤러에서 검색 파이프라인 조립: 테스트와 교체가 어려우므로 application 경계로 옮긴다.
- 모델 출력 신뢰: 구조 검증과 안전한 실패 응답을 둔다.
