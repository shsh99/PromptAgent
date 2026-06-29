# Codex AI 리뷰 운영

## 목적

AI 리뷰의 권한, 출력 계약과 사람 검토 경계를 정의한다.

## 적용 범위

`dev`·`main` 대상 PR의 diff 자동 검토, 리뷰 프롬프트, 결과 게시와 장애 대응에 적용한다.

## 함께 갱신할 문서

- [GitHub Actions](github-actions.md)
- [Git 작업 흐름](../conventions/git-workflow.md)
- [운영 런북](runbook.md)

## 실행 모델과 권한

공식 `openai/codex-action@v1` 리뷰 job은 `contents: read`, `sandbox: read-only`, `persist-credentials: false`로 PR 병합 커밋만 분석한다. 별도 게시 job만 `pull-requests: write` 권한을 가져 결과를 댓글로 남긴다. 포크 PR 또는 `OPENAI_API_KEY`가 없는 실행은 Codex 단계를 안전하게 건너뛴다.

PR 제목과 본문 같은 신뢰할 수 없는 입력을 셸이나 `github-script` 코드에 직접 삽입하지 않는다. 리뷰는 한글로 심각도, 파일과 줄, 근거, 영향, 구체적 수정안, 신뢰도를 출력한다. AI 리뷰는 사람 승인, 보안 검사, 테스트를 대체하지 않는다.

## 실패 복구와 재실행

1. Actions 로그에서 secret 부재, 사용량 제한, Action 버전, 권한 오류를 구분한다.
2. 일시 오류면 **Re-run failed jobs**로 실패 job만 재실행한다.
3. 코드가 바뀌었다면 새 커밋을 push해 최신 diff로 다시 검토한다.
4. 반복 장애는 이슈로 남기고 사람 검토를 계속한다.

## 비밀 회전

1. OpenAI에서 새 API 키를 발급한다.
2. 저장소의 `OPENAI_API_KEY` Actions secret을 교체한다.
3. 테스트 PR로 정상 호출을 확인한다.
4. 이전 키를 폐기하고 회전 일시와 담당자를 보안 기록에 남긴다.

비밀값은 로그, PR 댓글, 프롬프트, 변경 문서에 기록하지 않는다.
