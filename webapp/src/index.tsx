import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'

const app = new Hono()

app.use(renderer)
app.use('/api/*', cors())

// ===== 프롬프트 엔지니어링 기법 데이터 =====
const TECHNIQUES: Record<string, any> = {
  'zero-shot': {
    id: 'zero-shot', name: '제로샷 프롬프트', nameEn: 'Zero-shot Prompting',
    icon: 'fa-bolt', color: 'blue', difficulty: '초급', category: 'prompt',
    description: '예시 없이 직접 요청만 전달합니다. 간단한 작업에 적합합니다.',
    fields: ['role', 'task', 'output_format', 'constraints'],
  },
  'few-shot': {
    id: 'few-shot', name: '퓨샷 프롬프트', nameEn: 'Few-shot Prompting',
    icon: 'fa-list-ol', color: 'green', difficulty: '초급', category: 'prompt',
    description: '2~5개의 예시를 제공하여 AI가 패턴을 학습하도록 합니다.',
    fields: ['role', 'task', 'examples', 'actual_input', 'output_format', 'constraints'],
  },
  'chain-of-thought': {
    id: 'chain-of-thought', name: '사고 연쇄 (CoT)', nameEn: 'Chain-of-Thought',
    icon: 'fa-link', color: 'purple', difficulty: '중급', category: 'prompt',
    description: 'AI가 단계별로 논리적 사고 과정을 거쳐 답변하도록 유도합니다.',
    fields: ['role', 'task', 'steps', 'output_format', 'constraints'],
  },
  'tree-of-thought': {
    id: 'tree-of-thought', name: '사고 트리 (ToT)', nameEn: 'Tree of Thought',
    icon: 'fa-sitemap', color: 'orange', difficulty: '고급', category: 'prompt',
    description: '여러 해결 경로를 동시에 탐색하고 최적의 답을 선택합니다.',
    fields: ['role', 'task', 'approaches', 'output_format', 'constraints'],
  },
  'role-prompting': {
    id: 'role-prompting', name: '역할 프롬프트', nameEn: 'Role Prompting',
    icon: 'fa-user-tie', color: 'red', difficulty: '초급', category: 'prompt',
    description: 'AI에게 특정 전문가 역할을 부여하여 전문적인 답변을 유도합니다.',
    fields: ['role_detail', 'expertise', 'task', 'tone', 'output_format', 'constraints'],
  },
  'prompt-chaining': {
    id: 'prompt-chaining', name: '프롬프트 체이닝', nameEn: 'Prompt Chaining',
    icon: 'fa-chain', color: 'teal', difficulty: '중급', category: 'prompt',
    description: '복잡한 작업을 단계별 프롬프트로 나누어 순차적으로 처리합니다.',
    fields: ['task', 'chain_steps', 'output_format', 'constraints'],
  },
  'meta-prompting': {
    id: 'meta-prompting', name: '메타 프롬프팅', nameEn: 'Meta Prompting',
    icon: 'fa-brain', color: 'pink', difficulty: '고급', category: 'prompt',
    description: 'AI에게 프롬프트 자체를 개선하거나 최적화하도록 요청합니다.',
    fields: ['original_prompt', 'improvement_goal', 'constraints'],
  },
  'context-engineering': {
    id: 'context-engineering', name: '컨텍스트 엔지니어링', nameEn: 'Context Engineering',
    icon: 'fa-layer-group', color: 'cyan', difficulty: '고급', category: 'context',
    description: '프로젝트 전체의 맥락 문서를 체계적으로 설계합니다. 시스템 프롬프트, 프로젝트 스펙, 기술 요구사항을 종합합니다.',
    fields: ['project_name', 'project_goal', 'target_user', 'tech_stack', 'core_features', 'data_model', 'constraints', 'tone'],
  },
  'harness': {
    id: 'harness', name: '하네스 엔지니어링', nameEn: 'Harness Engineering',
    icon: 'fa-gears', color: 'indigo', difficulty: '고급', category: 'harness',
    description: '역할+컨텍스트+작업+형식+제약조건을 체계적으로 결합하는 종합 기법입니다.',
    fields: ['role', 'context', 'task', 'input_data', 'output_format', 'tone', 'constraints', 'example'],
  },
};

// ===== 필드 정의 =====
const FIELD_DEFINITIONS: Record<string, any> = {
  role: { label: '역할 (Role)', placeholder: '예: 당신은 10년 경력의 시니어 풀스택 개발자입니다.', type: 'text', required: true },
  role_detail: { label: '세부 역할', placeholder: '예: 15년 경력의 UX/UI 디자인 전문가이자 사용자 심리학 연구자', type: 'text', required: true },
  expertise: { label: '전문 분야', placeholder: '예: 모바일 앱 디자인, 사용자 리서치, A/B 테스트 전문', type: 'text', required: false },
  context: { label: '배경 컨텍스트', placeholder: '예: B2B SaaS 스타트업에서 MVP를 개발 중이며, 사용자는 중소기업 경영자입니다.', type: 'textarea', required: false },
  task: { label: '작업 목표', placeholder: '예: React와 TypeScript를 사용한 대시보드 컴포넌트를 설계해주세요.', type: 'textarea', required: true },
  input_data: { label: '입력 데이터', placeholder: '예: 사용자 데이터 JSON, 기존 코드 스니펫, 참고 문서 등', type: 'textarea', required: false },
  output_format: { label: '출력 형식', placeholder: '예: 마크다운 표, 코드 블록, 단계별 가이드, JSON 등', type: 'text', required: false },
  tone: { label: '톤 & 스타일', placeholder: '예: 전문적이고 간결한 / 친근하고 쉬운 / 교육적인', type: 'text', required: false },
  constraints: { label: '제약 조건', placeholder: '예: 500단어 이내, 한국어로 작성, 초보자도 이해 가능하게', type: 'textarea', required: false },
  examples: { label: '예시 (2~5개)', placeholder: '입력: 사과 → 출력: 과일\n입력: 강아지 → 출력: 동물', type: 'textarea', required: true },
  actual_input: { label: '실제 입력', placeholder: '예시 패턴을 따라 처리할 실제 입력값', type: 'textarea', required: true },
  steps: { label: '사고 단계', placeholder: '1단계: 문제 분석\n2단계: 해결 방안 도출\n3단계: 최적 솔루션 선택', type: 'textarea', required: false },
  approaches: { label: '탐색할 접근법들', placeholder: '접근법 A: 성능 최적화 관점\n접근법 B: 사용자 경험 관점\n접근법 C: 비용 효율 관점', type: 'textarea', required: false },
  chain_steps: { label: '체인 단계들', placeholder: 'Step 1: 요구사항 분석\nStep 2: 아키텍처 설계\nStep 3: 구현 계획 수립', type: 'textarea', required: true },
  original_prompt: { label: '개선할 원본 프롬프트', placeholder: '개선하고 싶은 기존 프롬프트를 입력하세요', type: 'textarea', required: true },
  improvement_goal: { label: '개선 목표', placeholder: '예: 더 구체적인 코드 예시를 포함하도록', type: 'textarea', required: true },
  example: { label: '참고 예시', placeholder: '원하는 출력의 예시를 입력하세요', type: 'textarea', required: false },
  // 컨텍스트 엔지니어링 전용 필드
  project_name: { label: '프로젝트 이름', placeholder: '예: TaskFlow, ShopEasy, CodeBuddy', type: 'text', required: true },
  project_goal: { label: '프로젝트 목표', placeholder: '예: 중소기업을 위한 간편한 프로젝트 관리 도구', type: 'textarea', required: true },
  target_user: { label: '대상 사용자', placeholder: '예: IT 스타트업 팀장, 프리랜서 개발자, 대학생', type: 'text', required: true },
  tech_stack: { label: '기술 스택', placeholder: '예: React, TypeScript, Node.js, PostgreSQL, Tailwind CSS', type: 'text', required: false },
  core_features: { label: '핵심 기능 (줄바꿈으로 구분)', placeholder: '사용자 인증 (소셜 로그인)\n대시보드 (차트, 통계)\n실시간 알림\n데이터 CRUD', type: 'textarea', required: true },
  data_model: { label: '주요 데이터 모델', placeholder: '예: User(이름,이메일,역할), Project(제목,상태,마감일), Task(제목,담당자,우선순위)', type: 'textarea', required: false },
};

// ===== 사용 목적 + 자동 추천 매핑 =====
const PURPOSE_PRESETS = [
  { id: 'web-app', label: '웹 애플리케이션', icon: 'fa-globe', keywords: '웹앱, SPA, 프론트엔드, 백엔드, API' },
  { id: 'mobile-app', label: '모바일 앱', icon: 'fa-mobile-screen', keywords: '모바일, iOS, Android, Flutter' },
  { id: 'ai-tool', label: 'AI/ML 도구', icon: 'fa-robot', keywords: 'AI, 머신러닝, LLM, 챗봇' },
  { id: 'data-analysis', label: '데이터 분석', icon: 'fa-chart-line', keywords: '데이터, 분석, 시각화' },
  { id: 'automation', label: '업무 자동화', icon: 'fa-wand-magic-sparkles', keywords: '자동화, 워크플로, 스크립트' },
  { id: 'content', label: '콘텐츠 생성', icon: 'fa-pen-fancy', keywords: '글쓰기, 블로그, 마케팅' },
  { id: 'game', label: '게임 개발', icon: 'fa-gamepad', keywords: '게임, Unity, 인터랙티브' },
  { id: 'custom', label: '직접 입력', icon: 'fa-keyboard', keywords: '' },
];

