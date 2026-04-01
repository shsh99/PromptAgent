async function loadBuilderStarter(index) {
  const item = BUILDER_STARTERS[index];
  if (!item) return;
  switchMode('builder');

  if (typeof selectPurpose === 'function') {
    selectPurpose(item.purpose);
  } else {
    state.purpose = item.purpose;
    const keywordSection = document.getElementById('keyword-section');
    if (keywordSection) keywordSection.classList.remove('hidden');
  }

  const keywordInput = document.getElementById('keyword-input');
  if (keywordInput) keywordInput.value = item.keyword;

  if (typeof selectTechniqueManual === 'function') {
    await selectTechniqueManual(item.technique);
  }

  if (typeof state !== 'undefined') {
    state.keyword = item.keyword;
    state.techniqueId = item.technique;
  }

  const firstField = document.querySelector('.field-input');
  if (firstField) firstField.focus();
}

async function loadQuickStart(index) {
  const item = QUICK_STARTS[index];
  if (!item) return;
  switchMode('template');

  if (typeof selectPurpose === 'function') {
    selectPurpose(item.purpose);
  } else {
    state.purpose = item.purpose;
    const keywordSection = document.getElementById('keyword-section');
    if (keywordSection) keywordSection.classList.remove('hidden');
  }

  const keywordInput = document.getElementById('keyword-input');
  if (keywordInput) keywordInput.value = item.keyword;

  if (typeof state !== 'undefined') {
    state.keyword = item.keyword;
    state.techniqueId = item.technique;
  }

  if (typeof selectTechniqueManual === 'function') {
    await selectTechniqueManual(item.technique);
  }

  const firstField = document.querySelector('.field-input');
  if (firstField) firstField.focus();
}

function loadOptimizeExample(index) {
  const item = OPTIMIZE_EXAMPLES[index];
  if (!item) return;
  switchMode('optimize');
  setOptimizeValue('optimize-prompt', item.prompt);
  setOptimizeValue('optimize-output', item.output);
  setOptimizeValue('optimize-goal', item.goal);
  setOptimizeText('optimize-status', '예시를 불러왔습니다');
}

function copyOptimizeExample(index) {
  const item = OPTIMIZE_EXAMPLES[index];
  if (!item) return;
  const text = [
    '프롬프트:',
    item.prompt,
    '',
    '결과:',
    item.output,
    '',
    '목표:',
    item.goal,
  ].join('\n');
  navigator.clipboard.writeText(text);
}

function copyOptimizePrompt() {
  const text = document.getElementById('optimize-improved-prompt')?.textContent?.trim() || '';
  if (!text) return;
  navigator.clipboard.writeText(text);
}

function openOptimizeFromResult() {
  const variants = state.generatedVariants || [];
  const index = Number.isInteger(state.selectedGeneratedVariantIndex) ? state.selectedGeneratedVariantIndex : 0;
  const selected = variants[index] || variants[0];
  const currentPrompt = selected?.prompt || document.getElementById('result-prompt')?.textContent?.trim() || '';
  switchMode('optimize');
  if (!currentPrompt) {
    setOptimizeText('optimize-status', '먼저 결과를 생성하세요.');
    return;
  }
  setOptimizeValue('optimize-prompt', currentPrompt);
  setOptimizeValue('optimize-output', '');
  setOptimizeValue('optimize-goal', '현재 결과를 더 명확하고 실행 가능하게 다듬으세요.');
  setOptimizeText('optimize-status', '생성 결과를 최적화 모드로 보냈습니다.');
  getOptimizeEl('optimize-prompt')?.focus();
}

function polishHomepageCopy() {
  const hero = document.querySelector('main > section.text-center');
  if (!hero) return;
  const badge = hero.querySelector('div.inline-flex');
  const title = hero.querySelector('h2');
  const description = hero.querySelector('p');

  if (badge) badge.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> 프롬프트를 몰라도 AI를 잘 쓰게 만드는 플랫폼';
  if (title) title.innerHTML = '업무 템플릿으로 쉽게 시작하고, <br /><span class="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">빌더로 직접 설계하고 최적화로 품질을 높이세요</span>';
  if (description) description.innerHTML = '복잡한 프롬프트를 외울 필요 없이 시작할 수 있고, <br class="hidden sm:inline" />빌더로 직접 설계한 뒤 최적화 루프로 품질을 계속 높일 수 있습니다.';
}

function localizeWorkspaceCopy() {
  const mapping = [
    ['button[onclick*="loadBuilderStarter"]', '이 예시 사용'],
    ['button[onclick*="loadOptimizeExample"]', '불러오기'],
    ['button[onclick*="copyOptimizeExample"]', '복사'],
    ['button[onclick*="copyOptimizePrompt"]', '복사'],
    ['button[onclick*="rollbackOptimizePrompt"]', '되돌리기'],
    ['button[onclick*="clearOptimizeCompare"]', '초기화'],
    ['button[onclick*="loadOptimizeVersion"]', '불러오기'],
    ['button[onclick*="compareOptimizeVersion"]', '비교'],
    ['button[onclick*="rollbackOptimizeVersion"]', '되돌리기'],
  ];

  mapping.forEach(([selector, label]) => {
    document.querySelectorAll(selector).forEach((button) => {
      button.textContent = label;
    });
  });

  const runBtn = document.getElementById('optimize-run-btn');
  if (runBtn) runBtn.textContent = '최적화 실행';

  const labels = document.querySelectorAll('#optimize-workspace label, #builder-helper-panel h4, #optimize-workspace h4');
  labels.forEach((el) => {
    const text = el.textContent || '';
    if (text.includes('Prompt')) el.textContent = '프롬프트';
    if (text.includes('Output')) el.textContent = '결과';
    if (text.includes('Goal')) el.textContent = '목표';
  });
}

window.switchMode = switchMode;
window.initializeMode = initializeMode;
window.runOptimize = runOptimize;
window.saveOptimizeVersion = saveOptimizeVersion;
window.copyOptimizePrompt = copyOptimizePrompt;
window.loadOptimizeVersion = loadOptimizeVersion;
window.compareOptimizeVersion = compareOptimizeVersion;
window.rollbackOptimizeVersion = rollbackOptimizeVersion;
window.clearOptimizeCompare = clearOptimizeCompare;
window.rollbackOptimizePrompt = rollbackOptimizePrompt;
window.loadBuilderStarter = loadBuilderStarter;
window.loadQuickStart = loadQuickStart;
window.loadOptimizeExample = loadOptimizeExample;
window.copyOptimizeExample = copyOptimizeExample;
window.polishHomepageCopy = polishHomepageCopy;
window.localizeWorkspaceCopy = localizeWorkspaceCopy;
window.openOptimizeFromResult = openOptimizeFromResult;

