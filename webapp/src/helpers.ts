// ===== helpers.ts — 자동 필드 생성 & 분석 헬퍼 함수 =====
import { PURPOSE_PRESETS } from './data'

// ── 목적별 기본값 헬퍼 ────────────────────────────────────────────
export function getRoleForPurpose(purpose: string): string {
  const map: Record<string, string> = {
    'web-app':       '당신은 15년 경력의 시니어 풀스택 웹 개발자이자 소프트웨어 아키텍트입니다.',
    'mobile-app':    '당신은 10년 경력의 모바일 앱 개발 전문가이자 UI/UX 디자이너입니다.',
    'ai-tool':       '당신은 AI/ML 엔지니어이자 LLM 애플리케이션 아키텍트입니다.',
    'data-analysis': '당신은 시니어 데이터 분석가이자 비즈니스 인텔리전스 전문가입니다.',
    'automation':    '당신은 DevOps 엔지니어이자 워크플로 자동화 전문가입니다.',
    'content':       '당신은 10년 경력의 콘텐츠 전략가이자 SEO 전문가입니다.',
    'game':          '당신은 시니어 게임 개발자이자 게임 디자이너입니다.',
    'custom':        '당신은 다양한 분야에 정통한 시니어 소프트웨어 엔지니어입니다.',
  };
  return map[purpose] || map['custom'];
}

export function getRoleDetail(purpose: string): string {
  const map: Record<string, string> = {
    'web-app':       '15년 경력의 시니어 풀스택 웹 개발자이자 소프트웨어 아키텍트',
    'mobile-app':    '10년 경력의 크로스플랫폼 모바일 앱 개발 전문가',
    'ai-tool':       'AI/ML 엔지니어이자 LLM 애플리케이션 아키텍트',
    'data-analysis': '시니어 데이터 분석가이자 BI 전문가',
    'automation':    'DevOps 엔지니어이자 프로세스 자동화 컨설턴트',
    'content':       '10년 경력의 콘텐츠 전략가이자 카피라이터',
    'game':          '시니어 게임 개발자이자 게임 디자인 전문가',
    'custom':        '다양한 분야에 정통한 시니어 소프트웨어 엔지니어',
  };
  return map[purpose] || map['custom'];
}

export function getExpertise(purpose: string): string {
  const map: Record<string, string> = {
    'web-app':       'React/Next.js, TypeScript, Node.js, PostgreSQL, 클라우드 인프라, CI/CD 전문',
    'mobile-app':    'React Native, Flutter, Swift, Kotlin, 앱스토어 배포 경험 다수',
    'ai-tool':       'LLM 파인튜닝, RAG, 프롬프트 최적화, Python, TensorFlow, PyTorch 전문',
    'data-analysis': 'Python, SQL, Tableau, Power BI, 통계 모델링, 데이터 시각화 전문',
    'automation':    'CI/CD, Docker, AWS, GitHub Actions, 쉘 스크립팅, API 통합 전문',
    'content':       'SEO, 소셜 미디어, 이메일 마케팅, 브랜드 스토리텔링 전문',
    'game':          'Unity, Unreal Engine, C#, 게임 메카닉, 레벨 디자인 전문',
    'custom':        '웹, 모바일, 클라우드, 데이터 분야 폭넓은 경험',
  };
  return map[purpose] || map['custom'];
}

export function getTargetUser(purpose: string): string {
  const map: Record<string, string> = {
    'web-app':       '일반 사용자 및 비즈니스 관리자',
    'mobile-app':    '스마트폰 사용자 (20~40대)',
    'ai-tool':       'AI 도구를 활용하려는 개발자 및 비즈니스 사용자',
    'data-analysis': '데이터 기반 의사결정이 필요한 팀장/경영진',
    'automation':    '반복 업무를 줄이고 싶은 팀원/관리자',
    'content':       '콘텐츠를 생산하는 마케터/블로거',
    'game':          '게임을 즐기는 일반 유저 (10~30대)',
    'custom':        '해당 프로젝트의 실제 사용자',
  };
  return map[purpose] || map['custom'];
}

