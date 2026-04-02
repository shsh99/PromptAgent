// ===== data.ts — 정적 데이터 (기법, 필드, 목적, 추천 매핑) =====

export const TECHNIQUES: Record<string, any> = {
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
    description: '프로젝트 전체 맥락을 구조화하는 운영 문서입니다. 목표, 구조, 규칙, 리뷰 기준, 테스트 전략까지 포함해 AI가 팀의 기준을 이해하도록 만듭니다.',
    fields: ['project_name', 'project_goal', 'workflow_state', 'non_goal', 'target_user', 'tech_stack', 'project_structure', 'existing_assets', 'core_features', 'data_model', 'workflow_steps', 'code_conventions', 'branch_strategy', 'code_review_rules', 'testing_rules', 'deployment_rules', 'risks', 'appendix_docs', 'constraints', 'tone'],
  },
  'harness': {
    id: 'harness', name: '하네스 엔지니어링', nameEn: 'Harness Engineering',
    icon: 'fa-gears', color: 'indigo', difficulty: '고급', category: 'harness',
    description: 'AI 에이전트를 안전하고 예측 가능하게 운용하는 제어 구조입니다. 가드레일, 데이터 거버넌스, 모니터링과 피드백 루프까지 포함한 실행 매뉴얼을 만듭니다.',
    fields: ['role', 'context', 'task', 'goal', 'workflow_state', 'non_goal', 'must_have', 'should_have', 'nice_to_have', 'project_structure', 'code_conventions', 'branch_strategy', 'code_review_rules', 'input_guardrails', 'output_guardrails', 'data_governance', 'access_policy', 'monitoring_rules', 'feedback_loop', 'failure_response', 'human_in_the_loop', 'audit_log_rules', 'compliance_rules', 'rollback_plan', 'appendix_docs', 'output_format', 'tone', 'constraints', 'example'],
  },
};

