# API·OpenAPI 컨벤션

## 목적

백엔드와 프론트엔드가 공유하는 안정적인 HTTP 계약을 정의한다.

## 적용 범위

`/api/v1` REST API, OpenAPI 명세, Swagger UI, 생성 타입에 적용한다.

## 함께 갱신할 문서

- [모듈 구조](../architecture/module-structure.md)
- [데이터 흐름](../architecture/data-flow.md)
- [테스트](testing.md)

## 계약

- 리소스는 복수 명사와 일관된 HTTP 메서드·상태 코드를 사용한다.
- 요청·응답 DTO와 도메인 모델을 분리하고 모든 제약을 OpenAPI에 기술한다.
- 오류는 RFC 7807 `application/problem+json`을 사용하며 `code`, `message`, `traceId`, `fieldErrors`를 포함한다.
- 목록은 명시적인 페이지·정렬·필터 파라미터를 사용하고 안정된 정렬 키를 가진다.
- 시간은 ISO 8601 UTC, 식별자는 문자열로 직렬화한다.
- 멱등성이 필요한 생성·외부 호출에는 멱등 키 정책을 명시한다.

호환되지 않는 변경은 기존 `/api/v1`을 조용히 바꾸지 않는다. 필드 추가는 소비자가 알 수 없는 필드를 허용하는지 검증하고, 제거·의미 변경은 버전 전략과 이행 기간을 문서화한다.

OpenAPI 생성과 프론트 타입 생성을 CI에서 실행해 변경 diff를 검토한다. Swagger UI는 개발·스테이징에서 제공하고 운영에서는 인증된 관리자만 접근시키거나 비활성화한다.

기반 검증 엔드포인트는 `/api/v1/system/health`, Actuator는 `/actuator/health`, OpenAPI JSON은 `/v3/api-docs`, Swagger UI는 `/swagger-ui.html`이다. 제품 기능은 Actuator 응답을 직접 소비하지 않고 버전이 관리되는 `/api/v1` 계약을 사용한다.