export function getTechStack(purpose: string): string {
  const map: Record<string, string> = {
    'web-app':       'React, TypeScript, Hono, Tailwind CSS, Cloudflare Pages, D1(SQLite)',
    'mobile-app':    'React Native 또는 Flutter, TypeScript, Expo, Firebase',
    'ai-tool':       'Python, FastAPI, LangChain, OpenAI API, React 프론트엔드',
    'data-analysis': 'Python, Pandas, Matplotlib, Streamlit, SQL',
    'automation':    'Node.js, GitHub Actions, Docker, REST API',
    'content':       'Next.js, MDX, Tailwind CSS, Vercel',
    'game':          'Unity, C#, Firebase, Photon (멀티플레이)',
    'custom':        '프로젝트 요구사항에 맞는 최적의 스택',
  };
  return map[purpose] || map['custom'];
}

export function getContextDetail(purpose: string): string {
  const map: Record<string, string> = {
    'web-app':       '반응형 웹 애플리케이션으로 데스크톱과 모바일 모두 지원해야 합니다. SEO와 성능 최적화가 중요합니다.',
    'mobile-app':    '크로스플랫폼 모바일 앱으로 iOS/Android 모두 지원해야 합니다. 네이티브 수준의 UX가 중요합니다.',
    'ai-tool':       'AI/ML 기반 도구로 사용자 친화적 인터페이스와 정확한 결과가 중요합니다.',
    'data-analysis': '데이터를 수집, 분석, 시각화하여 인사이트를 도출하는 것이 목표입니다.',
    'automation':    '반복적인 수작업을 자동화하여 생산성을 높이는 것이 핵심입니다.',
    'content':       '고품질 콘텐츠를 효율적으로 생산하고 관리하는 시스템입니다.',
    'game':          '사용자에게 몰입감 있는 게임 경험을 제공하는 것이 목표입니다.',
    'custom':        '사용자 요구사항에 맞는 최적의 솔루션을 설계합니다.',
  };
  return map[purpose] || map['custom'];
}

export function getCoreFeatures(purpose: string, keyword: string): string {
  const map: Record<string, string> = {
    'web-app':       `사용자 인증 (회원가입/로그인/소셜 로그인)\n${keyword} 핵심 기능 (CRUD)\n대시보드 (데이터 시각화)\n반응형 UI/UX\n검색 및 필터링\n설정 및 프로필 관리`,
    'mobile-app':    `온보딩 및 사용자 인증\n${keyword} 핵심 기능\n푸시 알림\n오프라인 지원\n설정 및 프로필\n앱 내 결제 (필요시)`,
    'ai-tool':       `AI 모델 연동 (API 호출)\n${keyword} 핵심 기능\n입력/출력 인터페이스\n히스토리 관리\n결과 저장 및 공유`,
    'data-analysis': `데이터 수집 및 업로드\n${keyword} 분석 기능\n시각화 대시보드 (차트/그래프)\n리포트 생성 및 다운로드\n필터링 및 드릴다운`,
    'automation':    `워크플로 정의 및 관리\n${keyword} 자동화 로직\n트리거 및 스케줄링\n실행 로그 및 모니터링\n알림 (이메일/슬랙)`,
    'content':       `콘텐츠 작성 에디터\n${keyword} 관련 기능\nSEO 최적화 도구\n미리보기 및 퍼블리시\n카테고리/태그 관리`,
    'game':          `게임 메카닉 (핵심 루프)\n${keyword} 관련 게임 요소\n사용자 프로필 및 진행 상황\n리더보드 및 업적\n설정 및 사운드 관리`,
    'custom':        `${keyword} 핵심 기능\n사용자 인증\n데이터 관리 (CRUD)\nUI/UX\n검색 및 필터링`,
  };
  return map[purpose] || map['custom'];
}