// 목적별 자동 추천 기법 + 추천 이유
const PURPOSE_RECOMMENDATIONS: Record<string, any> = {
  'web-app': {
    primary: 'harness',
    secondary: ['context-engineering', 'prompt-chaining'],
    reason: '웹 애플리케이션은 역할/기술스택/기능/제약 등 복합적 맥락이 필요합니다. 하네스 엔지니어링으로 전체 구조를 잡고, 컨텍스트 문서로 프로젝트 스펙을 정리한 뒤, 프롬프트 체이닝으로 단계별 개발을 진행하세요.',
  },
  'mobile-app': {
    primary: 'harness',
    secondary: ['context-engineering', 'chain-of-thought'],
    reason: '모바일 앱은 플랫폼, UI/UX, 성능 등 고려사항이 많습니다. 하네스로 전체 앱 설계를 잡고, 컨텍스트 문서로 플랫폼별 요구사항을 정리하세요.',
  },
  'ai-tool': {
    primary: 'context-engineering',
    secondary: ['prompt-chaining', 'tree-of-thought'],
    reason: 'AI 도구는 모델 선택, 파이프라인, 데이터 흐름 등 복잡한 아키텍처 결정이 필요합니다. 컨텍스트 엔지니어링으로 전체 구조를 정의하고, 사고 트리로 기술 선택지를 비교하세요.',
  },
  'data-analysis': {
    primary: 'chain-of-thought',
    secondary: ['role-prompting', 'prompt-chaining'],
    reason: '데이터 분석은 단계적 사고가 핵심입니다. CoT로 분석 절차를 체계화하고, 역할 프롬프트로 데이터 전문가 관점을 확보하세요.',
  },
  'automation': {
    primary: 'prompt-chaining',
    secondary: ['harness', 'chain-of-thought'],
    reason: '업무 자동화는 워크플로 분해가 핵심입니다. 프롬프트 체이닝으로 자동화 단계를 설계하고, 하네스로 전체 시스템 요구사항을 잡으세요.',
  },
  'content': {
    primary: 'role-prompting',
    secondary: ['few-shot', 'zero-shot'],
    reason: '콘텐츠 생성은 톤/스타일/전문성이 핵심입니다. 역할 프롬프트로 전문 작가 페르소나를 설정하고, 퓨샷으로 원하는 문체 예시를 제공하세요.',
  },
  'game': {
    primary: 'harness',
    secondary: ['context-engineering', 'tree-of-thought'],
    reason: '게임 개발은 세계관, 게임 메카닉, 기술 스택 등 복합 요소가 있습니다. 하네스로 게임 디자인 문서를 구조화하고, 사고 트리로 설계 방향을 비교하세요.',
  },
  'custom': {
    primary: 'harness',
    secondary: ['context-engineering', 'zero-shot'],
    reason: '범용 프로젝트에는 하네스 엔지니어링이 가장 유연합니다. 프로젝트 규모에 따라 간단하면 제로샷, 복잡하면 컨텍스트 엔지니어링을 활용하세요.',
  },
};

// ===== 키워드 기반 자동 필드 생성 매핑 =====
function generateAutoFields(purpose: string, keyword: string, techniqueId: string): Record<string, string> {
  const p = PURPOSE_PRESETS.find(pp => pp.id === purpose);
  const purposeLabel = p?.label || purpose;
  const fields: Record<string, string> = {};

  // 컨텍스트 엔지니어링
  if (techniqueId === 'context-engineering') {
    fields.project_name = keyword.split(/\s+/)[0] || keyword;
    fields.project_goal = `${purposeLabel} 분야에서 "${keyword}"를 구현하는 프로젝트`;
    fields.target_user = getTargetUser(purpose);
    fields.tech_stack = getTechStack(purpose);
    fields.core_features = getCoreFeatures(purpose, keyword);
    fields.data_model = getDataModel(purpose, keyword);
    fields.constraints = '한국어 UI, 반응형 디자인, 성능 최적화, 접근성 준수';
    fields.tone = '전문적이고 체계적인';
    return fields;
  }

  // 하네스 엔지니어링
  if (techniqueId === 'harness') {
    fields.role = getRoleForPurpose(purpose);
    fields.context = `${purposeLabel} 프로젝트입니다. "${keyword}"를 개발하려 합니다. ${getContextDetail(purpose)}`;
    fields.task = `"${keyword}" 프로젝트의 전체 아키텍처를 설계하고, 핵심 기능을 정의하며, 구현 계획을 수립해주세요. 기술 스택 추천과 프로젝트 구조도 포함해주세요.`;
    fields.input_data = `프로젝트 유형: ${purposeLabel}\n핵심 키워드: ${keyword}`;
    fields.output_format = '마크다운 형식으로: 1) 프로젝트 개요 2) 기술 스택 3) 핵심 기능 목록 4) 데이터 모델 5) 프로젝트 구조 6) 구현 단계';
    fields.tone = '전문적이고 실용적인';
    fields.constraints = '실제 구현 가능한 현실적인 설계, 한국어로 작성, 초보 개발자도 따라할 수 있도록 상세히';
    return fields;
  }

  // 프롬프트 체이닝
  if (techniqueId === 'prompt-chaining') {
    fields.task = `"${keyword}" ${purposeLabel} 프로젝트를 처음부터 완성까지 개발`;
    fields.chain_steps = getChainSteps(purpose, keyword);
    fields.output_format = '각 단계별 상세 가이드 (마크다운)';
    fields.constraints = '각 단계의 출력이 다음 단계의 입력이 되도록 연결, 한국어로 작성';
    return fields;
  }

  // CoT
  if (techniqueId === 'chain-of-thought') {
    fields.role = getRoleForPurpose(purpose);
    fields.task = `"${keyword}" ${purposeLabel} 프로젝트의 최적 설계 방향을 분석해주세요.`;
    fields.steps = `1단계: "${keyword}" 프로젝트의 핵심 요구사항을 분석합니다.\n2단계: 가능한 기술 스택과 아키텍처 옵션을 비교합니다.\n3단계: 사용자 경험, 성능, 확장성을 고려한 최적의 설계를 도출합니다.\n4단계: 구체적인 구현 계획과 우선순위를 제시합니다.`;
    fields.output_format = '단계별 분석 결과 + 최종 추천 (마크다운)';
    fields.constraints = '실용적이고 현실적인 분석, 한국어로 작성';
    return fields;
  }

  // ToT
  if (techniqueId === 'tree-of-thought') {
    fields.role = getRoleForPurpose(purpose);
    fields.task = `"${keyword}" ${purposeLabel} 프로젝트의 최적 아키텍처를 결정해주세요.`;
    fields.approaches = getApproaches(purpose, keyword);
    fields.output_format = '각 접근법 분석 + 최종 추천 (마크다운 표 포함)';
    fields.constraints = '장단점을 객관적으로 비교, 한국어로 작성';
    return fields;
  }

  // 역할 프롬프트
  if (techniqueId === 'role-prompting') {
    fields.role_detail = getRoleDetail(purpose);
    fields.expertise = getExpertise(purpose);
    fields.task = `"${keyword}" ${purposeLabel}을 설계하고 구현 계획을 작성해주세요.`;
    fields.tone = '전문적이면서도 이해하기 쉬운';
    fields.output_format = '구조화된 마크다운 문서';
    fields.constraints = '실무 경험 기반의 실용적 조언, 한국어로 작성';
    return fields;
  }

  // 퓨샷
  if (techniqueId === 'few-shot') {
    fields.role = getRoleForPurpose(purpose);
    fields.task = `아래 예시처럼 "${keyword}" 프로젝트에 대한 핵심 기능 명세를 작성해주세요.`;
    fields.examples = getFewShotExamples(purpose);
    fields.actual_input = `프로젝트: ${keyword} (${purposeLabel})`;
    fields.output_format = '예시와 동일한 형식';
    fields.constraints = '한국어로 작성';
    return fields;
  }

  // 제로샷
  if (techniqueId === 'zero-shot') {
    fields.role = getRoleForPurpose(purpose);
    fields.task = `"${keyword}" ${purposeLabel}의 프로젝트 구조, 핵심 기능, 기술 스택을 설계해주세요.`;
    fields.output_format = '마크다운 형식의 프로젝트 설계 문서';
    fields.constraints = '실용적이고 구현 가능한 설계, 한국어로 작성';
    return fields;
  }

  // 메타 프롬프팅
  if (techniqueId === 'meta-prompting') {
    fields.original_prompt = `"${keyword}" ${purposeLabel}을 만들어주세요.`;
    fields.improvement_goal = `프롬프트를 더 구체적으로 개선하여 AI가 정확한 프로젝트 설계를 생성하도록`;
    fields.constraints = '한국어로 작성';
    return fields;
  }

  return fields;
}

