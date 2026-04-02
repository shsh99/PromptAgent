function setFieldValue(fieldId, value) {
  const el = document.getElementById(`field-${fieldId}`);
  if (!el) return false;
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

function getStarterPreset(item) {
  const presets = {
    '업무 이메일': {
      role: '정중하고 명확한 업무 이메일 작성자',
      context: '상황: 상대에게 핵심 내용을 빠르게 전달해야 합니다.',
      task: '아래 상황을 바탕으로 바로 보낼 수 있는 업무 이메일 초안을 작성하세요.',
      output_format: '제목 / 본문 / 마무리 문구',
      tone: '정중하고 간결하게',
      constraints: '핵심 요청은 앞에 두고, 불필요한 수식은 줄이세요.',
    },
    '회의 요약': {
      role: '회의록 정리 담당자',
      context: '회의 메모를 정리해서 실행 가능한 문서로 바꾸는 작업입니다.',
      task: '회의 내용을 결정 사항, 논의 사항, 후속 조치로 나누어 정리하세요.',
      output_format: '결정 사항 / 논의 사항 / 후속 조치 / 담당자',
      tone: '실무적으로, 짧고 명확하게',
      constraints: '추측하지 말고 메모에 있는 내용만 정리하세요.',
    },
    '보고서 초안': {
      role: '주간/월간 보고서 작성자',
      context: '진행 상황과 결과를 한눈에 보이게 정리해야 합니다.',
      task: '프로젝트의 현재 상태를 핵심 지표와 함께 보고서 초안으로 정리하세요.',
      output_format: '개요 / 핵심 지표 / 진행 현황 / 이슈 / 다음 계획',
      tone: '간결하고 신뢰감 있게',
      constraints: '숫자와 사실을 우선하고, 감상적 표현은 줄이세요.',
    },
    '자기소개서': {
      role: '지원 동기와 경험을 정리하는 작성자',
      context: '지원자의 경험을 자연스럽게 연결해 읽기 좋은 글로 바꾸는 작업입니다.',
      task: '경험, 강점, 지원 동기를 연결해 자기소개서 초안을 작성하세요.',
      output_format: '성장 배경 / 경험 / 강점 / 지원 동기 / 마무리',
      tone: '진정성 있고 자신감 있게',
      constraints: '과장하지 말고 실제 경험을 중심으로 쓰세요.',
    },
    '코드 리뷰': {
      role: '시니어 엔지니어 리뷰어',
      context: 'PR 코드를 검토하고 문제를 빠르게 찾는 상황입니다.',
      task: '문제, 원인, 영향, 수정 제안을 기준으로 코드 리뷰를 작성하세요.',
      output_format: '문제 / 영향 / 수정 제안 / 우선순위',
      tone: '명확하고 실무적으로',
      constraints: '정확성, 유지보수성, 테스트 누락을 먼저 점검하세요.',
    },
    '기획 문서': {
      role: '서비스 기획자',
      context: '새 서비스나 기능의 구조를 먼저 잡아야 합니다.',
      task: '목표, 사용자, 핵심 기능, 성공 기준이 포함된 기획 문서를 작성하세요.',
      output_format: '문제 정의 / 대상 사용자 / 핵심 기능 / 지표 / 일정',
      tone: '구조적이고 설득력 있게',
      constraints: '기능은 적어도 핵심 흐름이 분명해야 합니다.',
    },
    '블로그 글': {
      role: '콘텐츠 에디터',
      context: '검색과 읽기 경험을 고려한 글이 필요합니다.',
      task: '주제를 바탕으로 읽기 쉬운 블로그 글 초안을 작성하세요.',
      output_format: '제목 / 서론 / 본문 / 요약 / CTA',
      tone: '자연스럽고 이해하기 쉽게',
      constraints: '핵심 키워드는 자연스럽게 녹이세요.',
    },
    '마케팅 카피': {
      role: '전환 중심 카피라이터',
      context: '관심을 끌고 행동을 유도하는 문구가 필요합니다.',
      task: '대상 고객의 문제를 짚고 전환을 유도하는 카피 초안을 작성하세요.',
      output_format: '핵심 메시지 / 헤드라인 후보 / 서브카피 / CTA',
      tone: '짧고 강하게',
      constraints: '혜택은 분명하게, 문장은 짧게 유지하세요.',
    },
    'API 설계': {
      role: '백엔드 아키텍트',
      context: 'REST API의 책임과 계약을 먼저 정의해야 합니다.',
      task: '기능 요구를 바탕으로 엔드포인트, 요청/응답, 오류 규칙을 설계하세요.',
      output_format: '엔드포인트 / 요청 / 응답 / 에러 / 보안 고려사항',
      tone: '정확하고 명세 중심으로',
      constraints: '동사와 리소스 구조를 일관되게 유지하세요.',
    },
    '데이터 분석': {
      role: '데이터 분석가',
      context: '데이터에서 인사이트를 뽑아 의사결정에 연결해야 합니다.',
      task: '분석 목표에 맞춰 지표, 접근 방법, 해석 포인트를 정리하세요.',
      output_format: '분석 목적 / 지표 / 접근 방법 / 인사이트 / 다음 액션',
      tone: '정확하고 설명 가능하게',
      constraints: '해석과 사실을 분리해서 작성하세요.',
    },
    '유튜브 대본': {
      role: '영상 스크립트 작가',
      context: '시청자의 몰입을 유지하는 대본이 필요합니다.',
      task: '도입, 전개, 후킹 포인트가 있는 유튜브 대본 초안을 작성하세요.',
      output_format: '오프닝 / 본문 / 전환 / 클로징 / CTA',
      tone: '말하듯 자연스럽게',
      constraints: '첫 15초 안에 관심을 끌 수 있게 구성하세요.',
    },
    '브레인스토밍': {
      role: '아이디어 촉진자',
      context: '다양한 관점의 아이디어가 필요합니다.',
      task: '주제에 대해 실행 가능한 아이디어를 여러 갈래로 정리하세요.',
      output_format: '핵심 아이디어 / 변형 아이디어 / 장단점 / 추천안',
      tone: '열려 있고 창의적으로',
      constraints: '너무 추상적이지 않게, 바로 적용 가능한 수준으로 쓰세요.',
    },
  };

  return presets[item?.title] || null;
}

function applyStarterPreset(item) {
  if (!item) return;
  const preset = getStarterPreset(item);
  const fallback = {
    context: item.description || '',
    task: item.keyword ? `"${item.keyword}"에 맞는 프롬프트 초안을 작성하세요.` : '',
    output_format: '핵심 내용 / 세부 내용 / 정리된 결과',
    tone: '명확하고 실무적으로',
  };
  const fields = { ...fallback, ...(preset || {}) };

  window.setTimeout(() => {
    Object.entries(fields).forEach(([fieldId, value]) => {
      if (value) setFieldValue(fieldId, value);
    });
    if (item.keyword) {
      setFieldValue('examples', `예시 주제: ${item.keyword}\n원하는 결과: ${item.title} 형식의 초안`);
    }
  }, 350);
}

const TEMPLATE_MARKET_USAGE_KEY = 'pf_template_market_usage';

function getTemplateMarketUsageMap() {
  try {
    return JSON.parse(localStorage.getItem(TEMPLATE_MARKET_USAGE_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function saveTemplateMarketUsageMap(map) {
  localStorage.setItem(TEMPLATE_MARKET_USAGE_KEY, JSON.stringify(map || {}));
}

function getTemplateMarketKey(item) {
  return String(item?.title || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getTemplateMarketUsage(item) {
  const usageMap = getTemplateMarketUsageMap();
  const key = getTemplateMarketKey(item);
  return Number(item?.uses || 0) + Number(usageMap[key] || 0);
}

function incrementTemplateMarketUsage(item) {
  const key = getTemplateMarketKey(item);
  if (!key) return;
  const usageMap = getTemplateMarketUsageMap();
  usageMap[key] = Number(usageMap[key] || 0) + 1;
  saveTemplateMarketUsageMap(usageMap);
}

const TEMPLATE_MARKET_FIELD_PACKS = {
  '업무 이메일': {
    role: '정중하고 명확한 업무 이메일 작성자',
    role_detail: '업무 커뮤니케이션과 메시지 구조화에 능숙한 비즈니스 라이터',
    context: '상대방이 빠르게 이해하고 바로 행동할 수 있도록, 배경과 요청 사항을 분명하게 전달해야 합니다.',
    task: '상황에 맞는 업무 이메일 초안을 작성하세요. 요청, 회신, 안내, 일정 조율 중 어떤 유형인지 먼저 파악한 뒤 가장 적절한 구조로 정리하세요.',
    output_format: '제목 / 인사말 / 본문 / 요청사항 / 마무리 문구',
    tone: '정중하고 간결하게',
    constraints: '상황 설명이 부족하면 자연스럽게 보완하되, 과장하지 말고 바로 보낼 수 있는 수준으로 작성하세요.',
    examples: '입력: 일정 변경 요청\n출력: 정중한 일정 조율 메일 초안',
  },
  '주간 보고서': {
    role: '주간 실적을 구조적으로 정리하는 보고서 작성자',
    role_detail: '핵심 지표와 개선 과제를 정리하는 업무 보고 전문가',
    context: '이번 주 성과와 이슈를 상위 보고용 문서로 정리해야 합니다.',
    task: '주간 실적을 바탕으로 성과, 이슈, 개선안, 다음 주 계획이 명확하게 드러나는 보고서를 작성하세요.',
    output_format: '개요 / 핵심 성과 / 이슈 / 개선안 / 다음 주 계획',
    tone: '업무적으로 명확하게',
    constraints: '숫자는 사실 중심으로 쓰고, 해석은 짧고 분명하게 정리하세요. 빠진 정보는 추론하되 추론임을 드러내세요.',
    examples: '입력: 서비스 운영 주간 결과\n출력: 핵심 지표와 개선안이 분명한 주간 보고서',
  },
  '회의록 정리': {
    role: '회의 내용을 빠르고 정확하게 정리하는 문서 작성자',
    role_detail: '논의 내용을 결정 사항 중심으로 재구성하는 회의록 정리 전문가',
    context: '회의 메모를 실무에서 바로 쓸 수 있는 문서로 바꿔야 합니다.',
    task: '회의 내용에서 결정 사항, 논의 사항, 후속 조치, 담당자를 분리해 정리하세요.',
    output_format: '결정 사항 / 논의 사항 / 후속 조치 / 담당자 / 마감 일정',
    tone: '업무적으로 차분하고 명확하게',
    constraints: '추측은 줄이고 기록된 사실만 우선 정리하세요. 결정되지 않은 항목은 별도로 표시하세요.',
    examples: '입력: 팀 주간 회의 메모\n출력: 실행 항목이 분명한 회의록',
  },
  '자기소개서': {
    role: '지원 동기를 설득력 있게 풀어내는 자기소개서 작성자',
    role_detail: '경험과 강점을 기업 관점에서 연결하는 커리어 라이터',
    context: '지원자의 경험을 읽는 사람이 빠르게 이해하도록 정리해야 합니다.',
    task: '경험, 강점, 지원 동기를 자연스럽게 연결해 자기소개서 초안을 작성하세요.',
    output_format: '성장 배경 / 핵심 경험 / 강점 / 지원 동기 / 마무리',
    tone: '진정성 있고 자신감 있게',
    constraints: '과장 없이 구체적 사례 중심으로 작성하고, 각 문단의 역할이 겹치지 않게 하세요.',
    examples: '입력: 신입 지원서용 자기소개\n출력: 핵심 경험이 드러나는 자소서 초안',
  },
  '코드 리뷰': {
    role: '시니어 엔지니어 관점에서 리뷰하는 개발자',
    role_detail: '문제 탐지, 영향도 판단, 수정 우선순위 정리에 익숙한 코드 리뷰어',
    context: 'PR 코드를 검토하고 문제를 빠르게 찾아야 합니다.',
    task: '문제, 원인, 영향, 수정 제안을 기준으로 코드 리뷰를 작성하세요.',
    output_format: '문제 / 영향 / 수정 제안 / 우선순위 / 확인이 필요한 질문',
    tone: '명확하고 업무적으로',
    constraints: '정확한 지적에 집중하고 추측성 표현은 줄이세요. 가능한 경우 테스트 또는 재현 방법까지 적으세요.',
    examples: '입력: PR 리뷰 요청\n출력: 리스크와 수정 제안이 명확한 리뷰',
  },
  '기획 문서': {
    role: '서비스 기획을 구조적으로 설계하는 작성자',
    role_detail: '목표, 사용자, 기능을 구체적인 산출물로 정리하는 기획자',
    context: '새 기능의 구조를 빠르게 정리해야 합니다.',
    task: '목표, 사용자, 핵심 기능, 데이터 흐름, 일정이 연결된 기획 문서를 작성하세요.',
    output_format: '문제 정의 / 사용자 / 핵심 기능 / 데이터 흐름 / 일정 / 리스크',
    tone: '체계적이고 설득력 있게',
    constraints: '기능은 실현 가능성을 기준으로 우선순위를 나누고, 범위 밖 항목은 명확히 제외하세요.',
    examples: '입력: 관리자 대시보드 기획\n출력: 핵심 기능과 일정이 정리된 기획 문서',
  },
  '블로그 글': {
    role: '콘텐츠 마케터 관점의 블로그 작성자',
    role_detail: '검색 유입과 가독성을 함께 고려하는 콘텐츠 라이터',
    context: '검색과 전환을 함께 고려한 글이 필요합니다.',
    task: '주제를 구조화해 읽기 쉬운 블로그 초안을 작성하세요.',
    output_format: '제목 / 도입 / 소제목 / 본문 / 요약 / CTA',
    tone: '자연스럽고 친근하게',
    constraints: '초반에 독자의 관심을 끌고, 본문은 한 번에 이해되도록 짧은 문장으로 구성하세요.',
    examples: '입력: 서비스 소개 글\n출력: 검색과 전환을 모두 고려한 블로그 초안',
  },
  '마케팅 카피': {
    role: '전환 중심 카피라이터',
    role_detail: '문제 제시와 행동 유도를 짧고 강하게 전달하는 퍼포먼스 카피 전문가',
    context: '광고나 랜딩페이지에서 바로 적용 가능한 문구가 필요합니다.',
    task: '문제 제시, 해결 제안, 행동 유도로 이어지는 카피를 작성하세요.',
    output_format: '헤드라인 / 서브헤드 / 혜택 / CTA',
    tone: '짧고 강하게',
    constraints: '문장은 짧게, 메시지는 분명하게 유지하세요. 한 문단에 하나의 핵심만 담으세요.',
    examples: '입력: 신제품 광고\n출력: 클릭과 전환을 유도하는 카피',
  },
  'API 설계': {
    role: '백엔드 아키텍트',
    role_detail: '리소스 경계와 계약을 명확히 정의하는 API 설계 전문가',
    context: '새 기능의 API 계약을 먼저 잡아야 합니다.',
    task: '요청, 응답, 에러, 권한을 고려한 REST API 설계를 작성하세요.',
    output_format: '엔드포인트 / 요청 / 응답 / 에러 / 보안 고려사항',
    tone: '정확하고 명세 중심으로',
    constraints: '리소스 기준으로 나누고, 각 엔드포인트의 책임이 겹치지 않게 하세요.',
    examples: '입력: 회원 API 설계 요청\n출력: 명세가 분명한 REST API 설계',
  },
  '데이터 분석': {
    role: '데이터 분석가',
    role_detail: '지표 정의와 해석을 구분해서 설명하는 분석 전문가',
    context: '분석 목표를 먼저 분명히 해야 합니다.',
    task: '목표, 지표, 분석 방법, 해석 관점을 포함한 분석 브리프를 작성하세요.',
    output_format: '분석 목표 / 지표 / 방법 / 해석 / 다음 액션',
    tone: '명확하고 논리적으로',
    constraints: '사실과 해석을 분리하고, 실행 가능한 다음 액션이 보이도록 작성하세요.',
    examples: '입력: 전환율 하락 분석\n출력: 원인과 대응이 보이는 분석 브리프',
  },
  '유튜브 대본': {
    role: '영상 대본 작가',
    role_detail: '초반 이탈을 줄이고 몰입을 유지하는 스크립트 작성 전문가',
    context: '초반 이탈을 줄이는 구성이 중요합니다.',
    task: '도입, 전개, 예시, 마무리까지 이어지는 유튜브 대본을 작성하세요.',
    output_format: '오프닝 / 본문 / 전환 / 클로징 / CTA',
    tone: '자연스럽고 몰입감 있게',
    constraints: '첫 15초 안에 관심을 끌고, 장면 전환이 자연스럽게 느껴지도록 구성하세요.',
    examples: '입력: 서비스 소개 영상\n출력: 시청 지속을 돕는 유튜브 대본',
  },
  '브레인스토밍': {
    role: '아이디어 발산을 돕는 진행자',
    role_detail: '다양한 방향을 빠르게 뽑고 실용적인 안을 추리는 아이디어 파실리테이터',
    context: '다양한 관점에서 접근할 아이디어가 필요합니다.',
    task: '주제를 여러 방향으로 확장해 실용적인 아이디어를 제안하세요.',
    output_format: '아이디어 목록 / 변형안 / 적용 포인트 / 추천안',
    tone: '자유롭고 발산적으로',
    constraints: '추상적인 표현보다 실행 가능한 아이디어를 우선하고, 각 아이디어의 활용 이유를 짧게 붙이세요.',
    examples: '입력: 신규 서비스 아이디어\n출력: 바로 검토 가능한 아이디어 목록',
  },
};

function getTemplateMarketFields(item) {
  const starter = item?.starter || {};
  const pack = TEMPLATE_MARKET_FIELD_PACKS[item?.title] || {};
  const title = String(item?.title || '').trim();
  const keyword = String(item?.keyword || title || '').trim();
  const categoryLabel = item?.category === 'office'
    ? '사무/업무'
    : item?.category === 'developer'
      ? '개발'
      : item?.category === 'analysis'
        ? '분석'
        : item?.category === 'creative'
          ? '창작'
          : '콘텐츠';
  const base = {
    role: `당신은 ${title}를 전문적으로 다루는 전문가입니다.`,
    role_detail: `${categoryLabel} 업무에 익숙한 실무형 전문가`,
    context: item?.description || '',
    task: keyword ? `"${keyword}"에 맞는 완성형 프롬프트를 작성하세요.` : '선택한 템플릿에 맞는 완성형 프롬프트를 작성하세요.',
    output_format: '구조화된 결과',
    tone: '명확하고 간결하게',
    constraints: '핵심 정보, 출력 형식, 제약 조건을 분명하게 유지하세요.',
    examples: `입력: ${keyword || title}\n출력: ${title} 완성형 초안`,
  };
  return { ...base, ...starter, ...pack };
}

const TEMPLATE_MARKET_CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'office', label: '사무/업무' },
  { key: 'developer', label: '개발' },
  { key: 'content', label: '콘텐츠' },
  { key: 'analysis', label: '분석' },
  { key: 'creative', label: '창작' },
];

const TEMPLATE_MARKET_ITEMS = [
  {
    title: '업무 이메일',
    category: 'office',
    icon: 'fa-envelope',
    badge: '인기',
    rating: 4.8,
    uses: 342,
    description: '상황별 메일을 빠르게 작성합니다.',
    tags: ['이메일', '비즈니스', '소통'],
    mode: 'template',
    purpose: 'content',
    keyword: '정중한 업무 이메일 작성',
    technique: 'harness',
    starter: {
      role: '정중하고 명확한 업무 이메일 작성자',
      context: '상대방이 빠르게 이해할 수 있도록 상황을 먼저 정리해야 합니다.',
      task: '요청, 회신, 안내 중 어떤 유형인지에 맞춰 바로 보낼 수 있는 메일 초안을 작성하세요.',
      output_format: '제목 / 본문 / 마무리 문구',
      tone: '정중하고 간결하게',
      constraints: '상황 설명이 부족해도 적절한 추론으로 초안을 작성하세요.',
      examples: '예시 주제: 일정 변경 요청\n예시 결과: 정중한 일정 조율 메일',
    },
  },
  {
    title: '주간 보고서',
    category: 'office',
    icon: 'fa-chart-line',
    badge: '추천',
    rating: 4.7,
    uses: 289,
    description: '핵심 지표와 개선안을 담은 보고서를 만듭니다.',
    tags: ['보고서', '주간', '실적'],
    mode: 'builder',
    purpose: 'content',
    keyword: '주간 보고서 초안',
    technique: 'harness',
    starter: {
      role: '주간 실적을 구조적으로 정리하는 작성자',
      context: '이번 주 결과를 상위 보고용 문서로 바꿔야 합니다.',
      task: '성과, 이슈, 개선안, 다음 주 계획이 담긴 주간 보고서 초안을 작성하세요.',
      output_format: '개요 / 실적 / 이슈 / 개선안 / 다음 계획',
      tone: '업무적으로 명확하게',
      constraints: '숫자는 사실 위주로, 해석은 짧고 분명하게 작성하세요.',
      examples: '예시 주제: 서비스 운영 보고서\n예시 결과: 핵심 지표 중심 주간 보고서',
    },
  },
  {
    title: '회의록 정리',
    category: 'office',
    icon: 'fa-clipboard-list',
    badge: '실무',
    rating: 4.6,
    uses: 256,
    description: '결정사항과 후속조치를 자동으로 정리합니다.',
    tags: ['회의', '정리', '후속'],
    mode: 'template',
    purpose: 'content',
    keyword: '회의 내용 요약과 후속 조치 정리',
    technique: 'harness',
    starter: {
      role: '회의 내용을 빠르게 정리하는 문서 작성자',
      context: '회의 메모를 실무에서 바로 쓰는 문서로 바꿔야 합니다.',
      task: '회의 내용 중 결정 사항, 논의 사항, 후속 조치를 한 번에 정리하세요.',
      output_format: '결정 사항 / 논의 사항 / 후속 조치 / 담당자',
      tone: '업무적으로 차분하고 명확하게',
      constraints: '추측은 줄이고 메모에 있는 사실만 정리하세요.',
      examples: '예시 주제: 팀 주간 회의\n예시 결과: 결정 사항이 잘 보이는 회의록',
    },
  },
  {
    title: '자기소개서',
    category: 'office',
    icon: 'fa-user-edit',
    badge: '인기',
    rating: 4.8,
    uses: 312,
    description: '경험과 강점을 자연스럽게 이어줍니다.',
    tags: ['자소서', '취업', '이력서'],
    mode: 'template',
    purpose: 'content',
    keyword: '자기소개서 초안 작성',
    technique: 'role-prompting',
    starter: {
      role: '지원 동기를 설득력 있게 풀어내는 작성자',
      context: '지원자의 경험을 기업 관점에서 이해하기 쉽게 바꿔야 합니다.',
      task: '경험, 강점, 지원 동기를 연결해 자연스러운 자기소개서 초안을 작성하세요.',
      output_format: '성장 배경 / 강점 / 지원 동기 / 마무리',
      tone: '진정성 있고 자신감 있게',
      constraints: '과장 없이 구체적 사례 중심으로 작성하세요.',
      examples: '예시 주제: 신입 지원서\n예시 결과: 핵심 경험이 드러나는 자소서',
    },
  },
  {
    title: '코드 리뷰',
    category: 'developer',
    icon: 'fa-code',
    badge: '고급',
    rating: 4.9,
    uses: 198,
    description: '문제, 원인, 수정안을 구조화해서 정리합니다.',
    tags: ['코드', '리뷰', '개발'],
    mode: 'builder',
    purpose: 'web-app',
    keyword: '리액트 코드 리뷰',
    technique: 'harness',
    starter: {
      role: '시니어 엔지니어 관점에서 리뷰하는 작성자',
      context: 'PR 코드를 검토하고 문제를 빠르게 찾는 상황입니다.',
      task: '문제, 원인, 영향, 수정 제안을 기준으로 코드 리뷰를 작성하세요.',
      output_format: '문제 / 영향 / 수정 제안 / 우선순위',
      tone: '명확하고 업무적으로',
      constraints: '정확한 지적에 집중하고 추측성 표현은 줄이세요.',
      examples: '예시 주제: PR 리뷰\n예시 결과: 리스크와 수정 제안이 명확한 리뷰',
    },
  },
  {
    title: '기획 문서',
    category: 'developer',
    icon: 'fa-sitemap',
    badge: '추천',
    rating: 4.7,
    uses: 176,
    description: '목표, 사용자, 기능을 한 번에 정리합니다.',
    tags: ['기획', '설계', '서비스'],
    mode: 'builder',
    purpose: 'web-app',
    keyword: '서비스 기획서 초안',
    technique: 'context-engineering',
    starter: {
      role: '서비스 기획을 구조적으로 설계하는 작성자',
      context: '새 기능의 구조를 빠르게 정리해야 합니다.',
      task: '목표, 사용자, 기능, 데이터 흐름을 포함한 기획 문서를 작성하세요.',
      output_format: '문제 정의 / 사용자 / 핵심 기능 / 데이터 흐름 / 일정',
      tone: '체계적이고 설득력 있게',
      constraints: '기능은 실현 가능성을 기준으로 우선순위를 나누세요.',
      examples: '예시 주제: 관리자 대시보드 기획\n예시 결과: 핵심 기능이 정리된 기획 문서',
    },
  },
  {
    title: '블로그 글',
    category: 'content',
    icon: 'fa-blog',
    badge: '콘텐츠',
    rating: 4.5,
    uses: 231,
    description: 'SEO와 가독성을 함께 챙긴 글로 만듭니다.',
    tags: ['블로그', 'SEO', '콘텐츠'],
    mode: 'template',
    purpose: 'content',
    keyword: '블로그 글 초안 작성',
    technique: 'role-prompting',
    starter: {
      role: '콘텐츠 마케터 관점의 블로그 작성자',
      context: '검색과 전환을 고려한 글이 필요합니다.',
      task: '주제를 구조화해 읽기 쉬운 블로그 초안을 작성하세요.',
      output_format: '제목 / 소제목 / 본문 / 요약 / CTA',
      tone: '자연스럽고 친근하게',
      constraints: '초반 15초 안에 관심을 끌 수 있게 구성하세요.',
      examples: '예시 주제: 서비스 소개 글\n예시 결과: 전환에 도움이 되는 블로그 초안',
    },
  },
  {
    title: '마케팅 카피',
    category: 'content',
    icon: 'fa-bullhorn',
    badge: '전환',
    rating: 4.6,
    uses: 167,
    description: '전환 중심의 문구를 빠르게 만듭니다.',
    tags: ['마케팅', '카피', '전환'],
    mode: 'template',
    purpose: 'content',
    keyword: '전환 중심의 마케팅 카피',
    technique: 'role-prompting',
    starter: {
      role: '전환 중심 카피라이터',
      context: '광고나 랜딩페이지에서 바로 적용 가능한 문구가 필요합니다.',
      task: '문제 제시, 해결 제안, 행동 유도로 이어지는 카피를 작성하세요.',
      output_format: '헤드라인 / 서브헤드 / 혜택 / CTA',
      tone: '짧고 강하게',
      constraints: '문장은 짧게, 메시지는 분명하게 유지하세요.',
      examples: '예시 주제: 신제품 광고\n예시 결과: 클릭을 유도하는 카피',
    },
  },
  {
    title: 'API 설계',
    category: 'developer',
    icon: 'fa-server',
    badge: '고급',
    rating: 4.8,
    uses: 145,
    description: 'REST API 엔드포인트를 설계합니다.',
    tags: ['API', 'REST', '개발'],
    mode: 'builder',
    purpose: 'web-app',
    keyword: 'REST API 설계',
    technique: 'context-engineering',
    starter: {
      role: '백엔드 아키텍트',
      context: '새 기능의 API 계약을 먼저 잡아야 합니다.',
      task: '요청, 응답, 에러, 권한을 고려한 API 설계를 작성하세요.',
      output_format: '엔드포인트 / 요청 / 응답 / 에러 / 보안 고려사항',
      tone: '정확하고 명세 중심으로',
      constraints: '기능별 리소스를 분리해 설계하세요.',
      examples: '예시 주제: 회원 API 설계\n예시 결과: 명세가 분명한 REST 설계',
    },
  },
  {
    title: '데이터 분석',
    category: 'analysis',
    icon: 'fa-chart-pie',
    badge: '인사이트',
    rating: 4.7,
    uses: 134,
    description: '분석 목표를 체계적으로 도출합니다.',
    tags: ['데이터', '분석', '인사이트'],
    mode: 'builder',
    purpose: 'content',
    keyword: '데이터 분석 브리프',
    technique: 'harness',
    starter: {
      role: '데이터 분석가',
      context: '분석 목표를 먼저 분명히 해야 합니다.',
      task: '목표, 지표, 분석 방법, 해석 관점을 포함한 분석 브리프를 작성하세요.',
      output_format: '분석 목표 / 지표 / 방법 / 해석 / 다음 액션',
      tone: '명확하고 논리적으로',
      constraints: '해석과 사실을 분리해 작성하세요.',
      examples: '예시 주제: 전환율 분석\n예시 결과: 실행 가능한 분석 브리프',
    },
  },
  {
    title: '유튜브 대본',
    category: 'creative',
    icon: 'fa-video',
    badge: '대본',
    rating: 4.5,
    uses: 203,
    description: '시청자를 붙잡는 영상 대본을 만듭니다.',
    tags: ['유튜브', '대본', '영상'],
    mode: 'template',
    purpose: 'content',
    keyword: '유튜브 대본 초안',
    technique: 'role-prompting',
    starter: {
      role: '영상 대본 작가',
      context: '초반 이탈을 줄이는 구성이 중요합니다.',
      task: '도입, 전개, 예시, 마무리까지 이어지는 유튜브 대본을 작성하세요.',
      output_format: '오프닝 / 본문 / 전환 / 클로징 / CTA',
      tone: '자연스럽고 몰입감 있게',
      constraints: '첫 15초 안에 관심을 끌 수 있게 구성하세요.',
      examples: '예시 주제: 서비스 소개 영상\n예시 결과: 시청 지속을 돕는 대본',
    },
  },
  {
    title: '브레인스토밍',
    category: 'creative',
    icon: 'fa-lightbulb',
    badge: '발산',
    rating: 4.4,
    uses: 178,
    description: '다양한 아이디어를 체계적으로 뽑아냅니다.',
    tags: ['아이디어', '창의', '발산'],
    mode: 'template',
    purpose: 'content',
    keyword: '아이디어 브레인스토밍',
    technique: 'context-engineering',
    starter: {
      role: '아이디어 발산을 돕는 진행자',
      context: '다양한 관점에서 접근할 아이디어가 필요합니다.',
      task: '주제를 여러 방향으로 확장해 실용적인 아이디어를 제안하세요.',
      output_format: '아이디어 목록 / 변형안 / 적용 포인트 / 추천안',
      tone: '자유롭고 발산적으로',
      constraints: '추상적인 표현보다 실행 가능한 아이디어를 우선하세요.',
      examples: '예시 주제: 신규 서비스 아이디어\n예시 결과: 바로 검토 가능한 아이디어 목록',
    },
  },
];

const TEMPLATE_MARKET_STATE = {
  category: 'all',
  selectedIndex: 0,
  query: '',
};

function getTemplateMarketItems(category = TEMPLATE_MARKET_STATE.category) {
  const query = String(TEMPLATE_MARKET_STATE.query || '').trim().toLowerCase();
  return TEMPLATE_MARKET_ITEMS.filter((item) => {
    const categoryMatch = !category || category === 'all' || item.category === category;
    if (!categoryMatch) return false;
    if (!query) return true;
    const haystack = [
      item.title,
      item.description,
      item.badge,
      item.category,
      item.mode,
      ...(item.tags || []),
      item.keyword,
      item.technique,
    ].join(' ').toLowerCase();
    return haystack.includes(query);
  });
}

function getTemplateMarketItem(index) {
  return TEMPLATE_MARKET_ITEMS[index] || null;
}

function setTemplateMarketCategory(category) {
  TEMPLATE_MARKET_STATE.category = category || 'all';
  TEMPLATE_MARKET_STATE.selectedIndex = 0;
  renderTemplateMarket();
}

function setTemplateMarketQuery(query) {
  TEMPLATE_MARKET_STATE.query = String(query || '');
  TEMPLATE_MARKET_STATE.selectedIndex = 0;
  renderTemplateMarket();
}

function previewTemplateMarketItem(index) {
  const item = getTemplateMarketItem(index);
  if (!item) return;
  TEMPLATE_MARKET_STATE.selectedIndex = index;
  renderTemplateMarketPreview(item);
}

function openTemplateMarket() {
  const modal = document.getElementById('template-market-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  renderTemplateMarket();
}

function closeTemplateMarket() {
  const modal = document.getElementById('template-market-modal');
  if (!modal) return;
  modal.classList.add('hidden');
}

function renderTemplateMarketTabs() {
  const tabs = document.getElementById('template-market-tabs');
  if (!tabs) return;
  tabs.innerHTML = TEMPLATE_MARKET_CATEGORIES.map((category) => {
    const active = TEMPLATE_MARKET_STATE.category === category.key;
    return `
      <button
        type="button"
        onclick="setTemplateMarketCategory('${category.key}')"
        class="rounded-full px-4 py-2 text-sm font-semibold transition ${
          active ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
        }"
      >
        ${escapeHtml(category.label)}
      </button>
    `;
  }).join('');
}

function renderTemplateMarketPreview(item) {
  const preview = document.getElementById('template-market-preview');
  if (!preview) return;
  const starter = item?.starter || {};
  preview.innerHTML = `
    <div class="rounded-[28px] border border-white/10 bg-white/5 p-5 text-white shadow-2xl shadow-black/20">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold text-brand-200">
            <i class="fas ${item?.icon || 'fa-store'}"></i>
            ${escapeHtml(item?.badge || '템플릿')}
          </div>
          <h4 class="mt-3 text-2xl font-black tracking-tight text-white">${escapeHtml(item?.title || '템플릿')}</h4>
          <p class="mt-2 text-sm leading-6 text-slate-300">${escapeHtml(item?.description || '')}</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-right">
          <div class="text-xs text-slate-400">평점</div>
          <div class="text-lg font-black text-white">${Number(getTemplateMarketUsage(item) || 0).toLocaleString('ko-KR')}회</div>
          <div class="text-[11px] text-slate-500">누적 적용 기준</div>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        ${(item?.tags || []).map((tag) => `<span class="rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-semibold text-slate-300">${escapeHtml(tag)}</span>`).join('')}
      </div>

      <div class="mt-5 space-y-3">
        <div class="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
          <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">기본 구조</div>
          <pre class="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-200">${escapeHtml([
            `role: ${starter.role || item?.title || ''}`,
            `context: ${starter.context || item?.description || ''}`,
            `task: ${starter.task || item?.keyword || ''}`,
            `output_format: ${starter.output_format || '구조화된 결과'}`,
            `tone: ${starter.tone || '명확하게'}`,
            `constraints: ${starter.constraints || '불필요한 설명을 줄이세요.'}`,
          ].join('\n'))}</pre>
        </div>
        <div class="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
          <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">적용 예시</div>
          <pre class="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-200">${escapeHtml(starter.examples || `예시 주제: ${item?.title || ''}`)}</pre>
        </div>
      </div>

      <div class="mt-5 flex gap-2">
        <button type="button" onclick="applyTemplateMarketItem(${TEMPLATE_MARKET_STATE.selectedIndex})" class="flex-1 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-500">
          바로 적용
        </button>
        <button type="button" onclick="switchMode('${item?.mode === 'builder' ? 'builder' : 'template'}')" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10">
          모드 이동
        </button>
      </div>
    </div>
  `;
}

function renderTemplateMarket() {
  renderTemplateMarketTabs();
  const grid = document.getElementById('template-market-grid');
  const countLabel = document.getElementById('template-market-count-label');
  if (!grid) return;

  const items = getTemplateMarketItems();
  if (countLabel) {
    countLabel.textContent = `${items.length.toLocaleString('ko-KR')}개의 템플릿`;
  }
  if (!items.length) {
    grid.innerHTML = `
      <div class="rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-10 text-center text-slate-400 md:col-span-2 xl:col-span-3">
        선택한 카테고리에 해당하는 템플릿이 없습니다.
      </div>
    `;
    renderTemplateMarketPreview(null);
    return;
  }

  const selectedItem = items.find((item) => TEMPLATE_MARKET_ITEMS.indexOf(item) === TEMPLATE_MARKET_STATE.selectedIndex) || items[0];
  const selectedGlobalIndex = TEMPLATE_MARKET_ITEMS.indexOf(selectedItem);
  TEMPLATE_MARKET_STATE.selectedIndex = selectedGlobalIndex >= 0 ? selectedGlobalIndex : 0;
  renderTemplateMarketPreview(selectedItem);

  grid.innerHTML = items.map((item) => {
    const globalIndex = TEMPLATE_MARKET_ITEMS.indexOf(item);
    const active = globalIndex === TEMPLATE_MARKET_STATE.selectedIndex;
    return `
      <button
        type="button"
        onclick="previewTemplateMarketItem(${globalIndex})"
        class="rounded-[28px] border p-4 text-left transition ${active ? 'border-brand-400 bg-brand-500/10 shadow-lg shadow-brand-500/10' : 'border-white/10 bg-white/5 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10'}"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl ${item.category === 'developer' ? 'bg-indigo-500/20 text-indigo-300' : item.category === 'analysis' ? 'bg-cyan-500/20 text-cyan-300' : item.category === 'creative' ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-brand-500/20 text-brand-200'}">
              <i class="fas ${item.icon}"></i>
            </div>
            <div>
              <div class="text-sm font-bold text-white">${escapeHtml(item.title)}</div>
              <div class="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                <span>${Number(getTemplateMarketUsage(item) || 0).toLocaleString('ko-KR')}회</span>
              </div>
            </div>
          </div>
          <span class="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold text-slate-200">${escapeHtml(item.badge || '템플릿')}</span>
        </div>
        <p class="mt-3 min-h-[40px] text-xs leading-5 text-slate-300">${escapeHtml(item.description || '')}</p>
        <div class="mt-4 flex flex-wrap gap-1.5">
          ${(item.tags || []).slice(0, 3).map((tag) => `<span class="rounded-full bg-slate-900/80 px-2 py-1 text-[10px] text-slate-400">${escapeHtml(tag)}</span>`).join('')}
        </div>
        <div class="mt-4 flex items-center justify-between gap-2">
          <span class="text-[11px] font-medium text-brand-200">클릭하면 미리보기</span>
          <span class="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white">적용 가능</span>
        </div>
      </button>
    `;
  }).join('');
}

async function applyTemplateMarketItem(index) {
  const item = getTemplateMarketItem(index);
  if (!item) return;

  closeTemplateMarket();
  switchMode(item.mode === 'builder' ? 'builder' : 'template');

  if (typeof selectPurpose === 'function') {
    selectPurpose(item.purpose);
  } else {
    state.purpose = item.purpose;
    const keywordSection = document.getElementById('keyword-section');
    if (keywordSection) keywordSection.classList.remove('hidden');
  }

  const keywordInput = document.getElementById('keyword-input');
  if (keywordInput) keywordInput.value = item.keyword || '';
  const smartInput = document.getElementById('smart-input-field');
  if (smartInput) smartInput.value = item.keyword || item.title || '';

  if (typeof selectTechniqueManual === 'function' && item.technique) {
    await selectTechniqueManual(item.technique);
  }

  if (typeof state !== 'undefined') {
    state.keyword = item.keyword || '';
    state.techniqueId = item.technique || '';
  }

  window.setTimeout(() => {
    const starter = item.starter || {};
    const fallback = {
      context: item.description || '',
      task: item.keyword ? `"${item.keyword}"에 맞는 프롬프트 초안을 작성하세요.` : '',
      output_format: '구조화된 결과',
      tone: '명확하고 간결하게',
    };
    const fields = { ...fallback, ...starter };
    Object.entries(fields).forEach(([fieldId, value]) => {
      if (value) setFieldValue(fieldId, value);
    });
    if (item.keyword) {
      setFieldValue('examples', starter.examples || `예시 주제: ${item.keyword}\n예시 결과: ${item.title} 초안`);
    }
  }, 350);

  window.setTimeout(() => {
    if (typeof analyzeIntent === 'function' && smartInput?.value) {
      analyzeIntent();
    }
  }, 120);

  const firstField = document.querySelector('.field-input');
  if (firstField) firstField.focus();
}

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
  const smartInput = document.getElementById('smart-input-field');
  if (smartInput) smartInput.value = item.keyword || item.title || '';

  if (typeof selectTechniqueManual === 'function') {
    await selectTechniqueManual(item.technique);
  }

  if (typeof state !== 'undefined') {
    state.keyword = item.keyword;
    state.techniqueId = item.technique;
  }

  applyStarterPreset(item);

  if (typeof analyzeIntent === 'function' && smartInput?.value) {
    window.setTimeout(() => analyzeIntent(), 120);
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
  const smartInput = document.getElementById('smart-input-field');
  if (smartInput) smartInput.value = item.keyword || item.title || '';

  if (typeof state !== 'undefined') {
    state.keyword = item.keyword;
    state.techniqueId = item.technique;
  }

  if (typeof selectTechniqueManual === 'function') {
    await selectTechniqueManual(item.technique);
  }

  applyStarterPreset(item);

  if (typeof analyzeIntent === 'function' && smartInput?.value) {
    window.setTimeout(() => analyzeIntent(), 120);
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

function renderTemplateMarketPreview(item) {
  const preview = document.getElementById('template-market-preview');
  if (!preview) return;
  const starter = getTemplateMarketFields(item);
  preview.innerHTML = `
    <div class="rounded-[28px] border border-white/10 bg-white/5 p-5 text-white shadow-2xl shadow-black/20">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold text-brand-200">
            <i class="fas ${item?.icon || 'fa-store'}"></i>
            ${escapeHtml(item?.badge || '템플릿')}
          </div>
          <h4 class="mt-3 text-2xl font-black tracking-tight text-white">${escapeHtml(item?.title || '템플릿')}</h4>
          <p class="mt-2 text-sm leading-6 text-slate-300">${escapeHtml(item?.description || '')}</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-right">
          <div class="text-xs text-slate-400">사용 횟수</div>
          <div class="text-lg font-black text-white">${Number(getTemplateMarketUsage(item) || 0).toLocaleString('ko-KR')}회</div>
          <div class="text-[11px] text-slate-500">누적 적용 기준</div>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        ${(item?.tags || []).map((tag) => `<span class="rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-semibold text-slate-300">${escapeHtml(tag)}</span>`).join('')}
      </div>

      <div class="mt-5 space-y-3">
        <div class="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
          <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">기본 구조</div>
          <pre class="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-200">${escapeHtml([
            `role: ${starter.role || item?.title || ''}`,
            `role_detail: ${starter.role_detail || '실무형 전문가'}`,
            `context: ${starter.context || item?.description || ''}`,
            `task: ${starter.task || item?.keyword || ''}`,
            `output_format: ${starter.output_format || '구조화된 결과'}`,
            `tone: ${starter.tone || '명확하고 간결하게'}`,
            `constraints: ${starter.constraints || '핵심 정보와 출력 형식을 분명하게 유지하세요.'}`,
          ].join('\n'))}</pre>
        </div>
        <div class="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
          <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">적용 예시</div>
          <pre class="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-200">${escapeHtml(starter.examples || `입력: ${item?.title || ''}\n출력: 완성형 초안`)}</pre>
        </div>
      </div>

      <div class="mt-5 flex gap-2">
        <button type="button" onclick="applyTemplateMarketItem(${TEMPLATE_MARKET_STATE.selectedIndex})" class="flex-1 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-500">
          바로 적용
        </button>
        <button type="button" onclick="switchMode('${item?.mode === 'builder' ? 'builder' : 'template'}')" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10">
          모드 이동
        </button>
      </div>
    </div>
  `;
}

function renderTemplateMarket() {
  renderTemplateMarketTabs();
  const grid = document.getElementById('template-market-grid');
  const countLabel = document.getElementById('template-market-count-label');
  if (!grid) return;

  const items = getTemplateMarketItems();
  if (countLabel) {
    countLabel.textContent = `${items.length.toLocaleString('ko-KR')}개의 템플릿`;
  }
  if (!items.length) {
    grid.innerHTML = `
      <div class="rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-10 text-center text-slate-400 md:col-span-2 xl:col-span-3">
        선택한 조건에 해당하는 템플릿이 없습니다.
      </div>
    `;
    renderTemplateMarketPreview(null);
    return;
  }

  const selectedItem = items.find((item) => TEMPLATE_MARKET_ITEMS.indexOf(item) === TEMPLATE_MARKET_STATE.selectedIndex) || items[0];
  const selectedGlobalIndex = TEMPLATE_MARKET_ITEMS.indexOf(selectedItem);
  TEMPLATE_MARKET_STATE.selectedIndex = selectedGlobalIndex >= 0 ? selectedGlobalIndex : 0;
  renderTemplateMarketPreview(selectedItem);

  grid.innerHTML = items.map((item) => {
    const globalIndex = TEMPLATE_MARKET_ITEMS.indexOf(item);
    const active = globalIndex === TEMPLATE_MARKET_STATE.selectedIndex;
    return `
      <button
        type="button"
        onclick="previewTemplateMarketItem(${globalIndex})"
        class="rounded-[28px] border p-4 text-left transition ${active ? 'border-brand-400 bg-brand-500/10 shadow-lg shadow-brand-500/10' : 'border-white/10 bg-white/5 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10'}"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl ${item.category === 'developer' ? 'bg-indigo-500/20 text-indigo-300' : item.category === 'analysis' ? 'bg-cyan-500/20 text-cyan-300' : item.category === 'creative' ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-brand-500/20 text-brand-200'}">
              <i class="fas ${item.icon}"></i>
            </div>
            <div>
              <div class="text-sm font-bold text-white">${escapeHtml(item.title)}</div>
              <div class="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                <span>${Number(getTemplateMarketUsage(item) || 0).toLocaleString('ko-KR')}회</span>
              </div>
            </div>
          </div>
          <span class="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold text-slate-200">${escapeHtml(item.badge || '템플릿')}</span>
        </div>
        <p class="mt-3 min-h-[40px] text-xs leading-5 text-slate-300">${escapeHtml(item.description || '')}</p>
        <div class="mt-4 flex flex-wrap gap-1.5">
          ${(item.tags || []).slice(0, 3).map((tag) => `<span class="rounded-full bg-slate-900/80 px-2 py-1 text-[10px] text-slate-400">${escapeHtml(tag)}</span>`).join('')}
        </div>
        <div class="mt-4 flex items-center justify-between gap-2">
          <span class="text-[11px] font-medium text-brand-200">클릭하면 미리보기</span>
          <span class="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white">적용 가능</span>
        </div>
      </button>
    `;
  }).join('');
}

async function applyTemplateMarketItem(index) {
  const item = getTemplateMarketItem(index);
  if (!item) return;

  incrementTemplateMarketUsage(item);
  closeTemplateMarket();
  switchMode(item.mode === 'builder' ? 'builder' : 'template');

  if (typeof selectPurpose === 'function') {
    selectPurpose(item.purpose);
  } else {
    state.purpose = item.purpose;
    const keywordSection = document.getElementById('keyword-section');
    if (keywordSection) keywordSection.classList.remove('hidden');
  }

  const keywordInput = document.getElementById('keyword-input');
  if (keywordInput) keywordInput.value = item.keyword || '';

  if (typeof selectTechniqueManual === 'function' && item.technique) {
    await selectTechniqueManual(item.technique);
  }

  if (typeof state !== 'undefined') {
    state.keyword = item.keyword || '';
    state.techniqueId = item.technique || '';
  }

  window.setTimeout(() => {
    const fields = getTemplateMarketFields(item);
    Object.entries(fields).forEach(([fieldId, value]) => {
      if (value) setFieldValue(fieldId, value);
    });
    if (item.keyword) {
      setFieldValue('examples', fields.examples || `입력: ${item.keyword}\n출력: ${item.title} 완성형 초안`);
    }
  }, 350);

  const firstField = document.querySelector('.field-input');
  if (firstField) firstField.focus();
}

function getTemplateMarketBadge(item) {
  const usage = Number(getTemplateMarketUsage(item) || 0);
  if (usage >= 300) return '인기';
  if (usage >= 180) return '추천';
  if (usage < 100) return '신규';
  return '템플릿';
}

function renderTemplateMarketPreview(item) {
  const preview = document.getElementById('template-market-preview');
  if (!preview) return;
  const fields = getTemplateMarketFields(item);
  preview.innerHTML = `
    <div class="rounded-[28px] border border-white/10 bg-white/5 p-5 text-white shadow-2xl shadow-black/20">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold text-brand-200">
            <i class="fas ${item?.icon || 'fa-store'}"></i>
            ${escapeHtml(getTemplateMarketBadge(item))}
          </div>
          <h4 class="mt-3 text-2xl font-black tracking-tight text-white">${escapeHtml(item?.title || '템플릿')}</h4>
          <p class="mt-2 text-sm leading-6 text-slate-300">${escapeHtml(item?.description || '')}</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-right">
          <div class="text-xs text-slate-400">사용 횟수</div>
          <div class="text-lg font-black text-white">${Number(getTemplateMarketUsage(item) || 0).toLocaleString('ko-KR')}회</div>
          <div class="text-[11px] text-slate-500">누적 적용 기준</div>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        ${(item?.tags || []).map((tag) => `<span class="rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-semibold text-slate-300">${escapeHtml(tag)}</span>`).join('')}
      </div>

      <div class="mt-5 space-y-3">
        <div class="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
          <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">기본 구조</div>
          <pre class="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-200">${escapeHtml([
            `role: ${fields.role || item?.title || ''}`,
            `role_detail: ${fields.role_detail || '실무형 전문가'}`,
            `context: ${fields.context || item?.description || ''}`,
            `task: ${fields.task || item?.keyword || ''}`,
            `output_format: ${fields.output_format || '구조화된 결과'}`,
            `tone: ${fields.tone || '명확하고 간결하게'}`,
            `constraints: ${fields.constraints || '핵심 정보와 출력 형식을 분명하게 유지하세요.'}`,
          ].join('\n'))}</pre>
        </div>
        <div class="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
          <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">적용 예시</div>
          <pre class="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-200">${escapeHtml(fields.examples || `입력: ${item?.title || ''}\n출력: 완성형 초안`)}</pre>
        </div>
      </div>

      <div class="mt-5 flex gap-2">
        <button type="button" onclick="applyTemplateMarketItem(${TEMPLATE_MARKET_STATE.selectedIndex})" class="flex-1 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-500">
          바로 적용
        </button>
        <button type="button" onclick="switchMode('${item?.mode === 'builder' ? 'builder' : 'template'}')" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10">
          모드 이동
        </button>
      </div>
    </div>
  `;
}

function renderTemplateMarket() {
  renderTemplateMarketTabs();
  const grid = document.getElementById('template-market-grid');
  const countLabel = document.getElementById('template-market-count-label');
  if (!grid) return;

  const items = getTemplateMarketItems().slice().sort((a, b) => getTemplateMarketUsage(b) - getTemplateMarketUsage(a));
  if (countLabel) {
    countLabel.textContent = `${items.length.toLocaleString('ko-KR')}개의 템플릿`;
  }
  if (!items.length) {
    grid.innerHTML = `
      <div class="rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-10 text-center text-slate-400 md:col-span-2 xl:col-span-3">
        선택한 조건에 해당하는 템플릿이 없습니다.
      </div>
    `;
    renderTemplateMarketPreview(null);
    return;
  }

  const selectedItem = items.find((item) => TEMPLATE_MARKET_ITEMS.indexOf(item) === TEMPLATE_MARKET_STATE.selectedIndex) || items[0];
  const selectedGlobalIndex = TEMPLATE_MARKET_ITEMS.indexOf(selectedItem);
  TEMPLATE_MARKET_STATE.selectedIndex = selectedGlobalIndex >= 0 ? selectedGlobalIndex : 0;
  renderTemplateMarketPreview(selectedItem);

  grid.innerHTML = items.map((item) => {
    const globalIndex = TEMPLATE_MARKET_ITEMS.indexOf(item);
    const active = globalIndex === TEMPLATE_MARKET_STATE.selectedIndex;
    const badge = getTemplateMarketBadge(item);
    return `
      <button
        type="button"
        onclick="previewTemplateMarketItem(${globalIndex})"
        class="rounded-[28px] border p-4 text-left transition ${active ? 'border-brand-400 bg-brand-500/10 shadow-lg shadow-brand-500/10' : 'border-white/10 bg-white/5 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10'}"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl ${item.category === 'developer' ? 'bg-indigo-500/20 text-indigo-300' : item.category === 'analysis' ? 'bg-cyan-500/20 text-cyan-300' : item.category === 'creative' ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-brand-500/20 text-brand-200'}">
              <i class="fas ${item.icon}"></i>
            </div>
            <div>
              <div class="text-sm font-bold text-white">${escapeHtml(item.title)}</div>
              <div class="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                <span>${Number(getTemplateMarketUsage(item) || 0).toLocaleString('ko-KR')}회</span>
              </div>
            </div>
          </div>
          <span class="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold text-slate-200">${escapeHtml(badge)}</span>
        </div>
        <p class="mt-3 min-h-[40px] text-xs leading-5 text-slate-300">${escapeHtml(item.description || '')}</p>
        <div class="mt-4 flex flex-wrap gap-1.5">
          ${(item.tags || []).slice(0, 3).map((tag) => `<span class="rounded-full bg-slate-900/80 px-2 py-1 text-[10px] text-slate-400">${escapeHtml(tag)}</span>`).join('')}
        </div>
        <div class="mt-4 flex items-center justify-between gap-2">
          <span class="text-[11px] font-medium text-brand-200">클릭하면 미리보기</span>
          <span class="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white">적용 가능</span>
        </div>
      </button>
    `;
  }).join('');
}

async function applyTemplateMarketItem(index) {
  const item = getTemplateMarketItem(index);
  if (!item) return;

  incrementTemplateMarketUsage(item);
  closeTemplateMarket();
  switchMode(item.mode === 'builder' ? 'builder' : 'template');

  if (typeof selectPurpose === 'function') {
    selectPurpose(item.purpose);
  } else {
    state.purpose = item.purpose;
    const keywordSection = document.getElementById('keyword-section');
    if (keywordSection) keywordSection.classList.remove('hidden');
  }

  const keywordInput = document.getElementById('keyword-input');
  if (keywordInput) keywordInput.value = item.keyword || '';

  if (typeof selectTechniqueManual === 'function' && item.technique) {
    await selectTechniqueManual(item.technique);
  }

  if (typeof state !== 'undefined') {
    state.keyword = item.keyword || '';
    state.techniqueId = item.technique || '';
  }

  window.setTimeout(() => {
    const fields = getTemplateMarketFields(item);
    Object.entries(fields).forEach(([fieldId, value]) => {
      if (value) setFieldValue(fieldId, value);
    });
    if (item.keyword) {
      setFieldValue('examples', fields.examples || `입력: ${item.keyword}\n출력: ${item.title} 완성형 초안`);
    }
  }, 350);

  const firstField = document.querySelector('.field-input');
  if (firstField) firstField.focus();
}

function getTemplateMarketFields(item) {
  const title = String(item?.title || '').trim();
  const keyword = String(item?.keyword || title || '').trim();
  const category = String(item?.category || '').trim();
  const tags = Array.isArray(item?.tags) ? item.tags.slice(0, 3).join(', ') : '';
  const common = {
    role: `당신은 ${title || '선택한 템플릿'}을 전문적으로 다루는 실무 전문가입니다.`,
    role_detail: category === 'developer'
      ? '개발 실무에 익숙한 시니어 엔지니어'
      : category === 'analysis'
        ? '논리적 해석과 실행 계획 도출에 강한 분석가'
        : category === 'creative'
          ? '몰입도와 전달력을 높이는 콘텐츠 전문가'
          : '업무 문서를 빠르고 정확하게 정리하는 전문가',
    context: `${title || '선택한 템플릿'} 작업에 필요한 배경을 먼저 정리하고, 누가 무엇을 왜 원하는지 분명하게 드러내야 합니다.`,
    task: keyword
      ? `"${keyword}"에 맞는 완성형 프롬프트 초안을 작성하세요.`
      : '선택한 템플릿에 맞는 완성형 프롬프트 초안을 작성하세요.',
    output_format: 'role / context / task / output_format / tone / constraints / examples',
    tone: category === 'developer'
      ? '정확하고 명세 중심으로'
      : category === 'analysis'
        ? '명확하고 논리적으로'
        : category === 'creative'
          ? '자연스럽고 몰입감 있게'
          : '정중하고 간결하게',
    constraints: '핵심 정보, 출력 형식, 제약 조건, 예시가 서로 겹치지 않도록 분리해서 작성하세요.',
    examples: `입력: ${keyword || title}\n출력: ${title || '템플릿'} 완성형 초안`,
  };

  const packs = {
    '업무 이메일': {
      role_detail: '비즈니스 이메일과 커뮤니케이션에 익숙한 실무형 라이터',
      context: '상대방이 빠르게 이해하고 바로 대응할 수 있도록, 상황과 요청을 분명하게 정리해야 합니다.',
      task: '요청, 회신, 안내, 일정 조율 중 현재 상황에 맞는 업무 이메일 초안을 작성하세요.',
      output_format: '제목 / 인사말 / 본문 / 요청사항 / 마무리 문구',
      tone: '정중하고 간결하게',
      constraints: '불필요한 수식어를 줄이고, 상대가 읽고 바로 행동할 수 있게 핵심만 남기세요.',
      examples: '입력: 일정 변경 요청\n출력: 정중한 일정 조율 메일 초안',
    },
    '주간 보고서': {
      role_detail: '핵심 지표와 결과를 관리하는 업무 보고 전문가',
      context: '이번 주 성과와 이슈를 상위 보고용 문서로 바꿔야 합니다.',
      task: '성과, 이슈, 개선안, 다음 주 계획이 한눈에 보이도록 주간 보고서를 작성하세요.',
      output_format: '개요 / 핵심 성과 / 이슈 / 개선안 / 다음 주 계획',
      tone: '업무적으로 명확하게',
      constraints: '숫자는 사실 중심으로 쓰고, 해석은 짧고 분명하게 정리하세요.',
      examples: '입력: 서비스 운영 주간 결과\n출력: 핵심 지표와 개선안이 분명한 보고서',
    },
    '회의록 정리': {
      role_detail: '논의를 결정 사항 중심으로 재구성하는 회의록 정리 전문가',
      context: '회의 메모를 실무에서 바로 쓸 수 있는 문서로 바꿔야 합니다.',
      task: '회의 내용에서 결정 사항, 논의 사항, 후속 조치, 담당자를 분리해 정리하세요.',
      output_format: '결정 사항 / 논의 사항 / 후속 조치 / 담당자 / 마감 일정',
      tone: '차분하고 명확하게',
      constraints: '추측은 줄이고 기록된 사실만 우선 정리하세요. 결정되지 않은 항목은 별도로 표시하세요.',
      examples: '입력: 팀 주간 회의 메모\n출력: 실행 항목이 분명한 회의록',
    },
    '자기소개서': {
      role_detail: '경험과 강점을 기업 관점에서 연결하는 커리어 라이터',
      context: '지원자의 경험을 읽는 사람이 빠르게 이해하도록 구조를 잡아야 합니다.',
      task: '경험, 강점, 지원 동기를 자연스럽게 연결해 자기소개서 초안을 작성하세요.',
      output_format: '성장 배경 / 핵심 경험 / 강점 / 지원 동기 / 마무리',
      tone: '진정성 있고 자신감 있게',
      constraints: '과장 없이 구체적 사례 중심으로 작성하고, 문단마다 역할이 겹치지 않게 하세요.',
      examples: '입력: 신입 지원서용 자기소개\n출력: 핵심 경험이 드러나는 자소서 초안',
    },
    '코드 리뷰': {
      role_detail: '문제 탐지, 영향도 판단, 우선순위 정리에 익숙한 시니어 코드 리뷰어',
      context: 'PR 코드를 검토하고 문제를 빠르게 찾아야 합니다.',
      task: '문제, 원인, 영향, 수정 제안을 기준으로 코드 리뷰를 작성하세요.',
      output_format: '문제 / 영향 / 수정 제안 / 우선순위 / 확인 질문',
      tone: '명확하고 업무적으로',
      constraints: '정확한 지적에 집중하고 추측성 표현은 줄이세요. 가능하면 테스트 또는 재현 방법도 포함하세요.',
      examples: '입력: PR 리뷰 요청\n출력: 리스크와 수정 제안이 명확한 리뷰',
    },
    '기획 문서': {
      role_detail: '목표, 사용자, 기능을 산출물로 정리하는 서비스 기획자',
      context: '새 기능의 구조를 빠르게 정리해야 합니다.',
      task: '목표, 사용자, 핵심 기능, 데이터 흐름, 일정이 연결된 기획 문서를 작성하세요.',
      output_format: '문제 정의 / 사용자 / 핵심 기능 / 데이터 흐름 / 일정 / 리스크',
      tone: '체계적이고 설득력 있게',
      constraints: '기능은 실현 가능성을 기준으로 우선순위를 나누고, 범위 밖 항목은 명확히 제외하세요.',
      examples: '입력: 관리자 대시보드 기획\n출력: 핵심 기능과 일정이 정리된 기획 문서',
    },
    '블로그 글': {
      role_detail: '검색 유입과 가독성을 함께 고려하는 콘텐츠 라이터',
      context: '검색과 전환을 함께 고려한 글이 필요합니다.',
      task: '주제를 구조화해 읽기 쉬운 블로그 초안을 작성하세요.',
      output_format: '제목 / 도입 / 소제목 / 본문 / 요약 / CTA',
      tone: '자연스럽고 친근하게',
      constraints: '초반에 관심을 끌고, 본문은 한 번에 이해되도록 짧은 문장으로 구성하세요.',
      examples: '입력: 서비스 소개 글\n출력: 검색과 전환을 모두 고려한 블로그 초안',
    },
    '마케팅 카피': {
      role_detail: '문제 제시와 행동 유도를 짧고 강하게 전달하는 퍼포먼스 카피 전문가',
      context: '광고나 랜딩페이지에서 바로 적용 가능한 문구가 필요합니다.',
      task: '문제 제시, 해결 제안, 행동 유도로 이어지는 카피를 작성하세요.',
      output_format: '헤드라인 / 서브헤드 / 혜택 / CTA',
      tone: '짧고 강하게',
      constraints: '문장은 짧게, 메시지는 분명하게 유지하세요. 한 문단에 하나의 핵심만 담으세요.',
      examples: '입력: 신제품 광고\n출력: 클릭과 전환을 유도하는 카피',
    },
    'API 설계': {
      role_detail: '리소스 경계와 계약을 명확히 정의하는 백엔드 아키텍트',
      context: '새 기능의 API 계약을 먼저 잡아야 합니다.',
      task: '요청, 응답, 에러, 권한을 고려한 REST API 설계를 작성하세요.',
      output_format: '엔드포인트 / 요청 / 응답 / 에러 / 보안 고려사항',
      tone: '정확하고 명세 중심으로',
      constraints: '리소스 기준으로 나누고, 각 엔드포인트의 책임이 겹치지 않게 하세요.',
      examples: '입력: 회원 API 설계 요청\n출력: 명세가 분명한 REST API 설계',
    },
    '데이터 분석': {
      role_detail: '지표 정의와 해석을 구분해서 설명하는 데이터 분석가',
      context: '분석 목표를 먼저 분명히 해야 합니다.',
      task: '목표, 지표, 분석 방법, 해석 관점을 포함한 분석 브리프를 작성하세요.',
      output_format: '분석 목표 / 지표 / 방법 / 해석 / 다음 액션',
      tone: '명확하고 논리적으로',
      constraints: '사실과 해석을 분리하고, 실행 가능한 다음 액션이 보이도록 작성하세요.',
      examples: '입력: 전환율 하락 분석\n출력: 원인과 대응이 보이는 분석 브리프',
    },
    '유튜브 대본': {
      role_detail: '초반 이탈을 줄이고 몰입을 유지하는 영상 대본 작가',
      context: '초반 이탈을 줄이는 구성이 중요합니다.',
      task: '도입, 전개, 예시, 마무리까지 이어지는 유튜브 대본을 작성하세요.',
      output_format: '오프닝 / 본문 / 전환 / 클로징 / CTA',
      tone: '자연스럽고 몰입감 있게',
      constraints: '첫 15초 안에 관심을 끌고, 장면 전환이 자연스럽게 느껴지도록 구성하세요.',
      examples: '입력: 서비스 소개 영상\n출력: 시청 지속을 돕는 유튜브 대본',
    },
    '브레인스토밍': {
      role_detail: '다양한 방향을 빠르게 뽑고 실용적인 안을 추리는 아이디어 파실리테이터',
      context: '다양한 관점에서 접근할 아이디어가 필요합니다.',
      task: '주제를 여러 방향으로 확장해 실용적인 아이디어를 제안하세요.',
      output_format: '아이디어 목록 / 변형안 / 적용 포인트 / 추천안',
      tone: '자유롭고 발산적으로',
      constraints: '추상적인 표현보다 실행 가능한 아이디어를 우선하고, 각 아이디어의 활용 이유를 짧게 붙이세요.',
      examples: '입력: 신규 서비스 아이디어\n출력: 바로 검토 가능한 아이디어 목록',
    },
  };

  return { ...common, ...(packs[title] || {}), ...item?.starter };
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
window.openTemplateMarket = openTemplateMarket;
window.closeTemplateMarket = closeTemplateMarket;
window.setTemplateMarketCategory = setTemplateMarketCategory;
window.setTemplateMarketQuery = setTemplateMarketQuery;
window.previewTemplateMarketItem = previewTemplateMarketItem;
window.applyTemplateMarketItem = applyTemplateMarketItem;
