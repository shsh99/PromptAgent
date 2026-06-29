# 배포 아키텍처

## 목적

환경별 배포 단위, 승격 조건과 책임 경계를 정의한다.

## 적용 범위

Cloudflare Pages, Docker 백엔드, PostgreSQL, CI/CD 변경에 적용한다.

## 함께 갱신할 문서

- [GitHub Actions](../operations/github-actions.md)
- [Jenkins](../operations/jenkins.md)
- [운영 런북](../operations/runbook.md)

## 배포 단위

- 프론트엔드: 정적 React 산출물을 Cloudflare Pages에 배포한다.
- 백엔드: Spring Boot 애플리케이션을 불변 Docker 이미지로 배포한다.
- 데이터: PostgreSQL과 pgvector를 사용하고 Flyway가 전진 마이그레이션을 관리한다.

로컬 개발은 `compose.yml`의 `pgvector/pgvector:0.8.2-pg17-bookworm` 이미지를 사용한다. `.env.example`을 복사한 로컬 `.env`에서만 DB 자격 증명을 설정하며 저장소에는 실제 비밀값을 커밋하지 않는다. 현재 Pages 운영 배포는 레거시 산출물을 유지하고 React 전환 PR에서 배포 경로를 별도로 변경한다.

## 환경과 승격

PR은 GitHub Actions 규칙·테스트·빌드를 통과해야 한다. `dev` 병합은 Jenkins 스테이징 배포와 스모크 테스트를 시작한다. `main`은 운영 가능한 릴리스만 포함하며 수동 승인 뒤 운영에 승격한다. 이미지 태그는 커밋 SHA로 고정하고 동일 이미지를 환경 간 승격한다.

## 복구

애플리케이션은 이전 이미지로 롤백한다. DB 변경은 하위 호환 확장-이행-축소 순서를 사용하며 파괴적 변경 전에 백업과 복구 연습을 완료한다. 비밀값은 저장소가 아닌 환경별 비밀 저장소에서 주입한다.