// ===== 헬퍼 함수들 =====
function getRoleForPurpose(purpose: string): string {
  const map: Record<string, string> = {
    'web-app': '당신은 15년 경력의 시니어 풀스택 웹 개발자이자 소프트웨어 아키텍트입니다.',
    'mobile-app': '당신은 10년 경력의 모바일 앱 개발 전문가이자 UI/UX 디자이너입니다.',
    'ai-tool': '당신은 AI/ML 엔지니어이자 LLM 애플리케이션 아키텍트입니다.',
    'data-analysis': '당신은 시니어 데이터 분석가이자 비즈니스 인텔리전스 전문가입니다.',
    'automation': '당신은 DevOps 엔지니어이자 워크플로 자동화 전문가입니다.',
    'content': '당신은 10년 경력의 콘텐츠 전략가이자 SEO 전문가입니다.',
    'game': '당신은 시니어 게임 개발자이자 게임 디자이너입니다.',
    'custom': '당신은 다양한 분야에 정통한 시니어 소프트웨어 엔지니어입니다.',
  };
  return map[purpose] || map.custom;
}

function getRoleDetail(purpose: string): string {
  const map: Record<string, string> = {
    'web-app': '15년 경력의 시니어 풀스택 웹 개발자이자 소프트웨어 아키텍트',
    'mobile-app': '10년 경력의 크로스플랫폼 모바일 앱 개발 전문가',
    'ai-tool': 'AI/ML 엔지니어이자 LLM 애플리케이션 아키텍트',
    'data-analysis': '시니어 데이터 분석가이자 BI 전문가',
    'automation': 'DevOps 엔지니어이자 프로세스 자동화 컨설턴트',
    'content': '10년 경력의 콘텐츠 전략가이자 카피라이터',
    'game': '시니어 게임 개발자이자 게임 디자인 전문가',
    'custom': '다양한 분야에 정통한 시니어 소프트웨어 엔지니어',
  };
  return map[purpose] || map.custom;
}

function getExpertise(purpose: string): string {
  const map: Record<string, string> = {
    'web-app': 'React/Next.js, TypeScript, Node.js, PostgreSQL, 클라우드 인프라, CI/CD 전문',
    'mobile-app': 'React Native, Flutter, Swift, Kotlin, 앱스토어 배포 경험 다수',
    'ai-tool': 'LLM 파인튜닝, RAG, 프롬프트 최적화, Python, TensorFlow, PyTorch 전문',
    'data-analysis': 'Python, SQL, Tableau, Power BI, 통계 모델링, 데이터 시각화 전문',
    'automation': 'CI/CD, Docker, AWS, GitHub Actions, 쉘 스크립팅, API 통합 전문',
    'content': 'SEO, 소셜 미디어, 이메일 마케팅, 브랜드 스토리텔링 전문',
    'game': 'Unity, Unreal Engine, C#, 게임 메카닉, 레벨 디자인 전문',
    'custom': '웹, 모바일, 클라우드, 데이터 분야 폭넓은 경험',
  };
  return map[purpose] || map.custom;
}

function getTargetUser(purpose: string): string {
  const map: Record<string, string> = {
    'web-app': '일반 사용자 및 비즈니스 관리자',
    'mobile-app': '스마트폰 사용자 (20~40대)',
    'ai-tool': 'AI 도구를 활용하려는 개발자 및 비즈니스 사용자',
    'data-analysis': '데이터 기반 의사결정이 필요한 팀장/경영진',
    'automation': '반복 업무를 줄이고 싶은 팀원/관리자',
    'content': '콘텐츠를 생산하는 마케터/블로거',
    'game': '게임을 즐기는 일반 유저 (10~30대)',
    'custom': '해당 프로젝트의 실제 사용자',
  };
  return map[purpose] || map.custom;
}

function getTechStack(purpose: string): string {
  const map: Record<string, string> = {
    'web-app': 'React, TypeScript, Hono, Tailwind CSS, Cloudflare Pages, D1(SQLite)',
    'mobile-app': 'React Native (또는 Flutter), TypeScript, Expo, Firebase',
    'ai-tool': 'Python, FastAPI, LangChain, OpenAI API, React 프론트엔드',
    'data-analysis': 'Python, Pandas, Matplotlib, Streamlit, SQL',
    'automation': 'Node.js, GitHub Actions, Docker, REST API',
    'content': 'Next.js, MDX, Tailwind CSS, Vercel',
    'game': 'Unity, C#, Firebase, Photon (멀티플레이)',
    'custom': '프로젝트 요구사항에 맞는 최적의 스택',
  };
  return map[purpose] || map.custom;
}

function getContextDetail(purpose: string): string {
  const map: Record<string, string> = {
    'web-app': '반응형 웹 애플리케이션으로 데스크톱과 모바일 모두 지원해야 합니다. SEO와 성능 최적화가 중요합니다.',
    'mobile-app': '크로스플랫폼 모바일 앱으로 iOS/Android 모두 지원해야 합니다. 네이티브 수준의 UX가 중요합니다.',
    'ai-tool': 'AI/ML 기반 도구로 사용자 친화적 인터페이스와 정확한 결과가 중요합니다.',
    'data-analysis': '데이터를 수집, 분석, 시각화하여 인사이트를 도출하는 것이 목표입니다.',
    'automation': '반복적인 수작업을 자동화하여 생산성을 높이는 것이 핵심입니다.',
    'content': '고품질 콘텐츠를 효율적으로 생산하고 관리하는 시스템입니다.',
    'game': '사용자에게 몰입감 있는 게임 경험을 제공하는 것이 목표입니다.',
    'custom': '사용자 요구사항에 맞는 최적의 솔루션을 설계합니다.',
  };
  return map[purpose] || map.custom;
}

function getCoreFeatures(purpose: string, keyword: string): string {
  const map: Record<string, string> = {
    'web-app': `사용자 인증 (회원가입/로그인/소셜 로그인)\n${keyword} 핵심 기능 (CRUD)\n대시보드 (데이터 시각화)\n반응형 UI/UX\n검색 및 필터링\n설정 및 프로필 관리`,
    'mobile-app': `온보딩 및 사용자 인증\n${keyword} 핵심 기능\n푸시 알림\n오프라인 지원\n설정 및 프로필\n앱 내 결제 (필요시)`,
    'ai-tool': `AI 모델 연동 (API 호출)\n${keyword} 핵심 기능\n입력/출력 인터페이스\n히스토리 관리\n결과 저장 및 공유`,
    'data-analysis': `데이터 수집 및 업로드\n${keyword} 분석 기능\n시각화 대시보드 (차트/그래프)\n리포트 생성 및 다운로드\n필터링 및 드릴다운`,
    'automation': `워크플로 정의 및 관리\n${keyword} 자동화 로직\n트리거 및 스케줄링\n실행 로그 및 모니터링\n알림 (이메일/슬랙)`,
    'content': `콘텐츠 작성 에디터\n${keyword} 관련 기능\nSEO 최적화 도구\n미리보기 및 퍼블리시\n카테고리/태그 관리`,
    'game': `게임 메카닉 (핵심 루프)\n${keyword} 관련 게임 요소\n사용자 프로필 및 진행 상황\n리더보드 및 업적\n설정 및 사운드 관리`,
    'custom': `${keyword} 핵심 기능\n사용자 인증\n데이터 관리 (CRUD)\nUI/UX\n검색 및 필터링`,
  };
  return map[purpose] || map.custom;
}

function getDataModel(purpose: string, keyword: string): string {
  const map: Record<string, string> = {
    'web-app': `User (id, email, name, role, created_at)\n${keyword.split(/\s+/)[0] || 'Item'} (id, title, description, status, user_id, created_at, updated_at)\nCategory (id, name, slug)`,
    'mobile-app': `User (id, email, name, avatar, settings)\n${keyword.split(/\s+/)[0] || 'Item'} (id, title, content, user_id, synced_at)\nNotification (id, type, message, read, user_id)`,
    'ai-tool': `User (id, email, api_key_hash)\nConversation (id, title, model, user_id)\nMessage (id, role, content, conversation_id, tokens)`,
    'data-analysis': `Dataset (id, name, source, format, user_id)\nAnalysis (id, type, parameters, result, dataset_id)\nVisualization (id, type, config, analysis_id)`,
    'automation': `Workflow (id, name, trigger, status, user_id)\nStep (id, action, config, order, workflow_id)\nExecution (id, status, log, workflow_id, started_at)`,
    'content': `Post (id, title, content, status, seo_meta, author_id)\nCategory (id, name, slug)\nMedia (id, url, type, post_id)`,
    'game': `Player (id, username, level, xp, coins)\nGameSession (id, score, duration, player_id)\nAchievement (id, name, condition, icon)`,
    'custom': `User (id, email, name, created_at)\n${keyword.split(/\s+/)[0] || 'Item'} (id, title, data, user_id)`,
  };
  return map[purpose] || map.custom;
}

