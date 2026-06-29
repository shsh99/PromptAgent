# Jenkins 파이프라인 운영

## 목적

`dev`와 `main`의 통합, 이미지 생성, 배포 승격 단계를 정의한다.

## 적용 범위

`Jenkinsfile`, 에이전트 환경, credential, 스테이징·운영 배포에 적용한다.

## 함께 갱신할 문서

- [배포 구조](../architecture/deployment.md)
- [GitHub Actions](github-actions.md)
- [운영 런북](runbook.md)

## 필요한 환경과 credential

- Node.js 22, Docker, Java 21이 설치된 Linux agent
- `container-registry`: 레지스트리 username/password credential
- `staging-deploy-token`: 스테이징 secret text credential
- `production-deploy-token`: 운영 secret text credential
- `release-managers`: 운영 승인 사용자 또는 그룹

credential은 `withCredentials` 안에서만 주입한다. 셸은 Groovy 작은따옴표 문자열과 `set +x`를 사용해 보간과 명령 추적을 차단한다.

## 단계와 배포 조건

Declarative Pipeline은 Checkout, Governance, Test, Build, Integration, Image, Staging, Smoke, Production Approval, Production 순서로 실행한다. 현재 루트 npm 앱을 검증하고 `backend/gradlew`와 `frontend/package.json`이 생기면 각 모듈을 조건부 검증한다.

- 모든 브랜치는 Checkout부터 Integration까지 수행한다.
- `dev`만 Image, Staging, Smoke를 실행한다.
- `main`만 Image, Production Approval, Production을 실행한다.
- 배포 스크립트나 Dockerfile이 없으면 관련 단계를 건너뛴다.

## 실패 복구와 재실행

1. 실패 stage의 첫 오류와 테스트 보고서를 확인한다.
2. 외부 서비스 일시 장애만 **Restart from Stage**로 재실행한다.
3. 코드·설정 오류는 수정 PR을 `dev`에 병합한 뒤 새 빌드로 검증한다.
4. 스모크 테스트가 실패하면 운영 승격을 중단한다.
5. 운영 배포 실패 시 직전 정상 이미지로 롤백하고 장애 이슈에 태그와 시간을 기록한다.

## 비밀 회전

새 토큰을 발급해 Jenkins Credentials의 동일 ID를 교체하고 스테이징에서 검증한다. 정상 확인 후 이전 토큰을 폐기한다. 운영과 스테이징 토큰은 분리하며 로그나 빌드 매개변수로 전달하지 않는다.