export function getDataModel(purpose: string, keyword: string): string {
  const first = keyword.split(/\s+/)[0] || 'Item';
  const map: Record<string, string> = {
    'web-app':       `User (id, email, name, role, created_at)\n${first} (id, title, description, status, user_id, created_at, updated_at)\nCategory (id, name, slug)`,
    'mobile-app':    `User (id, email, name, avatar, settings)\n${first} (id, title, content, user_id, synced_at)\nNotification (id, type, message, read, user_id)`,
    'ai-tool':       `User (id, email, api_key_hash)\nConversation (id, title, model, user_id)\nMessage (id, role, content, conversation_id, tokens)`,
    'data-analysis': `Dataset (id, name, source, format, user_id)\nAnalysis (id, type, parameters, result, dataset_id)\nVisualization (id, type, config, analysis_id)`,
    'automation':    `Workflow (id, name, trigger, status, user_id)\nStep (id, action, config, order, workflow_id)\nExecution (id, status, log, workflow_id, started_at)`,
    'content':       `Post (id, title, content, status, seo_meta, author_id)\nCategory (id, name, slug)\nMedia (id, url, type, post_id)`,
    'game':          `Player (id, username, level, xp, coins)\nGameSession (id, score, duration, player_id)\nAchievement (id, name, condition, icon)`,
    'custom':        `User (id, email, name, created_at)\n${first} (id, title, data, user_id)`,
  };
  return map[purpose] || map['custom'];
}

export function getChainSteps(purpose: string, keyword: string): string {
  const map: Record<string, string> = {
    'web-app':       `1단계: "${keyword}" 프로젝트 요구사항 분석 및 기능 명세 작성\n2단계: 기술 스택 결정 및 프로젝트 아키텍처 설계\n3단계: 데이터베이스 스키마 및 API 엔드포인트 설계\n4단계: UI/UX 와이어프레임 및 컴포넌트 구조 설계\n5단계: 핵심 기능 구현 코드 작성`,
    'mobile-app':    `1단계: "${keyword}" 앱 요구사항 및 화면 흐름 정의\n2단계: 기술 스택 및 앱 아키텍처 설계\n3단계: UI/UX 디자인 및 네비게이션 구조\n4단계: 핵심 기능 및 API 연동 구현\n5단계: 테스트 및 앱스토어 배포 준비`,
    'ai-tool':       `1단계: "${keyword}" AI 도구 기능 정의 및 모델 선택\n2단계: 데이터 파이프라인 및 프롬프트 설계\n3단계: 백엔드 API 및 모델 연동 구현\n4단계: 프론트엔드 인터페이스 구현\n5단계: 테스트 및 프롬프트 최적화`,
    'data-analysis': `1단계: "${keyword}" 분석 목표 및 데이터 소스 정의\n2단계: 데이터 수집 및 전처리 파이프라인 설계\n3단계: 분석 로직 및 통계 모델 구현\n4단계: 시각화 대시보드 및 리포트 생성\n5단계: 인사이트 도출 및 결과 검증`,
    'automation':    `1단계: "${keyword}" 자동화 대상 워크플로 분석\n2단계: 자동화 아키텍처 및 트리거 설계\n3단계: 핵심 자동화 스크립트 구현\n4단계: 모니터링 및 알림 시스템 구축\n5단계: 테스트 및 점진적 배포`,
    'content':       `1단계: "${keyword}" 콘텐츠 전략 및 타겟 오디언스 분석\n2단계: 콘텐츠 구조 및 톤/스타일 가이드 설정\n3단계: 핵심 콘텐츠 초안 작성\n4단계: SEO 최적화 및 편집\n5단계: 퍼블리싱 및 성과 측정 계획`,
    'game':          `1단계: "${keyword}" 게임 컨셉 및 핵심 메카닉 설계\n2단계: 게임 아키텍처 및 기술 스택 결정\n3단계: 핵심 게임 로직 및 시스템 구현\n4단계: UI/UX 및 비주얼 에셋 설계\n5단계: 플레이테스트 및 밸런싱`,
    'custom':        `1단계: "${keyword}" 프로젝트 요구사항 분석\n2단계: 기술 스택 및 아키텍처 설계\n3단계: 핵심 기능 구현\n4단계: UI/UX 설계 및 구현\n5단계: 테스트 및 배포`,
  };
  return map[purpose] || map['custom'];
}