function getChainSteps(purpose: string, keyword: string): string {
  const map: Record<string, string> = {
    'web-app': `Step 1: "${keyword}" 프로젝트 요구사항 분석 및 기능 명세 작성\nStep 2: 기술 스택 결정 및 프로젝트 아키텍처 설계\nStep 3: 데이터베이스 스키마 및 API 엔드포인트 설계\nStep 4: UI/UX 와이어프레임 및 컴포넌트 구조 설계\nStep 5: 핵심 기능 구현 코드 작성`,
    'mobile-app': `Step 1: "${keyword}" 앱 요구사항 및 화면 흐름 정의\nStep 2: 기술 스택 및 앱 아키텍처 설계\nStep 3: UI/UX 디자인 및 네비게이션 구조\nStep 4: 핵심 기능 및 API 연동 구현\nStep 5: 테스트 및 앱스토어 배포 준비`,
    'ai-tool': `Step 1: "${keyword}" AI 도구 기능 정의 및 모델 선택\nStep 2: 데이터 파이프라인 및 프롬프트 설계\nStep 3: 백엔드 API 및 모델 연동 구현\nStep 4: 프론트엔드 인터페이스 구현\nStep 5: 테스트 및 프롬프트 최적화`,
    'data-analysis': `Step 1: "${keyword}" 분석 목표 및 데이터 소스 정의\nStep 2: 데이터 수집 및 전처리 파이프라인 설계\nStep 3: 분석 로직 및 통계 모델 구현\nStep 4: 시각화 대시보드 및 리포트 생성\nStep 5: 인사이트 도출 및 결과 검증`,
    'automation': `Step 1: "${keyword}" 자동화 대상 워크플로 분석\nStep 2: 자동화 아키텍처 및 트리거 설계\nStep 3: 핵심 자동화 스크립트 구현\nStep 4: 모니터링 및 알림 시스템 구축\nStep 5: 테스트 및 점진적 배포`,
    'content': `Step 1: "${keyword}" 콘텐츠 전략 및 타겟 오디언스 분석\nStep 2: 콘텐츠 구조 및 톤/스타일 가이드 설정\nStep 3: 핵심 콘텐츠 초안 작성\nStep 4: SEO 최적화 및 편집\nStep 5: 퍼블리싱 및 성과 측정 계획`,
    'game': `Step 1: "${keyword}" 게임 컨셉 및 핵심 메카닉 설계\nStep 2: 게임 아키텍처 및 기술 스택 결정\nStep 3: 핵심 게임 로직 및 시스템 구현\nStep 4: UI/UX 및 비주얼 에셋 설계\nStep 5: 플레이테스트 및 밸런싱`,
    'custom': `Step 1: "${keyword}" 프로젝트 요구사항 분석\nStep 2: 기술 스택 및 아키텍처 설계\nStep 3: 핵심 기능 구현\nStep 4: UI/UX 설계 및 구현\nStep 5: 테스트 및 배포`,
  };
  return map[purpose] || map.custom;
}

function getApproaches(purpose: string, keyword: string): string {
  const map: Record<string, string> = {
    'web-app': `접근법 A - SSR 기반: Next.js + PostgreSQL (SEO 우수, 초기 렌더링 빠름)\n접근법 B - SPA 기반: React + Hono + D1 (개발 빠름, 엣지 배포 용이)\n접근법 C - 풀스택 프레임워크: Remix/SvelteKit + Supabase (통합 개발 경험)`,
    'mobile-app': `접근법 A - React Native: 코드 재사용, 대규모 커뮤니티, JS 생태계\n접근법 B - Flutter: 네이티브 성능, 아름다운 UI, Dart 학습 필요\n접근법 C - Native: Swift/Kotlin, 최상의 성능, 플랫폼별 개발`,
    'ai-tool': `접근법 A - OpenAI API 기반: GPT-4 활용, 빠른 프로토타이핑\n접근법 B - 오픈소스 모델: LLaMA/Mistral, 커스터마이징 자유, 비용 절감\n접근법 C - 하이브리드: 경량 모델 + API 폴백, 비용과 품질 균형`,
    'data-analysis': `접근법 A - Python + Jupyter: 유연한 분석, 풍부한 라이브러리\n접근법 B - BI 도구 (Tableau/Power BI): 시각화 우수, 비개발자 친화\n접근법 C - 웹 대시보드: Streamlit/Dash, 공유 편리, 자동화 가능`,
    'automation': `접근법 A - 코드 기반: Python/Node.js 스크립트, 완전한 제어\n접근법 B - 노코드/로우코드: Zapier/n8n, 빠른 설정, 유지보수 쉬움\n접근법 C - 하이브리드: 핵심은 코드, 연동은 노코드`,
    'content': `접근법 A - AI 중심: LLM 기반 자동 생성 + 편집\n접근법 B - 템플릿 기반: 사전 정의된 구조 활용\n접근법 C - 협업 기반: AI 초안 + 인간 검토 워크플로`,
    'game': `접근법 A - Unity: C#, 크로스플랫폼, 에셋 스토어 풍부\n접근법 B - Unreal Engine: C++/Blueprint, 고품질 그래픽\n접근법 C - 웹 기반: Phaser/Three.js, 접근성 높음, 설치 불필요`,
    'custom': `접근법 A - 빠른 프로토타이핑: 최소 기능 제품(MVP) 우선\n접근법 B - 견고한 설계: 확장성 있는 아키텍처 우선\n접근법 C - 사용자 중심: UX 리서치 기반 점진적 개발`,
  };
  return map[purpose] || map.custom;
}

function getFewShotExamples(purpose: string): string {
  const map: Record<string, string> = {
    'web-app': `프로젝트: 블로그 플랫폼\n→ 핵심 기능: 글 작성(마크다운 에디터), 카테고리/태그 분류, 댓글, SEO 최적화, RSS 피드\n→ 기술 스택: Next.js, MDX, Tailwind, Vercel\n\n프로젝트: 팀 채팅 앱\n→ 핵심 기능: 실시간 메시징, 채널 관리, 파일 공유, 멘션, 검색\n→ 기술 스택: React, Socket.io, Express, MongoDB`,
    'mobile-app': `프로젝트: 가계부 앱\n→ 핵심 기능: 지출/수입 입력, 카테고리별 분석, 월간 리포트, 알림\n→ 기술 스택: Flutter, SQLite, Firebase\n\n프로젝트: 운동 트래커\n→ 핵심 기능: 운동 기록, GPS 트래킹, 통계 차트, 목표 설정\n→ 기술 스택: React Native, HealthKit/Google Fit`,
    'content': `프로젝트: 기술 블로그\n→ 핵심 기능: AI 초안 생성, SEO 키워드 추천, 에디터, 스케줄 발행\n→ 톤: 전문적이면서 친근한\n\n프로젝트: 뉴스레터 도구\n→ 핵심 기능: 템플릿 편집, 구독자 관리, A/B 테스트, 분석\n→ 톤: 간결하고 임팩트 있는`,
    'custom': `프로젝트: 할일 관리 앱\n→ 핵심 기능: 할일 CRUD, 우선순위, 마감일, 카테고리, 공유\n→ 기술 스택: React, Hono, D1`,
  };
  return map[purpose] || map.custom || map['web-app'];
}

// ===== API 엔드포인트: 기법 목록 =====
app.get('/api/techniques', (c) => {
  const list = Object.values(TECHNIQUES).map((t: any) => ({
    id: t.id, name: t.name, nameEn: t.nameEn, icon: t.icon,
    color: t.color, difficulty: t.difficulty, description: t.description, category: t.category,
  }));
  return c.json({ techniques: list });
});

// ===== API 엔드포인트: 기법 상세 =====
app.get('/api/techniques/:id', (c) => {
  const id = c.req.param('id');
  const tech = TECHNIQUES[id];
  if (!tech) return c.json({ error: 'Not found' }, 404);
  const fields = tech.fields.map((f: string) => ({ ...FIELD_DEFINITIONS[f], id: f }));
  return c.json({ technique: tech, fields });
});

// ===== API 엔드포인트: 목적 프리셋 =====
app.get('/api/purposes', (c) => {
  return c.json({ purposes: PURPOSE_PRESETS });
});

// ===== API 엔드포인트: 자동 추천 =====
app.post('/api/recommend', async (c) => {
  const { purpose, keyword } = await c.req.json();
  const rec = PURPOSE_RECOMMENDATIONS[purpose] || PURPOSE_RECOMMENDATIONS.custom;
  return c.json({
    primary: rec.primary,
    secondary: rec.secondary,
    reason: rec.reason,
    primaryTechnique: {
      id: TECHNIQUES[rec.primary].id,
      name: TECHNIQUES[rec.primary].name,
      nameEn: TECHNIQUES[rec.primary].nameEn,
      icon: TECHNIQUES[rec.primary].icon,
      color: TECHNIQUES[rec.primary].color,
      category: TECHNIQUES[rec.primary].category,
    },
    secondaryTechniques: rec.secondary.map((id: string) => ({
      id: TECHNIQUES[id].id,
      name: TECHNIQUES[id].name,
      nameEn: TECHNIQUES[id].nameEn,
      icon: TECHNIQUES[id].icon,
      color: TECHNIQUES[id].color,
      category: TECHNIQUES[id].category,
    })),
  });
});