export const FIELD_DEFINITIONS: Record<string, any> = {
  role:              { label: '역할 (Role)',                placeholder: '예: 당신은 10년 경력의 시니어 풀스택 개발자입니다.',                                                      type: 'text',     required: true },
  role_detail:       { label: '세부 역할',                   placeholder: '예: 15년 경력의 UX/UI 디자인 전문가이자 사용자 심리학 연구자',                                           type: 'text',     required: true },
  expertise:         { label: '전문 분야',                   placeholder: '예: 모바일 앱 디자인, 사용자 리서치, A/B 테스트 전문',                                                   type: 'text',     required: false },
  context:           { label: '배경 컨텍스트',               placeholder: '예: B2B SaaS 스타트업에서 MVP를 개발 중이며, 사용자는 중소기업 경영자입니다.',                         type: 'textarea', required: false },
  task:              { label: '작업 목표',                   placeholder: '예: React와 TypeScript를 사용한 대시보드 컴포넌트를 설계해주세요.',                                      type: 'textarea', required: true },
  input_data:        { label: '입력 데이터',                 placeholder: '예: 사용자 데이터 JSON, 기존 코드 스니펫, 참고 문서 등',                                               type: 'textarea', required: false },
  output_format:     { label: '출력 형식',                   placeholder: '예: 마크다운 표, 코드 블록, 단계별 가이드, JSON 등',                                                   type: 'text',     required: false },
  tone:              { label: '톤 & 스타일',                 placeholder: '예: 전문적이고 간결한 / 친근하고 쉬운 / 교육적인',                                                     type: 'text',     required: false },
  constraints:       { label: '제약 조건',                   placeholder: '예: 500단어 이내, 한국어로 작성, 초보자도 이해 가능하게',                                              type: 'textarea', required: false },
  examples:          { label: '예시 (2~5개)',                placeholder: '입력: 사과 → 출력: 과일\n입력: 강아지 → 출력: 동물',                                                   type: 'textarea', required: true },
  actual_input:      { label: '실제 입력',                   placeholder: '예시 패턴을 따라 처리할 실제 입력값',                                                                   type: 'textarea', required: true },
  steps:             { label: '사고 단계',                   placeholder: '1단계: 문제 분석\n2단계: 해결 방안 도출\n3단계: 최적 솔루션 선택',                                      type: 'textarea', required: false },
  approaches:        { label: '탐색할 접근법들',             placeholder: '접근법 A: 성능 최적화 관점\n접근법 B: 사용자 경험 관점\n접근법 C: 비용 효율 관점',                     type: 'textarea', required: false },
  chain_steps:       { label: '체인 단계들',                 placeholder: 'Step 1: 요구사항 분석\nStep 2: 아키텍처 설계\nStep 3: 구현 계획 수립',                                  type: 'textarea', required: true },
  original_prompt:   { label: '개선할 원본 프롬프트',        placeholder: '개선하고 싶은 기존 프롬프트를 입력하세요',                                                              type: 'textarea', required: true },
  improvement_goal:  { label: '개선 목표',                   placeholder: '예: 더 구체적인 코드 예시를 포함하도록',                                                               type: 'textarea', required: true },
  example:           { label: '참고 예시',                   placeholder: '원하는 출력의 예시를 입력하세요',                                                                       type: 'textarea', required: false },
  // 컨텍스트 엔지니어링 / 하네스 전용
  project_name:      { label: '프로젝트 이름',               placeholder: '예: PromptBuilder, TaskFlow, CodeBuddy',                                                             type: 'text',     required: true },
  project_goal:      { label: '프로젝트 목표',               placeholder: '예: 팀이 일관된 기준으로 프롬프트와 운영 문서를 생성할 수 있는 웹앱 구축',                           type: 'textarea', required: true },
  non_goal:          { label: '비목표',                      placeholder: '예: 이번 작업에서 인증 구조 전면 개편은 제외',                                                         type: 'textarea', required: false },
  target_user:       { label: '대상 사용자',                 placeholder: '예: PM, 디자이너, 개발자, 운영 담당자',                                                               type: 'text',     required: true },
  tech_stack:        { label: '기술 스택',                   placeholder: '예: Hono, TypeScript, Vite, Cloudflare Pages',                                                       type: 'text',     required: false },
  project_structure: { label: '프로젝트 구조',               placeholder: '예: webapp/src, webapp/public, docs, tests, scripts',                                               type: 'textarea', required: false },
  existing_assets:   { label: '기존 자산 및 재사용 대상',    placeholder: '예: 공통 버튼 컴포넌트, 기존 API, 기존 운영 문서',                                                   type: 'textarea', required: false },
  core_features:     { label: '핵심 기능',                   placeholder: '예: 기법 추천\n운영 문서 생성\n품질 점검\n다운로드\n히스토리 저장',                                  type: 'textarea', required: true },
  data_model:        { label: '주요 데이터 모델',            placeholder: '예: PromptTemplate, Technique, GuideSection, ReviewChecklist',                                       type: 'textarea', required: false },
  workflow_steps:    { label: '워크플로우 단계',             placeholder: '예: 컨텍스트 확보\n요구사항 정의\nUX 설계\n구현 계획\n리스크 분석\n테스트',                         type: 'textarea', required: false },
  code_conventions:  { label: '코드 컨벤션',                 placeholder: '예: 함수명 camelCase, 컴포넌트 PascalCase, 중복 로직은 helper로 분리',                              type: 'textarea', required: false },
  branch_strategy:   { label: '브랜치 규칙',                 placeholder: '예: main 보호, feature/* 브랜치 사용, squash merge',                                                 type: 'textarea', required: false },
  code_review_rules: { label: '코드 리뷰 규칙',              placeholder: '예: 리뷰어 1명 이상 승인, 동작 변경은 근거와 테스트 결과 포함',                                      type: 'textarea', required: false },
  testing_rules:     { label: '테스트 규칙',                 placeholder: '예: 핵심 시나리오 수동 검증, 신규 API는 최소 1개 테스트 추가',                                       type: 'textarea', required: false },
  deployment_rules:  { label: '배포 규칙',                   placeholder: '예: main 기준 배포, 배포 전 빌드 확인, 실패 시 즉시 롤백',                                           type: 'textarea', required: false },
  risks:             { label: '리스크 및 제약',              placeholder: '예: 외부 API rate limit, 민감정보 처리, UI 깨짐 가능성, 일정 제약',                                  type: 'textarea', required: false },
  appendix_docs:     { label: 'Appendix / 참고 문서',        placeholder: '예: API 명세, 디자인 링크, PRD, 외부 아티클, 운영 가이드 URL',                                       type: 'textarea', required: false },
  goal:              { label: '핵심 목표',                   placeholder: '예: 안전하고 예측 가능하게 AI 작업을 수행하도록 실행 규칙 정의',                                     type: 'textarea', required: true },
  workflow_state:    {
    label: '작업 상태',
    placeholder: '현재 작업이 어떤 단계인지 선택하세요',
    type: 'select',
    required: true,
    options: [
      { value: 'new', label: '새로 시작' },
      { value: 'in-progress', label: '진행 중' },
      { value: 'done', label: '완료 보고' },
      { value: 'blocked', label: '막힘 / 수정 요청' },
    ],
  },
  must_have:         { label: 'Must-have',                   placeholder: '반드시 지켜야 할 요구사항을 줄바꿈으로 작성',                                                          type: 'textarea', required: false },
  should_have:       { label: 'Should-have',                 placeholder: '가능하면 포함할 요구사항을 줄바꿈으로 작성',                                                           type: 'textarea', required: false },
  nice_to_have:      { label: 'Nice-to-have',                placeholder: '있으면 좋은 선택 요소를 줄바꿈으로 작성',                                                             type: 'textarea', required: false },
  input_guardrails:  { label: '입력 가드레일',               placeholder: '예: 기밀정보 입력 차단, 프롬프트 인젝션 탐지, 범위 밖 요청 거부',                                   type: 'textarea', required: false },
  output_guardrails: { label: '출력 가드레일',               placeholder: '예: 환각 검출, 유해 표현 차단, 근거 없는 확정 표현 금지',                                           type: 'textarea', required: false },
  data_governance:   { label: '데이터 거버넌스',             placeholder: '예: 민감정보 마스킹, 로그 보관 정책, 데이터 분류 기준',                                             type: 'textarea', required: false },
  access_policy:     { label: '접근 권한 정책',              placeholder: '예: 관리자만 배포 가능, 고객 데이터는 승인된 사용자만 조회 가능',                                    type: 'textarea', required: false },
  monitoring_rules:  { label: '모니터링 규칙',               placeholder: '예: 실패율, 응답 시간, 이상 출력 사례를 기록하고 추적',                                             type: 'textarea', required: false },
  feedback_loop:     { label: '피드백 루프',                 placeholder: '예: 실패 사례를 문서에 반영하고 다음 작업 가이드를 갱신',                                           type: 'textarea', required: false },
  failure_response:  { label: '실패 대응 방식',              placeholder: '예: 오류 발생 시 작업 중단, 원인 요약, 복구 절차 제시',                                             type: 'textarea', required: false },
  human_in_the_loop: { label: '사람 승인 지점',              placeholder: '예: 배포 전 승인, DB 변경 전 승인, 정책 변경 전 승인',                                             type: 'textarea', required: false },
  audit_log_rules:   { label: '감사 로그 규칙',              placeholder: '예: 누가 어떤 변경을 했는지 PR과 로그에 남김',                                                       type: 'textarea', required: false },
  compliance_rules:  { label: '컴플라이언스 규칙',           placeholder: '예: 개인정보 최소 수집, 외부 전송 금지, 사내 정책 준수',                                           type: 'textarea', required: false },
  rollback_plan:     { label: '롤백 계획',                   placeholder: '예: 실패 시 이전 배포 복구, 기능 플래그 비활성화, 데이터 복원 절차',                               type: 'textarea', required: false },
};

