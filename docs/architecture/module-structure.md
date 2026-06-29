# 모듈 구조

## 목적

Spring과 React의 기능 경계 및 의존 방향을 정의한다.

## 적용 범위

패키지 생성, 모듈 간 호출, 공통 코드 추출에 적용한다.

## 함께 갱신할 문서

- [전체 시스템](system-overview.md)
- [파일·폴더 구조](../conventions/file-folder-structure.md)
- [API·OpenAPI](../conventions/api-openapi.md)

## 백엔드

`templatemarket`, `promptgenerator`, `agentrecommendation`, `intent`, `knowledge`, `websearch`, `aigateway`, `historyfeedback`, `adminobservability` 기능 모듈을 둔다. 각 모듈은 `api/application/domain/infrastructure` 계층을 가진다.

의존성은 `api -> application -> domain` 방향이며 `infrastructure`는 application/domain이 정의한 포트를 구현한다. 다른 모듈의 저장소나 내부 패키지를 직접 참조하지 않고 공개 애플리케이션 서비스와 DTO를 사용한다. `shared`에는 안정된 기술 공통 요소만 둔다.

## 프론트엔드

`src/features/<feature>/` 아래 `api/components/hooks/model/pages`를 둔다. 기능 간 직접 내부 import를 금지하고 공개 진입점 또는 `shared` 계약을 사용한다. `app`은 라우팅·전역 제공자·부트스트랩만 담당한다.

## 변경 원칙

모듈 공개 계약 변경은 OpenAPI, 소비자 테스트, 관련 제품 문서를 같은 PR에서 갱신한다. 순환 의존이 생기면 공통 모듈을 확대하기보다 업무 흐름의 소유권을 다시 정한다.