// ===== API 엔드포인트: 프롬프트 체이닝 시퀀스 생성 =====
app.post('/api/generate-chain', async (c) => {
  const { purpose, keyword, fields } = await c.req.json();
  if (!keyword) return c.json({ error: '키워드가 필요합니다.' }, 400);
  const p = PURPOSE_PRESETS.find(pp => pp.id === purpose);
  const purposeLabel = p?.label || purpose || '프로젝트';
  const role = getRoleForPurpose(purpose || 'custom');
  const stepsRaw = fields?.chain_steps || getChainSteps(purpose || 'custom', keyword);
  const steps = stepsRaw.split('\n').filter((s: string) => s.trim()).map((s: string) => s.replace(/^(Step\s*\d+\s*[:：]\s*)/i, '').trim());

  const chainPrompts = steps.map((step: string, i: number) => {
    const stepNum = i + 1;
    const totalSteps = steps.length;
    let prompt = '';
    const prevNote = i > 0 ? `\n\n[이전 단계(Step ${i})의 결과를 기반으로 진행합니다.]` : '';
    const nextNote = i < totalSteps - 1 ? `\n\n[중요] 이 단계의 결과는 다음 단계(Step ${stepNum + 1})의 입력으로 사용됩니다. 구조화된 형태로 출력하세요.` : '\n\n[마지막 단계] 모든 이전 단계의 결과를 종합하여 최종 결과를 완성하세요.';

    prompt = `${role}\n\n`;
    prompt += `## 프롬프트 체인 - Step ${stepNum}/${totalSteps}\n`;
    prompt += `**프로젝트**: ${keyword} (${purposeLabel})\n`;
    prompt += `**현재 단계**: ${step}\n`;
    prompt += prevNote;
    prompt += `\n\n### 상세 지시사항\n`;

    // 단계별 맞춤 지시
    if (stepNum === 1) {
      prompt += `"${keyword}" 프로젝트의 요구사항을 분석해주세요:\n`;
      prompt += `1. 프로젝트 목적과 핵심 가치\n`;
      prompt += `2. 대상 사용자와 사용 시나리오\n`;
      prompt += `3. 핵심 기능 목록 (우선순위 포함)\n`;
      prompt += `4. 비기능 요구사항 (성능, 보안, 확장성)\n`;
      prompt += `5. 성공 기준과 KPI`;
    } else if (stepNum === 2) {
      prompt += `이전 단계에서 분석한 요구사항을 바탕으로 기술 아키텍처를 설계하세요:\n`;
      prompt += `1. 기술 스택 선정 및 근거\n`;
      prompt += `2. 시스템 아키텍처 다이어그램 (텍스트 기반)\n`;
      prompt += `3. 모듈/컴포넌트 구조\n`;
      prompt += `4. 데이터 흐름\n`;
      prompt += `5. 확장성 고려사항`;
    } else if (stepNum === 3) {
      prompt += `이전 단계의 아키텍처 설계를 바탕으로 상세 구현 스펙을 작성하세요:\n`;
      prompt += `1. 데이터베이스 스키마 (테이블, 관계, 인덱스)\n`;
      prompt += `2. API 엔드포인트 설계 (경로, 메서드, 요청/응답)\n`;
      prompt += `3. 핵심 비즈니스 로직\n`;
      prompt += `4. 에러 처리 전략\n`;
      prompt += `5. 보안 고려사항`;
    } else if (stepNum === 4) {
      prompt += `이전 단계의 스펙을 바탕으로 UI/UX와 프론트엔드를 설계하세요:\n`;
      prompt += `1. 화면 목록 및 와이어프레임 (텍스트 기반)\n`;
      prompt += `2. 컴포넌트 트리 구조\n`;
      prompt += `3. 사용자 인터랙션 흐름\n`;
      prompt += `4. 상태 관리 전략\n`;
      prompt += `5. 접근성 및 반응형 디자인`;
    } else {
      prompt += `이전 모든 단계의 결과를 종합하여 최종 결과물을 완성하세요:\n`;
      prompt += `1. 구현 우선순위 및 스프린트 계획\n`;
      prompt += `2. 테스트 전략\n`;
      prompt += `3. 배포 계획\n`;
      prompt += `4. 향후 개선사항\n`;
      prompt += `5. 종합 정리`;
    }

    prompt += nextNote;
    if (fields?.output_format) prompt += `\n\n출력 형식: ${fields.output_format}`;
    if (fields?.constraints) prompt += `\n제약 조건: ${fields.constraints}`;

    return {
      step: stepNum,
      title: step,
      prompt: prompt.trim(),
    };
  });

  return c.json({
    totalSteps: steps.length,
    project: keyword,
    purpose: purposeLabel,
    chainPrompts,
  });
});

// ===== API 엔드포인트: 컨텍스트 문서 생성 =====
app.post('/api/generate-context-doc', async (c) => {
  const { purpose, keyword, fields } = await c.req.json();
  if (!keyword) return c.json({ error: '키워드가 필요합니다.' }, 400);
  const p = PURPOSE_PRESETS.find(pp => pp.id === purpose);
  const purposeLabel = p?.label || purpose || '프로젝트';

  const doc: string[] = [];
  doc.push(`# ${fields?.project_name || keyword} - 프로젝트 컨텍스트 문서`);
  doc.push('');
  doc.push(`> 이 문서는 AI 도구(ChatGPT, Claude, Cursor 등)에 제공할 프로젝트 컨텍스트입니다.`);
  doc.push(`> 시스템 프롬프트 또는 프로젝트 루트에 context.md로 저장하여 사용하세요.`);
  doc.push('');
  doc.push(`## 1. 프로젝트 개요`);
  doc.push(`- **프로젝트명**: ${fields?.project_name || keyword}`);
  doc.push(`- **유형**: ${purposeLabel}`);
  doc.push(`- **목표**: ${fields?.project_goal || `${purposeLabel} 분야에서 "${keyword}"를 구현하는 프로젝트`}`);
  doc.push(`- **대상 사용자**: ${fields?.target_user || getTargetUser(purpose || 'custom')}`);
  doc.push('');
  doc.push(`## 2. 기술 스택`);
  const ts = fields?.tech_stack || getTechStack(purpose || 'custom');
  ts.split(',').map((t: string) => t.trim()).filter(Boolean).forEach((t: string) => {
    doc.push(`- ${t}`);
  });
  doc.push('');
  doc.push(`## 3. 핵심 기능`);
  const features = (fields?.core_features || getCoreFeatures(purpose || 'custom', keyword)).split('\n').filter((s: string) => s.trim());
  features.forEach((f: string, i: number) => {
    doc.push(`### 3.${i + 1}. ${f.trim()}`);
    doc.push(`- 상세 설명: [AI가 채워줌]`);
    doc.push(`- 우선순위: ${i < 2 ? 'P0 (핵심)' : i < 4 ? 'P1 (중요)' : 'P2 (부가)'}`);
    doc.push(`- 예상 구현 시간: [AI가 채워줌]`);
    doc.push('');
  });
  doc.push(`## 4. 데이터 모델`);
  const dm = fields?.data_model || getDataModel(purpose || 'custom', keyword);
  dm.split('\n').filter((s: string) => s.trim()).forEach((m: string) => {
    doc.push(`- ${m.trim()}`);
  });
  doc.push('');
  doc.push(`## 5. 제약 조건 및 요구사항`);
  const constraints = (fields?.constraints || '한국어 UI, 반응형 디자인, 성능 최적화').split(',').map((s: string) => s.trim()).filter(Boolean);
  constraints.forEach((c: string) => {
    doc.push(`- ${c}`);
  });
  doc.push('');
  doc.push(`## 6. 커뮤니케이션 가이드`);
  doc.push(`- **톤**: ${fields?.tone || '전문적이고 체계적인'}`);
  doc.push(`- **언어**: 한국어`);
  doc.push(`- **코드 주석**: 한국어`);
  doc.push(`- **응답 형식**: 마크다운`);
  doc.push('');
  doc.push(`## 7. 프로젝트 구조 (AI가 설계)`);
  doc.push('```');
  doc.push(`${fields?.project_name || keyword}/`);
  doc.push('├── src/');
  doc.push('│   ├── components/   # UI 컴포넌트');
  doc.push('│   ├── pages/        # 페이지');
  doc.push('│   ├── api/          # API 라우트');
  doc.push('│   ├── utils/        # 유틸리티');
  doc.push('│   └── types/        # 타입 정의');
  doc.push('├── public/           # 정적 파일');
  doc.push('├── tests/            # 테스트');
  doc.push('└── README.md');
  doc.push('```');
  doc.push('');
  doc.push(`## 8. 개발 진행 규칙`);
  doc.push(`1. 한 번에 하나의 기능만 구현하세요.`);
  doc.push(`2. 각 기능은 테스트 가능한 단위로 나누세요.`);
  doc.push(`3. 커밋 메시지는 conventional commit을 따르세요.`);
  doc.push(`4. 모든 코드에 적절한 에러 처리를 포함하세요.`);
  doc.push(`5. 성능과 접근성을 항상 고려하세요.`);
  doc.push('');
  doc.push('---');
  doc.push('**이 문서를 AI 도구에 제공한 후 아래와 같이 시작하세요:**');
  doc.push('');
  doc.push('```');
  doc.push(`위 컨텍스트 문서를 바탕으로 "${fields?.project_name || keyword}" 프로젝트의`);
  doc.push(`첫 번째 기능인 "${features[0]?.trim() || '핵심 기능'}"을 구현해주세요.`);
  doc.push('```');

  return c.json({
    document: doc.join('\n'),
    filename: `${(fields?.project_name || keyword).replace(/\s+/g, '-').toLowerCase()}-context.md`,
    sections: 8,
    features: features.length,
  });
});