export const PURPOSE_PRESETS = [
  { id: 'web-app',       label: '웹 애플리케이션', icon: 'fa-globe',               keywords: '웹앱, SPA, 프론트엔드, 백엔드, API' },
  { id: 'mobile-app',    label: '모바일 앱',        icon: 'fa-mobile-screen',       keywords: '모바일, iOS, Android, Flutter' },
  { id: 'ai-tool',       label: 'AI/ML 도구',       icon: 'fa-robot',               keywords: 'AI, 머신러닝, LLM, 챗봇' },
  { id: 'data-analysis', label: '데이터 분석',      icon: 'fa-chart-line',          keywords: '데이터, 분석, 시각화' },
  { id: 'automation',    label: '업무 자동화',       icon: 'fa-wand-magic-sparkles', keywords: '자동화, 워크플로, 스크립트' },
  { id: 'content',       label: '콘텐츠 생성',      icon: 'fa-pen-fancy',           keywords: '글쓰기, 블로그, 마케팅' },
  { id: 'game',          label: '게임 개발',         icon: 'fa-gamepad',             keywords: '게임, Unity, 인터랙티브' },
  { id: 'custom',        label: '직접 입력',         icon: 'fa-keyboard',            keywords: '' },
];

export const PURPOSE_RECOMMENDATIONS: Record<string, any> = {
  'web-app':       { primary: 'harness',             secondary: ['context-engineering', 'prompt-chaining'], reason: '웹 애플리케이션은 역할/기술스택/기능/제약 등 복합적 맥락이 필요합니다. 하네스 엔지니어링으로 전체 구조를 잡고, 컨텍스트 문서로 프로젝트 스펙을 정리한 뒤, 프롬프트 체이닝으로 단계별 개발을 진행하세요.' },
  'mobile-app':    { primary: 'harness',             secondary: ['context-engineering', 'chain-of-thought'], reason: '모바일 앱은 플랫폼, UI/UX, 성능 등 고려사항이 많습니다. 하네스로 전체 앱 설계를 잡고, 컨텍스트 문서로 플랫폼별 요구사항을 정리하세요.' },
  'ai-tool':       { primary: 'context-engineering', secondary: ['prompt-chaining', 'tree-of-thought'],     reason: 'AI 도구는 모델 선택, 파이프라인, 데이터 흐름 등 복잡한 아키텍처 결정이 필요합니다. 컨텍스트 엔지니어링으로 전체 구조를 정의하고, 사고 트리로 기술 선택지를 비교하세요.' },
  'data-analysis': { primary: 'chain-of-thought',    secondary: ['role-prompting', 'prompt-chaining'],      reason: '데이터 분석은 단계적 사고가 핵심입니다. CoT로 분석 절차를 체계화하고, 역할 프롬프트로 데이터 전문가 관점을 확보하세요.' },
  'automation':    { primary: 'prompt-chaining',     secondary: ['harness', 'chain-of-thought'],            reason: '업무 자동화는 워크플로 분해가 핵심입니다. 프롬프트 체이닝으로 자동화 단계를 설계하고, 하네스로 전체 시스템 요구사항을 잡으세요.' },
  'content':       { primary: 'role-prompting',      secondary: ['few-shot', 'zero-shot'],                  reason: '콘텐츠 생성은 톤/스타일/전문성이 핵심입니다. 역할 프롬프트로 전문 작가 페르소나를 설정하고, 퓨샷으로 원하는 문체 예시를 제공하세요.' },
  'game':          { primary: 'harness',             secondary: ['context-engineering', 'tree-of-thought'], reason: '게임 개발은 세계관, 게임 메카닉, 기술 스택 등 복합 요소가 있습니다. 하네스로 게임 디자인 문서를 구조화하고, 사고 트리로 설계 방향을 비교하세요.' },
  'custom':        { primary: 'harness',             secondary: ['context-engineering', 'zero-shot'],       reason: '범용 프로젝트에는 하네스 엔지니어링이 가장 유연합니다. 프로젝트 규모에 따라 간단하면 제로샷, 복잡하면 컨텍스트 엔지니어링을 활용하세요.' },
};
Object.assign(TECHNIQUES['zero-shot'], {
  description: '예시 없이 명확한 지시만으로 시작하는 기본 방식입니다. 범위가 분명하고 단순한 작업에 적합합니다.',
})