export function getApproaches(purpose: string, keyword: string): string {
  const map: Record<string, string> = {
    'web-app':       `접근법 A - SSR 기반: Next.js + PostgreSQL (SEO 우수, 초기 렌더링 빠름)\n접근법 B - SPA 기반: React + Hono + D1 (개발 빠름, 엣지 배포 용이)\n접근법 C - 풀스택 프레임워크: Remix/SvelteKit + Supabase (통합 개발 경험)`,
    'mobile-app':    `접근법 A - React Native: 코드 재사용, 대규모 커뮤니티, JS 생태계\n접근법 B - Flutter: 네이티브 성능, 아름다운 UI, Dart 학습 필요\n접근법 C - Native: Swift/Kotlin, 최상의 성능, 플랫폼별 개발`,
    'ai-tool':       `접근법 A - OpenAI API 기반: GPT-4 활용, 빠른 프로토타이핑\n접근법 B - 오픈소스 모델: LLaMA/Mistral, 커스터마이징 자유, 비용 절감\n접근법 C - 하이브리드: 경량 모델 + API 폴백, 비용과 품질 균형`,
    'data-analysis': `접근법 A - Python + Jupyter: 유연한 분석, 풍부한 라이브러리\n접근법 B - BI 도구 (Tableau/Power BI): 시각화 우수, 비개발자 친화\n접근법 C - 웹 대시보드: Streamlit/Dash, 공유 편리, 자동화 가능`,
    'automation':    `접근법 A - 코드 기반: Python/Node.js 스크립트, 완전한 제어\n접근법 B - 노코드/로우코드: Zapier/n8n, 빠른 설정, 유지보수 쉬움\n접근법 C - 하이브리드: 핵심은 코드, 연동은 노코드`,
    'content':       `접근법 A - AI 중심: LLM 기반 자동 생성 + 편집\n접근법 B - 템플릿 기반: 사전 정의된 구조 활용\n접근법 C - 협업 기반: AI 초안 + 인간 검토 워크플로`,
    'game':          `접근법 A - Unity: C#, 크로스플랫폼, 에셋 스토어 풍부\n접근법 B - Unreal Engine: C++/Blueprint, 고품질 그래픽\n접근법 C - 웹 기반: Phaser/Three.js, 접근성 높음, 설치 불필요`,
    'custom':        `접근법 A - 빠른 프로토타이핑: 최소 기능 제품(MVP) 우선\n접근법 B - 견고한 설계: 확장성 있는 아키텍처 우선\n접근법 C - 사용자 중심: UX 리서치 기반 점진적 개발`,
  };
  return map[purpose] || map['custom'];
}

export function getFewShotExamples(purpose: string): string {
  const map: Record<string, string> = {
    'web-app':    `프로젝트: 블로그 플랫폼\n→ 핵심 기능: 글 작성(마크다운 에디터), 카테고리/태그 분류, 댓글, SEO 최적화, RSS 피드\n→ 기술 스택: Next.js, MDX, Tailwind, Vercel\n\n프로젝트: 팀 채팅 앱\n→ 핵심 기능: 실시간 메시징, 채널 관리, 파일 공유, 멘션, 검색\n→ 기술 스택: React, Socket.io, Express, MongoDB`,
    'mobile-app': `프로젝트: 가계부 앱\n→ 핵심 기능: 지출/수입 입력, 카테고리별 분석, 월간 리포트, 알림\n→ 기술 스택: Flutter, SQLite, Firebase\n\n프로젝트: 운동 트래커\n→ 핵심 기능: 운동 기록, GPS 트래킹, 통계 차트, 목표 설정\n→ 기술 스택: React Native, HealthKit/Google Fit`,
    'content':    `프로젝트: 기술 블로그\n→ 핵심 기능: AI 초안 생성, SEO 키워드 추천, 에디터, 스케줄 발행\n→ 톤: 전문적이면서 친근한\n\n프로젝트: 뉴스레터 도구\n→ 핵심 기능: 템플릿 편집, 구독자 관리, A/B 테스트, 분석\n→ 톤: 간결하고 임팩트 있는`,
    'custom':     `프로젝트: 할일 관리 앱\n→ 핵심 기능: 할일 CRUD, 우선순위, 마감일, 카테고리, 공유\n→ 기술 스택: React, Hono, D1`,
  };
  return map[purpose] || map['custom'] || map['web-app'];
}

