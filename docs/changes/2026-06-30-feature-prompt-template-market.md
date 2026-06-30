# 검증된 프롬프트 마켓 수직 기능

## PR 정보

- 이슈: #11
- 대상 브랜치: `dev`
- 작업 브랜치: `feat/11-prompt-market`

## 작업 목적

공개·검증된 업무별 프롬프트를 검색하고 9개 필수 항목을 확인한 뒤 즉시 복사할 수 있는 첫 번째 Spring·React 수직 기능을 제공한다.

## 변경 내용

- Spring `templatemarket` 도메인·application·infrastructure·API 계층과 OpenAPI 계약을 추가했다.
- 8개 카테고리 계약과 6개 초기 공개 템플릿, 비공개 검증 fixture를 추가했다.
- 카테고리·난이도·정규화 검색·페이지 목록과 공개 상세 API를 구현했다.
- React 목록, 검색·필터, URL 페이지 상태, 인라인 상세, 완성 프롬프트 복사 화면을 구현했다.
- 로딩·빈 결과·404·일반 오류·복사 실패와 요청 경합을 처리했다.
- 제품 계약과 데이터 흐름 문서를 실제 구현에 맞춰 갱신했다.

## 영향 범위

- Backend: `/api/v1/prompt-templates`, `/api/v1/prompt-templates/{templateId}`
- Frontend: 홈의 프롬프트 마켓 영역과 Vite API 프록시
- 데이터베이스 스키마와 기존 레거시 화면에는 변경이 없다.

## 테스트 결과

- Backend: `clean test bootJar` 성공, 전체 24개 테스트 통과
- Frontend: 6개 파일 23개 테스트, TypeScript 검사, Vite 빌드 통과
- 저장소: governance 31개 테스트, harness, foundation, 레거시 테스트·빌드 통과
- 브라우저: API 연결, 검색 결과 6→1, 6개 그룹·9개 항목 상세, 416자 복사, 390px 가로 넘침 없음 확인

## 배포 및 마이그레이션 영향

DB 마이그레이션은 없다. Java 21, Node.js 22 이상이 필요하며 현재 템플릿 데이터는 애플리케이션 재시작 시 동일 fixture로 초기화된다.

## 위험 요소와 롤백

현재 메모리 저장소이므로 운영 편집·버전 관리는 지원하지 않는다. 문제가 생기면 이 squash 커밋을 되돌리면 되며 DB 롤백은 필요 없다. PostgreSQL 전환 시 HTTP 계약과 공개 조건을 회귀 테스트로 고정한다.

## AI 사용

프로젝트 오케스트레이터 하네스로 Spring, React, 독립 검토 역할을 분리했다. 두 차례 React 검토 수정을 사용했으며 최종 통합과 브라우저 검증은 관리자 오케스트레이터가 수행했다.

## 관련 문서

- [프롬프트 마켓](../product/template-market.md)
- [공통 프롬프트 계약](../product/prompt-contract.md)
- [데이터 흐름](../architecture/data-flow.md)
- [API·OpenAPI](../conventions/api-openapi.md)
