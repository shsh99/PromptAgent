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
.agents/skills/  Codex가 자동 탐색하는 프로젝트 워크플로
agents/          프로젝트 오케스트레이터가 배정하는 역할 계약
backend/         Spring Boot 모듈형 모놀리스
frontend/        React·TypeScript 애플리케이션
docs/            아키텍처·제품·컨벤션·운영·변경 기록
tests/           저장소 수준 계약 검사
webapp/          수직 전환 중 유지하는 레거시
```

Java 기능은 `backend/src/main/java/<base>/<feature>/{api,application,domain,infrastructure}`에 둔다. React 기능은 `frontend/src/features/<feature>/{api,components,hooks,model,pages}`에 둔다. 테스트는 가능한 한 대상 구조를 반영한다.

프로젝트 스킬은 `.agents/skills/<name>/SKILL.md`에만 두어 Codex의 저장소 스킬 탐색과 하네스 검증이 같은 경로를 사용하게 한다. 저장소 루트의 `skills/`는 프로젝트 스킬 위치로 사용하지 않는다.

공유 폴더는 두 기능 이상에서 안정적으로 사용하는 코드에만 허용한다. 범용 `utils`, `common`, `misc` 폴더를 임시 보관소로 사용하지 않는다. 파일과 기본 export 이름을 일치시키고 한 파일은 하나의 주요 책임만 가진다.

새 최상위 폴더나 모듈 경계는 아키텍처 문서와 변경 문서에 이유를 기록한다.

## Markdown 로컬 링크

자동 링크 검사는 inline 형식 `[설명](relative/path.md)`과 공백 경로의 angle 형식 `[설명](<relative path.md>)`만 지원한다. 로컬 대상은 저장소 안에 존재해야 하며 `../`를 사용해 현재 폴더의 상위 문서를 가리킬 수는 있지만 최종 해석 경로가 저장소 루트 밖이면 실패한다. HTTP(S), 메일과 전화 링크는 존재 검사의 대상이 아니다.

reference-style 링크, 링크 대상의 제목 속성, 중첩 괄호가 있는 대상은 현재 검사기가 지원하지 않아 명시적으로 건너뛴다. 검증이 필요한 로컬 문서 링크는 지원 형식으로 작성한다.
