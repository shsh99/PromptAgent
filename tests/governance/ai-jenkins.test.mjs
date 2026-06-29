import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('AI 리뷰는 dev와 main 대상 PR에서 읽기 전용으로 실행된다', async () => {
  const workflow = await read('.github/workflows/ai-review.yml');

  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /branches:\s*\[dev, main\]/);
  assert.match(workflow, /uses:\s*openai\/codex-action@v1/);
  assert.match(workflow, /sandbox:\s*read-only/);
  assert.match(workflow, /openai-api-key:\s*\$\{\{ secrets\.OPENAI_API_KEY \}\}/);
  assert.match(workflow, /contents:\s*read/);
  assert.match(workflow, /persist-credentials:\s*false/);
});

test('AI 리뷰는 포크 또는 비밀값이 없는 PR을 안전하게 건너뛴다', async () => {
  const workflow = await read('.github/workflows/ai-review.yml');

  assert.match(workflow, /github\.event\.pull_request\.head\.repo\.full_name == github\.repository/);
  assert.match(workflow, /env\.HAS_OPENAI_KEY == 'true'/);
  assert.match(workflow, /HAS_OPENAI_KEY:\s*\$\{\{ secrets\.OPENAI_API_KEY != '' \}\}/);
});

test('댓글 작성은 고정된 github-script를 사용하는 별도 최소 권한 job이다', async () => {
  const workflow = await read('.github/workflows/ai-review.yml');

  assert.match(workflow, /post-feedback:[\s\S]*needs:\s*review/);
  assert.match(workflow, /post-feedback:[\s\S]*contents:\s*read[\s\S]*pull-requests:\s*write/);
  assert.match(workflow, /uses:\s*actions\/github-script@v7/);
  assert.match(workflow, /CODEX_REVIEW:\s*\$\{\{ needs\.review\.outputs\.final_message \}\}/);
  assert.match(workflow, /body:\s*process\.env\.CODEX_REVIEW/);
  assert.doesNotMatch(workflow, /script:\s*\|[\s\S]*\$\{\{\s*github\.event\.pull_request\.(?:title|body)/);
});

test('리뷰 프롬프트는 구조화된 한글 근거와 보안 경계를 요구한다', async () => {
  const prompt = await read('.github/codex/review-prompt.md');

  for (const field of ['심각도', '파일', '줄', '근거', '수정안', '신뢰도']) {
    assert.ok(prompt.includes(field), `${field} 항목이 필요합니다.`);
  }
  assert.match(prompt, /허위|추측/);
  assert.match(prompt, /비밀|secret/i);
  assert.match(prompt, /변경된 코드|PR 변경/);
});

test('Jenkins는 현재 앱과 미래 모듈을 조건부 검증하고 dev와 main만 배포한다', async () => {
  const pipeline = await read('Jenkinsfile');

  assert.match(pipeline, /pipeline\s*\{/);
  for (const stage of [
    'Checkout', 'Governance', 'Test', 'Build', 'Integration', 'Image',
    'Staging', 'Smoke', 'Production Approval', 'Production',
  ]) {
    assert.match(pipeline, new RegExp(`stage\\('${stage}'\\)`), `${stage} 단계가 필요합니다.`);
  }
  assert.match(pipeline, /npm test/);
  assert.match(pipeline, /npm run build/);
  assert.match(pipeline, /backend\/gradlew/);
  assert.match(pipeline, /frontend\/package\.json/);
  assert.match(pipeline, /backend\/src\/integrationTest/);
  assert.match(pipeline, /npm run typecheck/);
  assert.match(pipeline, /branch 'dev'/);
  assert.match(pipeline, /branch 'main'/);
  assert.match(pipeline, /input\s+message:/);
  assert.match(pipeline, /withCredentials\(/);
  assert.match(pipeline, /credentialsId:/);
});

test('운영 문서는 권한, 비밀 회전, 복구와 재실행 절차를 설명한다', async () => {
  const [aiReview, jenkins] = await Promise.all([
    read('docs/operations/ai-review.md'),
    read('docs/operations/jenkins.md'),
  ]);

  assert.match(aiReview, /OPENAI_API_KEY/);
  assert.match(aiReview, /권한/);
  assert.match(aiReview, /회전/);
  assert.match(aiReview, /재실행/);
  assert.match(jenkins, /credential/i);
  assert.match(jenkins, /복구|롤백/);
  assert.match(jenkins, /재실행/);
  assert.match(jenkins, /회전/);
});
