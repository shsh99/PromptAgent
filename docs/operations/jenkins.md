# Jenkins 파이프라인 운영

## 목적

`dev`와 `main`의 통합, 이미지 생성, 배포 승격 단계를 정의한다.

## 적용 범위

`Jenkinsfile`, 에이전트 환경, credential, 스테이징·운영 배포에 적용한다.

## 함께 갱신할 문서

- [배포 구조](../architecture/deployment.md)
- [GitHub Actions](github-actions.md)
- [운영 런북](runbook.md)

## 단계

Declarative Pipeline은 Checkout, Governance, Test, Build, Integration, Image, Staging, Smoke, Production Approval, Production 순서로 실행한다. 현재 레거시는 npm 검증을 수행하고, `backend/gradlew`와 `frontend/package.json`이 생기면 각 빌드를 조건부 실행한다.

`dev`만 스테이징에 자동 배포하며 스모크 테스트 실패 시 승격하지 않는다. `main`만 수동 승인 뒤 운영 배포할 수 있다. 빌드 산출물과 Docker 이미지는 커밋 SHA로 식별하고 재빌드 없이 승격한다.

## 자격 증명과 복구

credential ID는 Jenkins에 저장하고 값은 로그에 출력하지 않는다. DB, registry, cloud credential은 환경별로 분리하고 주기적으로 회전한다. 배포 실패 시 이전 이미지로 복귀하고, 마이그레이션 호환성 문제가 있으면 트래픽 전환을 중단한 뒤 런북에 따라 복구한다.
