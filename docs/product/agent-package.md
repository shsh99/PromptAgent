# 에이전트·스킬 추천 패키지

## 목적

사용자 업무에 맞는 Codex 에이전트·스킬 구성을 추천하고 안전한 파일 묶음으로 제공한다.

## 적용 범위

추천, 미리보기, manifest 검증, ZIP 생성과 다운로드에 적용한다.

## 함께 갱신할 문서

- [인텐트·RAG](intent-rag.md)
- [공통 프롬프트 계약](prompt-contract.md)
- [API·OpenAPI](../conventions/api-openapi.md)

## 결과 구조

```text
agent-package.zip
|-- agents/orchestrator.md
|-- agents/specialist.md
|-- skills/task-orchestrator/SKILL.md
|-- skills/domain-skill/SKILL.md
|-- README.md
`-- manifest.json
```

추천 결과는 역할, 필요한 스킬, 의존성, 병렬 가능한 작업, 실행 순서와 검증 단계를 설명한다. 에이전트 파일은 역할, 입력·출력 계약, 도구 권한, 오류 처리, 협업·재실행 규칙을 포함한다. 스킬은 명확한 트리거, 절차, 참조 포인터, 정상·오류 테스트 프롬프트를 포함한다.

## 보안과 검증

제품은 패키지를 생성할 뿐 에이전트를 직접 실행하지 않는다. 허용 경로는 `agents/`, `skills/`, `README.md`, `manifest.json`으로 제한한다. 절대 경로, `..`, 심볼릭 링크와 충돌 경로를 거부한다. ZIP 생성 전에 필수 파일, frontmatter, 모든 로컬 참조, 체크섬과 manifest 일치를 검증하고 사용자에게 파일 미리보기를 제공한다.