// ===== API 엔드포인트: 자동 필드 생성 =====
app.post('/api/auto-fill', async (c) => {
  const { purpose, keyword, techniqueId } = await c.req.json();
  if (!purpose || !keyword || !techniqueId) {
    return c.json({ error: '목적, 키워드, 기법 ID가 필요합니다.' }, 400);
  }
  const autoFields = generateAutoFields(purpose, keyword, techniqueId);
  return c.json({ fields: autoFields });
});

// ===== API 엔드포인트: 프롬프트 생성 =====
app.post('/api/generate', async (c) => {
  const body = await c.req.json();
  const { techniqueId, fields, purpose, keyword } = body;

  const tech = TECHNIQUES[techniqueId];
  if (!tech) return c.json({ error: '유효하지 않은 기법입니다.' }, 400);

  let prompt = '';

  // 컨텍스트 엔지니어링
  if (techniqueId === 'context-engineering') {
    const sections = [];
    sections.push('# 프로젝트 컨텍스트 문서');
    sections.push('');
    if (fields.project_name) sections.push(`## 프로젝트명\n${fields.project_name}`);
    if (fields.project_goal) sections.push(`## 프로젝트 목표\n${fields.project_goal}`);
    if (fields.target_user) sections.push(`## 대상 사용자\n${fields.target_user}`);
    if (fields.tech_stack) sections.push(`## 기술 스택\n${fields.tech_stack}`);
    if (fields.core_features) {
      const features = fields.core_features.split('\n').filter((s: string) => s.trim());
      sections.push(`## 핵심 기능\n${features.map((f: string, i: number) => `${i + 1}. ${f.trim()}`).join('\n')}`);
    }
    if (fields.data_model) sections.push(`## 데이터 모델\n${fields.data_model}`);
    if (fields.constraints) sections.push(`## 제약 조건 및 요구사항\n${fields.constraints}`);
    if (fields.tone) sections.push(`## 커뮤니케이션 톤\n${fields.tone}`);
    sections.push('');
    sections.push('---');
    sections.push('위 컨텍스트를 바탕으로 프로젝트를 설계하고 구현해주세요.');
    sections.push('각 기능의 상세 스펙, API 설계, 데이터베이스 스키마, 프로젝트 구조를 포함해주세요.');
    prompt = sections.join('\n\n');
  }
  // 하네스 엔지니어링
  else if (techniqueId === 'harness') {
    const sections = [];
    if (fields.role) sections.push(`## 역할 (Role)\n${fields.role}`);
    if (fields.context) sections.push(`## 배경 컨텍스트 (Context)\n${fields.context}`);
    if (fields.task) sections.push(`## 작업 목표 (Task)\n${fields.task}`);
    if (fields.input_data) sections.push(`## 입력 데이터 (Input)\n${fields.input_data}`);
    if (fields.output_format) sections.push(`## 출력 형식 (Output Format)\n${fields.output_format}`);
    if (fields.tone) sections.push(`## 톤 & 스타일 (Tone)\n${fields.tone}`);
    if (fields.constraints) sections.push(`## 제약 조건 (Constraints)\n${fields.constraints}`);
    if (fields.example) sections.push(`## 예시 (Example)\n${fields.example}`);
    prompt = sections.join('\n\n');
  }
  // 제로샷
  else if (techniqueId === 'zero-shot') {
    const parts = [];
    if (fields.role) parts.push(fields.role);
    parts.push('');
    if (fields.task) parts.push(fields.task);
    if (fields.output_format) parts.push(`\n출력 형식: ${fields.output_format}`);
    if (fields.constraints) parts.push(`\n제약 조건: ${fields.constraints}`);
    prompt = parts.join('\n');
  }
  // 퓨샷
  else if (techniqueId === 'few-shot') {
    const parts = [];
    if (fields.role) parts.push(fields.role);
    parts.push('');
    if (fields.task) parts.push(fields.task);
    parts.push('');
    if (fields.examples) parts.push(`예시:\n${fields.examples}`);
    parts.push('');
    if (fields.actual_input) parts.push(`이제 다음을 수행하세요:\n${fields.actual_input}`);
    if (fields.output_format) parts.push(`\n출력 형식: ${fields.output_format}`);
    if (fields.constraints) parts.push(`\n제약 조건: ${fields.constraints}`);
    prompt = parts.join('\n');
  }
  // CoT
  else if (techniqueId === 'chain-of-thought') {
    const parts = [];
    if (fields.role) parts.push(fields.role);
    parts.push('');
    if (fields.task) parts.push(fields.task);
    parts.push('');
    parts.push('단계별로 차근차근 생각해 보세요:');
    if (fields.steps) { parts.push(fields.steps); }
    else { parts.push('1단계: 문제를 분석합니다.\n2단계: 가능한 해결 방안을 도출합니다.\n3단계: 최적의 솔루션을 선택하고 설명합니다.'); }
    if (fields.output_format) parts.push(`\n최종 답변을 ${fields.output_format} 형식으로 제공하세요.`);
    if (fields.constraints) parts.push(`\n제약 조건: ${fields.constraints}`);
    prompt = parts.join('\n');
  }
  // ToT
  else if (techniqueId === 'tree-of-thought') {
    const parts = [];
    if (fields.role) parts.push(fields.role);
    parts.push('');
    parts.push(`문제: ${fields.task || ''}`);
    parts.push('');
    parts.push('다음 접근법으로 분석하세요:');
    parts.push('');
    if (fields.approaches) { parts.push(fields.approaches); }
    else { parts.push('접근법 A: 첫 번째 관점\n접근법 B: 두 번째 관점\n접근법 C: 세 번째 관점'); }
    parts.push('');
    parts.push('각 접근법의 장단점을 평가하고, 가장 적합한 해결책을 선택하여 최종 답변을 제시하세요.');
    if (fields.output_format) parts.push(`\n출력 형식: ${fields.output_format}`);
    if (fields.constraints) parts.push(`\n제약 조건: ${fields.constraints}`);
    prompt = parts.join('\n');
  }
  // 역할 프롬프트
  else if (techniqueId === 'role-prompting') {
    const parts = [];
    parts.push(`당신은 ${fields.role_detail || '전문가'}입니다.`);
    if (fields.expertise) parts.push(fields.expertise);
    parts.push('');
    if (fields.task) parts.push(fields.task);
    if (fields.tone) parts.push(`\n${fields.tone} 톤으로 답변하세요.`);
    if (fields.output_format) parts.push(`출력 형식: ${fields.output_format}`);
    if (fields.constraints) parts.push(`\n제약 조건: ${fields.constraints}`);
    prompt = parts.join('\n');
  }
  // 프롬프트 체이닝
  else if (techniqueId === 'prompt-chaining') {
    const parts = [];
    parts.push('## 프롬프트 체인 구조');
    parts.push('');
    if (fields.task) parts.push(`전체 목표: ${fields.task}`);
    parts.push('');
    if (fields.chain_steps) {
      const steps = fields.chain_steps.split('\n').filter((s: string) => s.trim());
      steps.forEach((step: string, i: number) => {
        parts.push(`### Step ${i + 1}: ${step.replace(/^(Step\s*\d+\s*[:：]\s*)/i, '')}`);
        if (i > 0) parts.push('(이전 단계의 결과를 바탕으로 진행)');
        parts.push('');
      });
    }
    if (fields.output_format) parts.push(`최종 출력 형식: ${fields.output_format}`);
    if (fields.constraints) parts.push(`\n제약 조건: ${fields.constraints}`);
    prompt = parts.join('\n');
  }
  // 메타 프롬프팅
  else if (techniqueId === 'meta-prompting') {
    const parts = [];
    parts.push('다음 프롬프트를 분석하고 개선해주세요:');
    parts.push('');
    parts.push(`원본 프롬프트:\n"${fields.original_prompt || ''}"`);
    parts.push('');
    if (fields.improvement_goal) parts.push(`개선 목표:\n- ${fields.improvement_goal}`);
    parts.push('');
    parts.push('다음 관점에서 개선하세요:\n1. 명확성과 구체성\n2. 컨텍스트 충분성\n3. 출력 형식 지정\n4. 잠재적 모호함 제거');
    parts.push('');
    parts.push('개선된 프롬프트와 변경 이유를 설명해주세요.');
    if (fields.constraints) parts.push(`\n${fields.constraints}`);
    prompt = parts.join('\n');
  }

  // 바이브 코딩용 프롬프트 래핑
  if (purpose && purpose !== 'custom' && keyword) {
    const purposeInfo = PURPOSE_PRESETS.find(p => p.id === purpose);
    const vibeHeader = `[바이브 코딩 프로젝트]\n프로젝트 유형: ${purposeInfo?.label || purpose}\n핵심 키워드: ${keyword}\n\n`;
    prompt = vibeHeader + prompt;
  }

  const qualityReport = analyzePromptQuality(prompt, fields);

  // 체이닝이면 개별 단계 프롬프트도 함께 제공
  let chainData = null;
  if (techniqueId === 'prompt-chaining' && keyword) {
    const stepsRaw = fields.chain_steps || getChainSteps(purpose || 'custom', keyword);
    const steps = stepsRaw.split('\n').filter((s: string) => s.trim()).map((s: string) => s.replace(/^(Step\s*\d+\s*[:：]\s*)/i, '').trim());
    const role = getRoleForPurpose(purpose || 'custom');
    const purposeInfo = PURPOSE_PRESETS.find(p => p.id === purpose);
    chainData = steps.map((step: string, i: number) => {
      let sp = `${role}\n\n`;
      sp += `## Step ${i + 1}/${steps.length}: ${step}\n`;
      sp += `프로젝트: ${keyword} (${purposeInfo?.label || ''})\n`;
      if (i > 0) sp += `\n[이전 Step ${i}의 결과를 기반으로 진행]\n`;
      sp += `\n이 단계를 상세히 수행해주세요.`;
      if (i < steps.length - 1) sp += `\n\n결과는 다음 단계에서 사용할 수 있도록 구조화하세요.`;
      if (fields.constraints) sp += `\n\n제약: ${fields.constraints}`;
      return { step: i + 1, title: step, prompt: sp.trim() };
    });
  }

  // 컨텍스트 엔지니어링이면 문서 메타 정보도 제공
  let contextDocMeta = null;
  if (techniqueId === 'context-engineering') {
    const features = (fields.core_features || '').split('\n').filter((s: string) => s.trim());
    contextDocMeta = {
      filename: `${(fields.project_name || keyword || 'project').replace(/\s+/g, '-').toLowerCase()}-context.md`,
      sections: 8,
      features: features.length,
      tip: '이 문서를 context.md로 저장하여 AI 도구에 시스템 프롬프트로 제공하세요.',
    };
  }

  return c.json({
    prompt: prompt.trim(),
    technique: { name: tech.name, nameEn: tech.nameEn },
    qualityReport,
    tips: getPromptTips(techniqueId),
    chainData,
    contextDocMeta,
  });
});

