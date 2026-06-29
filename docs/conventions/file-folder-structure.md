# 파일·폴더 구조 규칙

## 목적

파일 위치와 소유권을 예측 가능하게 유지한다.

## 적용 범위

백엔드, 프론트엔드, 테스트, 문서, 하네스 파일 생성과 이동에 적용한다.

## 함께 갱신할 문서

- [모듈 구조](../architecture/module-structure.md)
- [코드 크기 제한](code-size-limits.md)
- [Git 작업 흐름](git-workflow.md)

## 저장소 기준

```text
backend/   Spring Boot 모듈형 모놀리스
frontend/  React·TypeScript 애플리케이션
agents/    프로젝트 전문가 역할
skills/    프로젝트 로컬 실행 스킬
docs/      아키텍처·제품·컨벤션·운영·변경 기록
tests/     저장소 수준 계약 검사
webapp/    수직 전환 중 유지하는 레거시
```

Java 기능은 `backend/src/main/java/<base>/<feature>/{api,application,domain,infrastructure}`에 둔다. React 기능은 `frontend/src/features/<feature>/{api,components,hooks,model,pages}`에 둔다. 테스트는 가능한 한 대상 구조를 반영한다.

공유 폴더는 두 기능 이상에서 안정적으로 사용하는 코드에만 허용한다. 범용 `utils`, `common`, `misc` 폴더를 임시 보관소로 사용하지 않는다. 파일과 기본 export 이름을 일치시키고 한 파일은 하나의 주요 책임만 가진다.

새 최상위 폴더나 모듈 경계는 아키텍처 문서와 변경 문서에 이유를 기록한다.