Object.assign(TECHNIQUES['few-shot'], {
  description: '좋은 예시를 함께 주어 출력 형식과 패턴을 학습시키는 방식입니다. 예시의 품질이 결과 품질을 크게 좌우합니다.',
})

Object.assign(TECHNIQUES['chain-of-thought'], {
  description: '복잡한 판단을 단계별로 분해해 사고하도록 유도하는 방식입니다. 계산, 분석, 비교처럼 생각 과정이 필요한 작업에 적합합니다.',
})

Object.assign(TECHNIQUES['tree-of-thought'], {
  description: '여러 후보 경로를 비교하고 탐색해 더 나은 해답을 고르는 전략입니다. 단, 실무에서는 탐색 비용이 커서 신중히 써야 합니다.',
})

Object.assign(TECHNIQUES['role-prompting'], {
  description: '역할과 관점을 고정해 톤, 판단 기준, 문체를 안정화하는 방식입니다. 역할만으로 완성도를 보장하지는 않습니다.',
})

Object.assign(TECHNIQUES['prompt-chaining'], {
  description: '하나의 복잡한 과업을 여러 단계의 프롬프트로 나누어 처리하는 방식입니다. 단계 간 인계가 명확할수록 안정적입니다.',
})

Object.assign(TECHNIQUES['meta-prompting'], {
  description: '프롬프트 자체를 평가하고 개선하는 상위 프롬프트 기법입니다. 생성 결과보다 프롬프트 품질 개선에 초점이 있습니다.',
})