// ===== 프롬프트 품질 분석 =====
function analyzePromptQuality(prompt: string, fields: Record<string, string>) {
  const checks = [];
  let score = 0;
  const total = 7;

  if (fields.role || fields.role_detail || fields.project_name) {
    checks.push({ label: '역할/주체 설정', passed: true, tip: '역할 또는 프로젝트 주체가 명확하게 지정되었습니다.' });
    score++;
  } else {
    checks.push({ label: '역할/주체 설정', passed: false, tip: '역할 또는 프로젝트명을 지정하면 더 전문적인 답변을 얻을 수 있습니다.' });
  }

  const taskLen = (fields.task || fields.project_goal || '').length;
  if (taskLen > 30) {
    checks.push({ label: '작업/목표 구체성', passed: true, tip: '작업이 충분히 구체적입니다.' });
    score++;
  } else {
    checks.push({ label: '작업/목표 구체성', passed: false, tip: '작업/목표 설명을 30자 이상으로 더 구체적으로 작성하세요.' });
  }

  if (fields.output_format) {
    checks.push({ label: '출력 형식 지정', passed: true, tip: '출력 형식이 명시되었습니다.' });
    score++;
  } else {
    checks.push({ label: '출력 형식 지정', passed: false, tip: '출력 형식을 지정하면 원하는 결과를 더 정확히 얻습니다.' });
  }

  if (fields.constraints) {
    checks.push({ label: '제약 조건', passed: true, tip: '제약 조건이 설정되었습니다.' });
    score++;
  } else {
    checks.push({ label: '제약 조건', passed: false, tip: '제약 조건을 추가하면 불필요한 출력을 줄입니다.' });
  }

  if (fields.context || fields.expertise || fields.core_features || (fields.role && fields.role.length > 20)) {
    checks.push({ label: '컨텍스트 제공', passed: true, tip: '충분한 배경 정보가 제공되었습니다.' });
    score++;
  } else {
    checks.push({ label: '컨텍스트 제공', passed: false, tip: '배경 정보를 추가하면 더 관련성 높은 답변을 얻습니다.' });
  }

  if (prompt.length > 100) {
    checks.push({ label: '충분한 정보량', passed: true, tip: '프롬프트에 충분한 정보가 포함되어 있습니다.' });
    score++;
  } else {
    checks.push({ label: '충분한 정보량', passed: false, tip: '프롬프트를 더 상세하게 작성하세요.' });
  }

  if (fields.tone) {
    checks.push({ label: '톤/스타일 지정', passed: true, tip: '응답의 톤이 지정되었습니다.' });
    score++;
  } else {
    checks.push({ label: '톤/스타일 지정', passed: false, tip: '톤을 지정하면 일관된 스타일의 응답을 받을 수 있습니다.' });
  }

  const percentage = Math.round((score / total) * 100);
  let grade = 'D';
  if (percentage >= 85) grade = 'S';
  else if (percentage >= 70) grade = 'A';
  else if (percentage >= 55) grade = 'B';
  else if (percentage >= 40) grade = 'C';

  return { checks, score, total, percentage, grade };
}

function getPromptTips(techniqueId: string) {
  const tipsMap: Record<string, string[]> = {
    'zero-shot': ['명확하고 구체적인 지시를 사용하세요.', '모호한 표현 대신 정확한 용어를 사용하세요.', '한 번에 하나의 작업만 요청하면 효과적입니다.'],
    'few-shot': ['예시는 2~5개가 적당합니다.', '예시의 형식을 일관되게 유지하세요.', '다양한 케이스를 포함하면 더 좋은 결과를 얻습니다.'],
    'chain-of-thought': ['"단계별로 생각해보세요"라는 지시가 핵심입니다.', '각 단계가 논리적으로 연결되도록 하세요.', '수학, 논리, 코드 디버깅에 특히 효과적입니다.'],
    'tree-of-thought': ['최소 3가지 이상의 접근법을 제시하세요.', '각 접근법이 서로 다른 관점을 반영하도록 하세요.', '비교 평가 기준을 명시하면 더 좋은 결과를 얻습니다.'],
    'role-prompting': ['구체적인 경력과 전문 분야를 명시하세요.', '역할에 맞는 페르소나를 자세히 설정하세요.', '복합 역할도 가능합니다.'],
    'prompt-chaining': ['각 단계의 출력이 다음 단계의 입력이 됩니다.', '단계를 3~5개로 나누는 것이 적당합니다.', '복잡한 프로젝트 기획에 매우 효과적입니다.'],
    'meta-prompting': ['원본 프롬프트를 먼저 사용해보고 개선하세요.', 'AI에게 변경 이유를 설명하도록 요청하세요.', '반복적으로 개선하면 최적의 프롬프트를 얻습니다.'],
    'context-engineering': ['프로젝트 전체 맥락을 먼저 설정하세요.', '이 문서를 시스템 프롬프트로 사용할 수 있습니다.', '기술 스택과 데이터 모델을 구체적으로 작성하면 효과가 큽니다.'],
    'harness': ['모든 섹션을 채울수록 좋습니다.', '바이브 코딩의 첫 단계로 프로젝트 전체 컨텍스트를 설정하세요.', '이 기법은 다른 기법들의 요소를 종합한 것입니다.'],
  };
  return tipsMap[techniqueId] || [];
}

