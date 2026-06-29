# Java 코드 컨벤션

## 목적

Spring Boot 코드의 경계, 이름, 오류 처리와 검증 기준을 통일한다.

## 적용 범위

`backend/`의 운영 코드와 테스트 코드에 적용한다.

## 함께 갱신할 문서

- [모듈 구조](../architecture/module-structure.md)
- [코드 크기 제한](code-size-limits.md)
- [테스트](testing.md)
- [API·OpenAPI](api-openapi.md)

## 패키지와 의존성

기능 모듈은 `api/application/domain/infrastructure`로 구성한다. `api`는 HTTP 변환, `application`은 유스케이스와 트랜잭션, `domain`은 업무 규칙, `infrastructure`는 DB·외부 연동을 담당한다. domain은 Spring, JPA, 외부 SDK에 의존하지 않는다.

## 작성 규칙

- Java 21 기준으로 불변 객체, `record`, 생성자 주입을 우선한다.
- 클래스는 하나의 변경 이유를 가지며 이름에 역할을 드러낸다.
- `Optional`은 반환 타입에만 제한적으로 사용하고 필드·매개변수에는 쓰지 않는다.
- 시간은 `Clock`, 외부 ID 생성은 인터페이스로 주입해 테스트 가능하게 한다.
- 트랜잭션 경계는 application 서비스에 두고 조회는 읽기 전용으로 표시한다.
- 예외를 삼키지 않으며 도메인 오류를 RFC 7807 문제 상세로 변환한다.
- 입력 DTO에는 Bean Validation을 적용하고 엔티티를 API로 직접 노출하지 않는다.
- 로그는 구조화하고 원문 프롬프트, 검색 본문, 비밀값과 개인정보를 제외한다.

정적 분석과 포맷 규칙은 빌드에서 자동 실행하며 경고를 근거 없이 억제하지 않는다.
