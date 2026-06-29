const body = process.env.PR_BODY ?? '';
const closingReference = /(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#\d+/i;

if (!closingReference.test(body)) {
  console.error('PR 본문에 Closes #번호, Fixes #번호 또는 Resolves #번호 형식으로 이슈를 연결해야 합니다.');
  process.exitCode = 1;
} else {
  console.log('PR 연결 이슈 형식을 확인했습니다.');
}