// ===== 메인 페이지 =====
app.get('/', (c) => {
  return c.render(
    <div id="app-root">
      <nav class="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-3 cursor-pointer" onclick="location.reload()">
              <div class="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
                <i class="fas fa-wand-magic-sparkles text-white text-sm"></i>
              </div>
              <div>
                <h1 class="text-lg font-bold text-white leading-tight">PromptForge</h1>
                <p class="text-[10px] text-gray-500 -mt-0.5">AI 프롬프트 생성기</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button onclick="showGuide()" class="text-xs text-gray-400 hover:text-brand-400 transition-colors flex items-center gap-1.5">
                <i class="fas fa-book-open"></i>
                <span class="hidden sm:inline">가이드</span>
              </button>
              <button onclick="showHistory()" class="text-xs text-gray-400 hover:text-brand-400 transition-colors flex items-center gap-1.5">
                <i class="fas fa-clock-rotate-left"></i>
                <span class="hidden sm:inline">히스토리</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main class="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* 히어로 */}
        <section class="text-center mb-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400 text-xs mb-4">
            <i class="fas fa-wand-magic-sparkles"></i>
            바이브 코딩의 첫 단계, 완벽한 프롬프트 설계
          </div>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
            키워드 하나로<br />
            <span class="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">프로 레벨 프롬프트</span>를 자동 생성
          </h2>
          <p class="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            목적과 키워드만 입력하면 최적의 기법을 추천하고,<br class="hidden sm:inline" />
            컨텍스트 문서부터 프롬프트 체이닝까지 자동으로 작성해드립니다.
          </p>
        </section>

        {/* Step 1: 목적 + 키워드 */}
        <section id="step-purpose" class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
            <h3 class="text-lg font-semibold text-white">프로젝트 목적과 키워드를 입력하세요</h3>
          </div>
          <div id="purpose-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-3"></div>
          <div id="keyword-section" class="mt-4 hidden">
            <label class="block text-sm text-gray-400 mb-1.5">핵심 키워드를 입력하세요</label>
            <div class="flex gap-3">
              <input type="text" id="keyword-input" placeholder="예: 할일 관리 앱, 포트폴리오 사이트, 챗봇..."
                class="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                onkeydown="if(event.key==='Enter')requestRecommendation()" />
              <button onclick="requestRecommendation()" id="recommend-btn"
                class="px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap">
                <i class="fas fa-magic"></i>
                추천 받기
              </button>
            </div>
          </div>
        </section>

        {/* 추천 결과 영역 */}
        <section id="recommendation-section" class="mb-8 hidden">
          <div class="bg-gradient-to-r from-brand-500/5 to-purple-500/5 border border-brand-500/20 rounded-2xl p-6">
            <div class="flex items-center gap-2 mb-3">
              <i class="fas fa-robot text-brand-400"></i>
              <h4 class="text-sm font-semibold text-white">AI 추천 결과</h4>
              <span class="text-[10px] bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">자동 분석</span>
            </div>
            <p id="rec-reason" class="text-xs text-gray-400 mb-4 leading-relaxed"></p>
            <div class="flex flex-col sm:flex-row gap-3">
              <div id="rec-primary" class="flex-1"></div>
              <div id="rec-secondary" class="flex-1 space-y-2"></div>
            </div>
          </div>
        </section>

        {/* Step 2: 기법 선택 (수동) */}
        <section id="step-technique" class="mb-8 opacity-40 pointer-events-none transition-all duration-300">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-sm font-bold" id="step2-badge">2</div>
            <h3 class="text-lg font-semibold text-white">또는 직접 기법을 선택하세요</h3>
          </div>
          <p class="text-xs text-gray-500 mb-4 ml-11">추천 결과를 사용하거나, 아래에서 직접 선택할 수 있습니다.</p>
          <div id="technique-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"></div>
        </section>

        {/* Step 3: 필드 입력 */}
        <section id="step-fields" class="mb-8 hidden">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
            <h3 class="text-lg font-semibold text-white" id="fields-title">세부 정보를 입력하세요</h3>
          </div>
          <p class="text-xs text-gray-500 mb-4 ml-11" id="fields-subtitle">
            <span class="text-brand-400">자동 채워진 필드</span>를 확인하고 수정하세요. <span class="text-red-400">*</span> 표시는 필수입니다.
          </p>
          <div class="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <div id="fields-container" class="space-y-5"></div>
            <div class="mt-6 flex flex-col sm:flex-row gap-3">
              <button id="generate-btn" onclick="generatePrompt()"
                class="flex-1 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20">
                <i class="fas fa-wand-magic-sparkles"></i>프롬프트 생성
              </button>
              <button onclick="resetFields()" class="px-6 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all flex items-center justify-center gap-2">
                <i class="fas fa-rotate-left"></i>초기화
              </button>
            </div>
          </div>
        </section>

        {/* 결과 영역 */}
        <section id="result-section" class="hidden">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              <i class="fas fa-check text-xs"></i>
            </div>
            <h3 class="text-lg font-semibold text-white">생성된 프롬프트</h3>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-4">
              {/* 컨텍스트 문서 메타 정보 */}
              <div id="context-doc-section" class="hidden">
                <div class="bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-2xl p-5">
                  <div class="flex items-center gap-2 mb-3">
                    <i class="fas fa-scroll text-cyan-400"></i>
                    <h4 class="text-sm font-semibold text-white">컨텍스트 문서 생성됨</h4>
                    <span class="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">context.md</span>
                  </div>
                  <div id="context-doc-info"></div>
                </div>
              </div>

              {/* 메인 프롬프트 */}
              <div class="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                <div class="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-gray-900/80">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-file-code text-brand-400 text-sm"></i>
                    <span class="text-sm font-medium text-gray-300" id="result-technique-name">프롬프트</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button onclick="copyPrompt()" class="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5" id="copy-btn">
                      <i class="fas fa-copy"></i>복사
                    </button>
                    <button onclick="downloadPrompt()" class="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5">
                      <i class="fas fa-download"></i>다운로드
                    </button>
                  </div>
                </div>
                <div class="p-5">
                  <pre id="result-prompt" class="text-sm text-gray-200 whitespace-pre-wrap font-mono leading-relaxed"></pre>
                </div>
              </div>

              {/* 체이닝 단계별 프롬프트 */}
              <div id="chain-section" class="hidden">
                <div class="bg-gradient-to-r from-teal-500/5 to-green-500/5 border border-teal-500/20 rounded-2xl p-5">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                      <i class="fas fa-link text-teal-400"></i>
                      <h4 class="text-sm font-semibold text-white">단계별 프롬프트 체인</h4>
                      <span class="text-[10px] bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full">각 단계를 순서대로 실행</span>
                    </div>
                    <button onclick="downloadAllChainSteps()" class="text-[10px] text-teal-400 hover:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5">
                      <i class="fas fa-download"></i>전체 다운로드
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 mb-3"><i class="fas fa-info-circle mr-1"></i>각 단계를 클릭하여 펼치고, 개별 복사할 수 있습니다. Step 1부터 순서대로 AI에게 전달하세요.</p>
                  <div id="chain-content"></div>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <div class="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2"><i class="fas fa-chart-simple text-brand-400"></i>품질 리포트</h4>
                <div class="flex items-center gap-4 mb-4">
                  <div id="quality-grade" class="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black"></div>
                  <div>
                    <div class="text-2xl font-bold text-white"><span id="quality-score">0</span><span class="text-sm text-gray-500">%</span></div>
                    <div class="text-xs text-gray-500" id="quality-label">분석 중...</div>
                  </div>
                </div>
                <div id="quality-checks" class="space-y-2"></div>
              </div>
              <div class="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2"><i class="fas fa-lightbulb text-yellow-400"></i>팁</h4>
                <ul id="tips-list" class="space-y-2 text-xs text-gray-400"></ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 가이드 모달 */}
      <div id="guide-modal" class="fixed inset-0 z-[100] hidden">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closeGuide()"></div>
        <div class="relative max-w-3xl mx-auto mt-20 bg-gray-900 border border-gray-800 rounded-2xl max-h-[80vh] overflow-y-auto m-4">
          <div class="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h3 class="text-lg font-bold text-white flex items-center gap-2"><i class="fas fa-book-open text-brand-400"></i>프롬프트 엔지니어링 가이드</h3>
            <button onclick="closeGuide()" class="text-gray-400 hover:text-white"><i class="fas fa-xmark text-lg"></i></button>
          </div>
          <div class="p-6 space-y-6 text-sm text-gray-300" id="guide-content"></div>
        </div>
      </div>

      {/* 히스토리 모달 */}
      <div id="history-modal" class="fixed inset-0 z-[100] hidden">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closeHistory()"></div>
        <div class="relative max-w-2xl mx-auto mt-20 bg-gray-900 border border-gray-800 rounded-2xl max-h-[80vh] overflow-y-auto m-4">
          <div class="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h3 class="text-lg font-bold text-white flex items-center gap-2"><i class="fas fa-clock-rotate-left text-brand-400"></i>생성 히스토리</h3>
            <div class="flex items-center gap-2">
              <button onclick="clearHistory()" class="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded">전체 삭제</button>
              <button onclick="closeHistory()" class="text-gray-400 hover:text-white"><i class="fas fa-xmark text-lg"></i></button>
            </div>
          </div>
          <div class="p-6" id="history-content"></div>
        </div>
      </div>
    </div>
  )
})

export default app
