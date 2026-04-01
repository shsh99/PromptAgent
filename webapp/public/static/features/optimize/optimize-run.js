async function runOptimize() {
  const prompt = getOptimizeEl('optimize-prompt')?.value.trim() || '';
  const output = getOptimizeEl('optimize-output')?.value.trim() || '';
  const goal = getOptimizeEl('optimize-goal')?.value.trim() || '';
  const btn = getOptimizeEl('optimize-run-btn');
  if (!btn || !prompt || !output) {
    setOptimizeText('optimize-status', '프롬프트와 결과를 먼저 입력하세요.');
    return;
  }

  setOptimizeText('optimize-status', '실행 중...');
  btn.disabled = true;
  btn.textContent = '최적화 중...';

  try {
    const res = await fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, output, goal, language: state?.promptLanguage || 'ko', modelTarget: state?.promptStyle || 'gpt' }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const session = {
      prompt,
      output,
      goal,
      result: data,
      language: state?.promptLanguage || 'ko',
      modelTarget: state?.promptStyle || 'gpt',
      createdAt: new Date().toISOString(),
    };
    setOptimizeSession(session);
    renderOptimizeResult(data);
    if (typeof recordActivity === 'function') {
      recordActivity('OPTIMIZE_RUN', {
        score: data.score,
        issues: data.issues || [],
      });
    }
  } catch (error) {
    setOptimizeText('optimize-status', error.message || '최적화 실행에 실패했습니다.');
  } finally {
    btn.disabled = false;
    btn.textContent = '최적화 실행';
  }
}


