import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('governance workflow gates pull requests to dev and main with least privilege', async () => {
  const workflow = await read('.github/workflows/governance.yml');

  assert.match(workflow, /pull_request:\s*[\s\S]*branches:\s*\[dev, main\]/);
  assert.match(workflow, /permissions:\s*\n\s+contents:\s*read/);
  assert.doesNotMatch(workflow, /permissions:\s*write-all/);
  assert.match(workflow, /fetch-depth:\s*0/);
  assert.match(workflow, /node-version:\s*22/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /PR_TITLE:\s*\$\{\{ github\.event\.pull_request\.title \}\}/);
  assert.match(workflow, /BASE_SHA:\s*\$\{\{ github\.event\.pull_request\.base\.sha \}\}/);
  assert.match(workflow, /HEAD_SHA:\s*\$\{\{ github\.event\.pull_request\.head\.sha \}\}/);
  assert.match(workflow, /GITHUB_HEAD_REF/);
  assert.match(workflow, /node scripts\/validate-governance\.mjs --pr/);
  assert.match(workflow, /node scripts\/validate-pr-links\.mjs/);
  assert.match(workflow, /npm run test:governance/);
  assert.match(workflow, /node --test tests\/governance\/workflows\.test\.mjs/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /tests\/harness\/validate-harness\.mjs/);
});

test('merged pull requests to dev close explicitly linked issues', async () => {
  const workflow = await read('.github/workflows/governance.yml');

  assert.match(workflow, /types:\s*\[[^\]]*closed[^\]]*\]/);
  assert.match(workflow, /github\.event\.pull_request\.merged == true/);
  assert.match(workflow, /github\.event\.pull_request\.base\.ref == 'dev'/);
  assert.match(workflow, /issues:\s*write/);
  assert.match(workflow, /pull-requests:\s*read/);
  assert.match(workflow, /close[\s\S]*fix[\s\S]*resolve/i);
  assert.match(workflow, /github\.rest\.issues\.update/);
});

test('pull request link validator accepts closing keywords and rejects missing links', () => {
  const script = fileURLToPath(new URL('../../scripts/validate-pr-links.mjs', import.meta.url));
  const accepted = spawnSync(process.execPath, [script], {
    env: { ...process.env, PR_BODY: '변경 사항입니다.\n\nCloses #42' },
    encoding: 'utf8',
  });
  const rejected = spawnSync(process.execPath, [script], {
    env: { ...process.env, PR_BODY: '연결 이슈가 없습니다.' },
    encoding: 'utf8',
  });

  assert.equal(accepted.status, 0, accepted.stderr);
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /Closes|Fixes|Resolves/);
});

test('Pages deployment is manually dispatched and guarded for main production', async () => {
  const workflow = await read('.github/workflows/deploy-pages.yml');

  assert.match(workflow, /on:\s*\n\s+workflow_dispatch:/);
  assert.doesNotMatch(workflow, /\n\s+push:/);
  assert.match(workflow, /refs\/heads\/main/);
  assert.match(workflow, /environment:\s*\n\s+name:\s*cloudflare-pages-production/);
  assert.match(workflow, /concurrency:\s*\n\s+group:/);
  assert.match(workflow, /CLOUDFLARE_API_TOKEN/);
  assert.match(workflow, /CLOUDFLARE_ACCOUNT_ID/);
  assert.match(workflow, /필수.*시크릿|secret.*required/i);
  assert.match(workflow, /wrangler pages deploy dist/);
});

test('CODEOWNERS covers repository and automation-sensitive paths', async () => {
  const codeowners = await read('.github/CODEOWNERS');

  assert.match(codeowners, /^\*\s+@shsh99/m);
  assert.match(codeowners, /^\/\.github\/\s+@shsh99/m);
  assert.match(codeowners, /^\/scripts\/\s+@shsh99/m);
  assert.match(codeowners, /^\/agents\/\s+@shsh99/m);
  assert.match(codeowners, /^\/skills\/\s+@shsh99/m);
});