Object.assign(TECHNIQUES['context-engineering'], {
  description: '문서, 상태, 도구, 히스토리를 포함한 전체 컨텍스트를 설계하는 방식입니다. 긴 작업이나 프로젝트형 과업에 유리합니다.',
})

Object.assign(TECHNIQUES['harness'], {
  description: '에이전트 실행 환경을 설계하는 방식으로, 초기화·도구·기록·검증·인계·복구까지 포함합니다. 단순 도구 호출보다 넓은 개념입니다.',
  fields: ['role', 'problem_definition', 'context', 'input_data', 'task', 'goal', 'reasoning', 'evaluation_criteria', 'workflow_state', 'non_goal', 'must_have', 'should_have', 'nice_to_have', 'project_structure', 'code_conventions', 'branch_strategy', 'code_review_rules', 'input_guardrails', 'output_guardrails', 'data_governance', 'access_policy', 'monitoring_rules', 'feedback_loop', 'failure_response', 'human_in_the_loop', 'audit_log_rules', 'compliance_rules', 'rollback_plan', 'appendix_docs', 'output_format', 'tone', 'constraints', 'example'],
})

Object.assign(FIELD_DEFINITIONS, {
  problem_definition: { label: '문제 정의', placeholder: '예: 어떤 문제를 해결하는지 한 문장으로 적어주세요.', type: 'textarea', required: true },
  reasoning: { label: '추론 / 진행 방식', placeholder: '예: 먼저 문제를 정의하고, 다음에 입력과 출력, 그다음 검증 기준을 정리하세요.', type: 'textarea', required: false },
  evaluation_criteria: { label: '평가 기준', placeholder: '예: 정확성, 형식 준수, 누락 여부, 실행 가능성을 기준으로 확인하세요.', type: 'textarea', required: false },
  feedback_loop: { label: '피드백 루프', placeholder: '예: 결과를 보고 무엇을 수정할지, 다음 버전에서 무엇을 바꿀지 적어주세요.', type: 'textarea', required: false },
})