// ── 자동 필드 생성 ────────────────────────────────────────────────
export function generateAutoFields(purpose: string, keyword: string, techniqueId: string): Record<string, string> {
  const p = PURPOSE_PRESETS.find(pp => pp.id === purpose);
  const purposeLabel = p?.label || purpose;
  const fields: Record<string, string> = {};

  if (techniqueId === 'context-engineering') {
    fields.project_name  = keyword.split(/\s+/)[0] || keyword;
    fields.project_goal  = `${purposeLabel} 분야에서 "${keyword}"를 구현하는 프로젝트`;
    fields.target_user   = getTargetUser(purpose);
    fields.tech_stack    = getTechStack(purpose);
    fields.core_features = getCoreFeatures(purpose, keyword);
    fields.data_model    = getDataModel(purpose, keyword);
    fields.constraints   = '한국어 UI, 반응형 디자인, 성능 최적화, 접근성 준수';
    fields.tone          = '전문적이고 체계적인';
    return fields;
  }

  if (techniqueId === 'harness') {
    fields.role          = getRoleForPurpose(purpose);
    fields.context       = `${purposeLabel} 프로젝트입니다. "${keyword}"를 개발하려 합니다. ${getContextDetail(purpose)}`;
    fields.task          = `"${keyword}" 프로젝트의 전체 아키텍처를 설계하고, 핵심 기능을 정의하며, 구현 계획을 수립해주세요.`;
    fields.input_data    = `프로젝트 유형: ${purposeLabel}\n핵심 키워드: ${keyword}`;
    fields.output_format = '마크다운 형식으로: 1) 프로젝트 개요 2) 기술 스택 3) 핵심 기능 목록 4) 데이터 모델 5) 프로젝트 구조 6) 구현 단계';
    fields.tone          = '전문적이고 실용적인';
    fields.constraints   = '실제 구현 가능한 현실적인 설계, 한국어로 작성, 초보 개발자도 따라할 수 있도록 상세히';
    return fields;
  }

  if (techniqueId === 'prompt-chaining') {
    fields.task          = `"${keyword}" ${purposeLabel} 프로젝트를 처음부터 완성까지 개발`;
    fields.chain_steps   = getChainSteps(purpose, keyword);
    fields.output_format = '각 단계별 상세 가이드 (마크다운)';
    fields.constraints   = '각 단계의 출력이 다음 단계의 입력이 되도록 연결, 한국어로 작성';
    return fields;
  }

  if (techniqueId === 'chain-of-thought') {
    fields.role          = getRoleForPurpose(purpose);
    fields.task          = `"${keyword}" ${purposeLabel} 프로젝트의 최적 설계 방향을 분석해주세요.`;
    fields.steps         = `1단계: "${keyword}" 프로젝트의 핵심 요구사항을 분석합니다.\n2단계: 가능한 기술 스택과 아키텍처 옵션을 비교합니다.\n3단계: 사용자 경험, 성능, 확장성을 고려한 최적의 설계를 도출합니다.\n4단계: 구체적인 구현 계획과 우선순위를 제시합니다.`;
    fields.output_format = '단계별 분석 결과 + 최종 추천 (마크다운)';
    fields.constraints   = '실용적이고 현실적인 분석, 한국어로 작성';
    return fields;
  }

  if (techniqueId === 'tree-of-thought') {
    fields.role          = getRoleForPurpose(purpose);
    fields.task          = `"${keyword}" ${purposeLabel} 프로젝트의 최적 아키텍처를 결정해주세요.`;
    fields.approaches    = getApproaches(purpose, keyword);
    fields.output_format = '각 접근법 분석 + 최종 추천 (마크다운 표 포함)';
    fields.constraints   = '장단점을 객관적으로 비교, 한국어로 작성';
    return fields;
  }

  if (techniqueId === 'role-prompting') {
    fields.role_detail   = getRoleDetail(purpose);
    fields.expertise     = getExpertise(purpose);
    fields.task          = `"${keyword}" ${purposeLabel}을 설계하고 구현 계획을 작성해주세요.`;
    fields.tone          = '전문적이면서도 이해하기 쉬운';
    fields.output_format = '구조화된 마크다운 문서';
    fields.constraints   = '실무 경험 기반의 실용적 조언, 한국어로 작성';
    return fields;
  }

  if (techniqueId === 'few-shot') {
    fields.role          = getRoleForPurpose(purpose);
    fields.task          = `아래 예시처럼 "${keyword}" 프로젝트에 대한 핵심 기능 명세를 작성해주세요.`;
    fields.examples      = getFewShotExamples(purpose);
    fields.actual_input  = `프로젝트: ${keyword} (${purposeLabel})`;
    fields.output_format = '예시와 동일한 형식';
    fields.constraints   = '한국어로 작성';
    return fields;
  }

  if (techniqueId === 'zero-shot') {
    fields.role          = getRoleForPurpose(purpose);
    fields.task          = `"${keyword}" ${purposeLabel}의 프로젝트 구조, 핵심 기능, 기술 스택을 설계해주세요.`;
    fields.output_format = '마크다운 형식의 프로젝트 설계 문서';
    fields.constraints   = '실용적이고 구현 가능한 설계, 한국어로 작성';
    return fields;
  }

  if (techniqueId === 'meta-prompting') {
    fields.original_prompt  = `"${keyword}" ${purposeLabel}을 만들어주세요.`;
    fields.improvement_goal = `프롬프트를 더 구체적으로 개선하여 AI가 정확한 프로젝트 설계를 생성하도록`;
    fields.constraints      = '한국어로 작성';
    return fields;
  }

  return fields;
}

