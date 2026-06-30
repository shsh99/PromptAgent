# 이슈 #11 Spring 프롬프트 마켓 구현 결과

## 구현 범위

- `templatemarket/domain`: 8개 카테고리, 난이도·수명 주기·검증 상태, 6개 그룹·9개 필수 문자열 불변식, 결정적 복사용 프롬프트
- `templatemarket/application`: 저장소 포트, 공개 조건 재검증, NFKC·공백·대소문자 정규화, 검색 토큰 AND, 필터·안정 정렬·페이지 처리
- `templatemarket/infrastructure`: 6개 초기 카테고리별 공개·검증 템플릿과 비공개 fixture를 가진 메모리 어댑터
- `templatemarket/api`: 목록·상세 DTO, RFC 7807 오류, OpenAPI 응답 계약

## API 예시

```http
GET /api/v1/prompt-templates?category=WORK_EMAIL&query=회의&difficulty=BEGINNER&page=0&size=20
GET /api/v1/prompt-templates/work-email-meeting-follow-up
```

목록은 카드 메타데이터와 페이지 정보만 반환한다. 상세는 중첩된 `requiredSections`와 서버가 생성한 `copyablePrompt`를 반환한다. 존재하지 않는 ID와 비공개 ID는 모두 `TEMPLATE_NOT_FOUND` 문제 상세 404로 응답한다.

## TDD와 검증

- RED 1: 운영 클래스 부재로 domain/application 테스트 컴파일 실패
- GREEN 1: 도메인·application 구현 후 대상 테스트 성공
- RED 2: 메모리 저장소 부재로 infrastructure/API 테스트 컴파일 실패
- GREEN 2: 메모리 어댑터·API·문제 상세·OpenAPI 구현 후 마켓 테스트 성공
- RED 3: 매우 큰 페이지의 정수 오버플로와 카테고리별 동일 목적 테스트 2건 실패
- GREEN 3: `long` 오프셋 계산과 카테고리별 목적 분리 후 성공
- RED 4: OpenAPI의 `query` 파라미터에 `maxLength: 100`이 없어 계약 테스트 실패
- GREEN 4: HTTP 경계에 `@Size(max = 100)`을 추가하고 101자 요청 400과 OpenAPI 제약 테스트 성공. application 중복 방어는 유지
- RED 5: trim 후 100자인 검색어가 HTTP 경계의 raw 길이 검증으로 400이 되고 OpenAPI 콘텐츠 계약이 누락되어 2건 실패
- GREEN 5: 런타임 길이는 `TemplateQuery`의 trim 기준으로 단일화하고 OpenAPI `maxLength`, JSON·문제 상세 미디어 타입, DTO 필수 필드를 명시해 성공
- RED 6: 최대 `int` 페이지 산술 helper 부재로 테스트 컴파일 실패
- GREEN 6: 곱셈·덧셈·올림 나눗셈을 `long`으로 계산하고 안전 변환하는 `PageArithmetic`을 적용해 성공
- 최종 명령: `backend/gradlew.bat clean test bootJar`
- 최종 결과: `BUILD SUCCESSFUL`, 기존 system API 포함 전체 테스트와 실행 JAR 생성 성공
- 추가 검사: `git diff --check`, Java 클래스 300줄 제한 검사
- 추가 음성 검증: 필수 구성·복사용 프롬프트에만 있는 단어는 검색하지 않으며 초기 공개 카테고리는 정확히 6개

## 잔여 위험

- 현재 저장소는 명시적인 초기 메모리 어댑터다. PostgreSQL 전환 시 동일 application 포트 뒤에 영속 어댑터와 불변 버전 스키마를 추가해야 한다.
- 검색은 계약상 메타데이터 결정 검색만 수행한다. 본문·의미 검색과 RAG는 별도 knowledge 유스케이스로 구현해야 한다.
- 브라우저에서 실제 Swagger UI 탐색과 프론트 연동은 통합 단계에서 확인해야 한다.
- 초기 템플릿은 업무별 기본값이므로 운영 게시 전 콘텐츠 검토자 승인을 거쳐야 한다.
