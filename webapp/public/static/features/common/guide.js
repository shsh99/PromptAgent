// ===== guide.js - 가이드 모달 =====

function showGuide() {
  const modal = document.getElementById('guide-modal');
  const content = document.getElementById('guide-content');
  if (!modal || !content) return;

  modal.classList.remove('hidden');
  content.innerHTML = `
    <div>
      <h4 class="text-base font-bold text-white mb-2 flex items-center gap-2">
        <i class="fas fa-circle-info text-brand-400"></i>프롬프트 엔지니어링이란?
      </h4>
      <p class="text-gray-400 text-sm leading-relaxed">
        프롬프트 엔지니어링은 AI에게 <strong class="text-white">원하는 맥락</strong>을 제공하고,
        <strong class="text-white">정확한 지시</strong>를 내려 효과적이고 관련성 높은 출력을 얻는 기술입니다.
      </p>
    </div>
    <div>
      <h4 class="text-base font-bold text-white mb-3 flex items-center gap-2">
        <i class="fas fa-diagram-project text-cyan-400"></i>3가지 엔지니어링 유형
      </h4>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
          <div class="text-sm font-semibold text-blue-400 mb-1">프롬프트 엔지니어링</div>
          <div class="text-xs text-gray-400">개별 프롬프트의 구조와 표현을 최적화. 제로샷, 퓨샷, CoT, ToT, 역할 프롬프트 등</div>
        </div>
        <div class="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
          <div class="text-sm font-semibold text-cyan-400 mb-1">컨텍스트 엔지니어링</div>
          <div class="text-xs text-gray-400">프로젝트 전체 맥락 설계. 시스템 프롬프트, 프로젝트 스펙, 기술 요구사항 종합</div>
        </div>
        <div class="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-3">
          <div class="text-sm font-semibold text-indigo-400 mb-1">하네스 엔지니어링</div>
          <div class="text-xs text-gray-400">역할+컨텍스트+작업+형식+제약을 체계적으로 결합하는 종합 기법</div>
        </div>
      </div>
    </div>
    <div>
      <h4 class="text-base font-bold text-white mb-3 flex items-center gap-2">
        <i class="fas fa-key text-yellow-400"></i>프롬프트의 핵심 요소
      </h4>
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-gray-800/50 rounded-lg p-3">
          <div class="text-sm font-semibold text-brand-400 mb-1">컨텍스트</div>
          <div class="text-xs text-gray-400">배경이나 역할 설정</div>
        </div>
        <div class="bg-gray-800/50 rounded-lg p-3">
          <div class="text-sm font-semibold text-brand-400 mb-1">지시사항</div>
          <div class="text-xs text-gray-400">정확한 작업 명시</div>
        </div>
        <div class="bg-gray-800/50 rounded-lg p-3">
          <div class="text-sm font-semibold text-brand-400 mb-1">출력 형식</div>
          <div class="text-xs text-gray-400">원하는 결과 형태</div>
        </div>
        <div class="bg-gray-800/50 rounded-lg p-3">
          <div class="text-sm font-semibold text-brand-400 mb-1">톤 &amp; 제약</div>
          <div class="text-xs text-gray-400">어조, 길이, 수준</div>
        </div>
      </div>
    </div>
    <div>
      <h4 class="text-base font-bold text-white mb-3 flex items-center gap-2">
        <i class="fas fa-stairs text-green-400"></i>사용법
      </h4>
      <div class="space-y-2">
        <div class="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
          <div class="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</div>
          <div>
            <div class="text-sm font-medium text-white">목적 + 키워드 입력</div>
            <div class="text-xs text-gray-400">프로젝트 유형을 선택하고 핵심 키워드를 입력합니다.</div>
          </div>
        </div>
        <div class="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
          <div class="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</div>
          <div>
            <div class="text-sm font-medium text-white">"추천 받기" 클릭</div>
            <div class="text-xs text-gray-400">AI가 최적의 기법을 추천하고, 필드를 자동으로 채워줍니다.</div>
          </div>
        </div>
        <div class="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
          <div class="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</div>
          <div>
            <div class="text-sm font-medium text-white">자동 채워진 필드 검토/수정</div>
            <div class="text-xs text-gray-400">AI가 채운 내용을 확인하고 필요 시 수정합니다.</div>
          </div>
        </div>
        <div class="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
          <div class="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">4</div>
          <div>
            <div class="text-sm font-medium text-white">"프롬프트 생성" 클릭</div>
            <div class="text-xs text-gray-400">완성된 프롬프트를 복사하여 AI 도구에 붙여넣으세요!</div>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-brand-500/5 border border-brand-500/20 rounded-xl p-4">
      <h4 class="text-sm font-bold text-brand-400 mb-2"><i class="fas fa-lightbulb mr-1"></i>바이브 코딩 팁</h4>
      <ul class="text-xs text-gray-400 space-y-1.5">
        <li class="flex items-start gap-2"><i class="fas fa-check text-brand-500 mt-0.5"></i>프로젝트의 전체 그림을 먼저 설명하세요.</li>
        <li class="flex items-start gap-2"><i class="fas fa-check text-brand-500 mt-0.5"></i>컨텍스트 엔지니어링으로 프로젝트 스펙 문서를 만드세요.</li>
        <li class="flex items-start gap-2"><i class="fas fa-check text-brand-500 mt-0.5"></i>프롬프트 체이닝으로 단계별 개발을 진행하세요.</li>
        <li class="flex items-start gap-2"><i class="fas fa-check text-brand-500 mt-0.5"></i>한 번에 모든 것을 요청하지 말고 나누세요.</li>
      </ul>
    </div>`;
}

function closeGuide() {
  const modal = document.getElementById('guide-modal');
  if (!modal) return;
  modal.classList.add('hidden');
}