// ── 프롬프트 품질 분석 ────────────────────────────────────────────
export function analyzePromptQuality(prompt: string, fields: Record<string, string>) {
  const checks = [];
  let score = 0;
  const total = 7;

  if (fields.role || fields.role_detail || fields.project_name) {
    checks.push({ label: '역할/주체 설정', passed: true,  tip: '역할 또는 프로젝트 주체가 명확하게 지정되었습니다.' });
    score++;
  } else {
    checks.push({ label: '역할/주체 설정', passed: false, tip: '역할 또는 프로젝트명을 지정하면 더 전문적인 답변을 얻을 수 있습니다.' });
  }

  const taskLen = (fields.task || fields.project_goal || '').length;
  if (taskLen > 30) {
    checks.push({ label: '작업/목표 구체성', passed: true,  tip: '작업이 충분히 구체적입니다.' });
    score++;
  } else {
    checks.push({ label: '작업/목표 구체성', passed: false, tip: '작업/목표 설명을 30자 이상으로 더 구체적으로 작성하세요.' });
  }

  if (fields.output_format) {
    checks.push({ label: '출력 형식 지정', passed: true,  tip: '출력 형식이 명시되었습니다.' });
    score++;
  } else {
    checks.push({ label: '출력 형식 지정', passed: false, tip: '출력 형식을 지정하면 원하는 결과를 더 정확히 얻습니다.' });
  }

  if (fields.constraints) {
    checks.push({ label: '제약 조건', passed: true,  tip: '제약 조건이 설정되었습니다.' });
    score++;
  } else {
    checks.push({ label: '제약 조건', passed: false, tip: '제약 조건을 추가하면 불필요한 출력을 줄입니다.' });
  }

  if (fields.context || fields.expertise || fields.core_features || (fields.role && fields.role.length > 20)) {
    checks.push({ label: '컨텍스트 제공', passed: true,  tip: '충분한 배경 정보가 제공되었습니다.' });
    score++;
  } else {
    checks.push({ label: '컨텍스트 제공', passed: false, tip: '배경 정보를 추가하면 더 관련성 높은 답변을 얻습니다.' });
  }

  if (prompt.length > 100) {
    checks.push({ label: '충분한 정보량', passed: true,  tip: '프롬프트에 충분한 정보가 포함되어 있습니다.' });
    score++;
  } else {
    checks.push({ label: '충분한 정보량', passed: false, tip: '프롬프트를 더 상세하게 작성하세요.' });
  }

  if (fields.tone) {
    checks.push({ label: '톤/스타일 지정', passed: true,  tip: '응답의 톤이 지정되었습니다.' });
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

// ── 프롬프트 팁 ───────────────────────────────────────────────────
export function getPromptTips(techniqueId: string) {
  const tipsMap: Record<string, string[]> = {
    'zero-shot':            ['명확하고 구체적인 지시를 사용하세요.', '모호한 표현 대신 정확한 용어를 사용하세요.', '한 번에 하나의 작업만 요청하면 효과적입니다.'],
    'few-shot':             ['예시는 2~5개가 적당합니다.', '예시의 형식을 일관되게 유지하세요.', '다양한 케이스를 포함하면 더 좋은 결과를 얻습니다.'],
    'chain-of-thought':     ['"단계별로 생각해보세요"라는 지시가 핵심입니다.', '각 단계가 논리적으로 연결되도록 하세요.', '수학, 논리, 코드 디버깅에 특히 효과적입니다.'],
    'tree-of-thought':      ['최소 3가지 이상의 접근법을 제시하세요.', '각 접근법이 서로 다른 관점을 반영하도록 하세요.', '비교 평가 기준을 명시하면 더 좋은 결과를 얻습니다.'],
    'role-prompting':       ['구체적인 경력과 전문 분야를 명시하세요.', '역할에 맞는 페르소나를 자세히 설정하세요.', '복합 역할도 가능합니다.'],
    'prompt-chaining':      ['각 단계의 출력이 다음 단계의 입력이 됩니다.', '단계를 3~5개로 나누는 것이 적당합니다.', '복잡한 프로젝트 기획에 매우 효과적입니다.'],
    'meta-prompting':       ['원본 프롬프트를 먼저 사용해보고 개선하세요.', 'AI에게 변경 이유를 설명하도록 요청하세요.', '반복적으로 개선하면 최적의 프롬프트를 얻습니다.'],
    'context-engineering':  ['프로젝트 전체 맥락을 먼저 설정하세요.', '이 문서를 시스템 프롬프트로 사용할 수 있습니다.', '기술 스택과 데이터 모델을 구체적으로 작성하면 효과가 큽니다.'],
    'harness':              ['모든 섹션을 채울수록 좋습니다.', '바이브 코딩의 첫 단계로 프로젝트 전체 컨텍스트를 설정하세요.', '이 기법은 다른 기법들의 요소를 종합한 것입니다.'],
  };
  return tipsMap[techniqueId] || [];
}

export function analyzePromptQualityEnhanced(prompt: string, fields: Record<string, string>) {
  const text = String(prompt || '').trim();
  const normalized = text.replace(/\s+/g, ' ');
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const checks: Array<{ key: string; label: string; passed: boolean; tip: string }> = [];
  const suggestions: string[] = [];
  const modelHints: Record<string, string[]> = { gpt: [], claude: [], gemini: [] };

  let score = 0;
  const total = 9;

  const addCheck = (key: string, label: string, passed: boolean, tip: string, suggestion?: string) => {
    checks.push({ key, label, passed, tip });
    if (passed) score++;
    else if (suggestion) suggestions.push(suggestion);
  };

  const hasRole = Boolean(fields.role || fields.role_detail || fields.project_name || /you are|as an?|role:/i.test(text));
  addCheck(
    'role',
    '역할 정의',
    hasRole,
    hasRole ? '역할이 명확합니다.' : '역할이 없거나 너무 일반적입니다.',
    '구체적인 역할이나 주제를 추가하세요.',
  );

  const taskText = String(fields.task || fields.project_goal || fields.goal || '').trim();
  const hasTask = taskText.length > 30 || /output|analyze|generate|summarize|design|compare|evaluate|build|create|write/i.test(normalized);
  addCheck(
    'task',
    '작업 구체성',
    hasTask,
    hasTask ? '작업이 충분히 구체적입니다.' : '작업이 너무 일반적입니다.',
    '목표와 기대 행동이 드러나도록 다시 작성하세요.',
  );

  const hasOutput = Boolean(fields.output_format || /json|markdown|table|bullet|steps?|schema|format/i.test(text));
  addCheck(
    'output_format',
    '출력 계약',
    hasOutput,
    hasOutput ? '출력 형식이 정의되어 있습니다.' : '출력 형식이 없습니다.',
    '출력 형식을 명시적으로 적어주세요.',
  );

  const hasConstraints = Boolean(fields.constraints || fields.input_guardrails || fields.output_guardrails || /must|should|avoid|do not|limit|at least|under|over/i.test(normalized));
  addCheck(
    'constraints',
    '제약 조건',
    hasConstraints,
    hasConstraints ? '제약 조건이 있습니다.' : '제약 조건이 부족합니다.',
    '길이, 스타일, 금지 항목을 추가하세요.',
  );

  const hasContext = Boolean(fields.context || fields.expertise || fields.core_features || fields.project_goal || fields.project_name || lines.length > 4);
  addCheck(
    'context',
    '맥락 깊이',
    hasContext,
    hasContext ? '맥락이 충분합니다.' : '맥락이 너무 얇습니다.',
    '배경, 예시, 프로젝트 맥락을 추가하세요.',
  );

  const ambiguous = [
    /\b(something|someone|stuff|things|etc|whatever|good|nice|appropriate|maybe|possibly)\b/i,
    /\b(적절|알아서|대충|등|기타|필요시|가능하면|아무거나)\b/i,
  ].some((pattern) => pattern.test(normalized));
  addCheck(
    'ambiguity',
    '모호성',
    !ambiguous,
    ambiguous ? '모호한 표현이 감지되었습니다.' : '눈에 띄는 모호성은 없습니다.',
    '모호한 표현을 구체적인 규칙과 예시로 바꾸세요.',
  );

  const repeatedLines = lines.filter((line, index) => lines.indexOf(line) !== index).length;
  const tokenWaste = normalized.length > 1200 || repeatedLines > 0 || /very very|please please/i.test(normalized);
  addCheck(
    'token_waste',
    '토큰 효율',
    !tokenWaste,
    tokenWaste ? '프롬프트가 반복되거나 너무 길어 보입니다.' : '큰 토큰 낭비는 보이지 않습니다.',
    '중복된 문장을 줄이고 불필요한 부분을 압축하세요.',
  );

  const hasFailure = Boolean(fields.rollback_plan || fields.feedback_loop || /failure|rollback|fallback|retry|if .* fails/i.test(normalized));
  addCheck(
    'failure_boundaries',
    '실패 대응',
    hasFailure,
    hasFailure ? '실패 대응이 포함되어 있습니다.' : '실패 대응이 없습니다.',
    '첫 시도가 실패했을 때 어떻게 할지 추가하세요.',
  );

  const hasTone = Boolean(fields.tone);
  addCheck(
    'tone',
    '톤',
    hasTone,
    hasTone ? '톤이 정의되어 있습니다.' : '톤이 정의되지 않았습니다.',
    '출력 품질에 영향을 줄 때만 톤을 추가하세요.',
  );

  const hasModelTarget = Boolean(fields.model_target);
  addCheck(
    'model_target',
    '모델 지정',
    hasModelTarget,
    hasModelTarget ? '대상 모델이 설정되어 있습니다.' : '대상 모델이 없습니다.',
    '모델별로 다르게 쓰고 싶을 때만 지정하세요.',
  );

  if (!hasRole) {
    modelHints.gpt.push('명확한 역할이나 주제 문장으로 시작하세요.');
    modelHints.claude.push('역할과 충분한 맥락 블록을 함께 넣으세요.');
    modelHints.gemini.push('역할이 분명한 직접 지시문을 사용하세요.');
  }
  if (!hasOutput) {
    modelHints.gpt.push('출력 형태를 글머리표나 단계로 정리하세요.');
    modelHints.claude.push('출력 형태를 자연스러운 문장으로 설명하세요.');
    modelHints.gemini.push('출력 규칙을 명시적으로 적으세요.');
  }
  if (!hasConstraints) {
    modelHints.gpt.push('가드레일과 길이 제한을 추가하세요.');
    modelHints.claude.push('제약 조건은 맥락과 분리해서 적으세요.');
    modelHints.gemini.push('짧은 해야 할 것/하지 말아야 할 것을 쓰세요.');
  }

  const percentage = Math.round((score / total) * 100);
  let grade: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
  if (percentage >= 85) grade = 'S';
  else if (percentage >= 70) grade = 'A';
  else if (percentage >= 55) grade = 'B';
  else if (percentage >= 40) grade = 'C';

  const failedLabels = checks.filter((check) => !check.passed).map((check) => check.label);
  const summary = failedLabels.length
    ? `약한 부분: ${failedLabels.slice(0, 3).join(', ')}${failedLabels.length > 3 ? ' 외' : ''}`
    : '프롬프트 구조가 안정적입니다.';

  return {
    checks,
    score,
    total,
    percentage,
    grade,
    summary,
    suggestions,
    modelHints,
  };
}
