import { PURPOSE_PRESETS } from './data'

export interface PurposeConfig {
  role: string
  roleDetail: string
  expertise: string
  targetUser: string
  techStack: string
  contextDetail: string
  coreFeatures: (keyword: string) => string
  dataModel: (keyword: string) => string
  chainSteps: (keyword: string) => string
  approaches: (keyword: string) => string
  fewShotExamples: string
}

class CacheManager {
  private cache = new Map<string, any>()
  private ttl = new Map<string, number>()

  set<T>(key: string, value: T, ttlSeconds = 3600): void {
    this.cache.set(key, value)
    this.ttl.set(key, Date.now() + ttlSeconds * 1000)
  }

  get<T>(key: string): T | undefined {
    const expiry = this.ttl.get(key)
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key)
      this.ttl.delete(key)
      return undefined
    }
    return this.cache.get(key) as T | undefined
  }

  clear(): void {
    this.cache.clear()
    this.ttl.clear()
  }

  stats(): { size: number; keys: string[] } {
    return { size: this.cache.size, keys: Array.from(this.cache.keys()) }
  }
}

const globalCache = new CacheManager()

const PURPOSE_CONFIGS: Record<string, PurposeConfig> = {
  'web-app': {
    role: '당신은 10년 경력의 시니어 풀스택 웹 개발자입니다.',
    roleDetail: '시니어 풀스택 웹 개발자',
    expertise: 'React, Next.js, TypeScript, Node.js, PostgreSQL, 클라우드 인프라',
    targetUser: '일반 사용자와 비즈니스 담당자',
    techStack: 'React, TypeScript, Hono, Tailwind CSS, Cloudflare Pages, D1(SQLite)',
    contextDetail: '반응형 웹 애플리케이션으로 데스크톱과 모바일을 모두 지원해야 합니다.',
    coreFeatures: (keyword) => `사용자 인증\n${keyword} 핵심 기능\n대시보드\n반응형 UI/UX\n검색 및 필터링\n설정 및 프로필 관리`,
    dataModel: (keyword) => {
      const first = keyword.split(/\s+/)[0] || 'Item'
      return `User (id, email, name, role, created_at)\n${first} (id, title, description, status, user_id, created_at, updated_at)\nCategory (id, name, slug)`
    },
    chainSteps: (keyword) => `1단계: "${keyword}" 프로젝트 요구사항 분석 및 기능 명세 작성\n2단계: 기술 스택 결정 및 아키텍처 설계\n3단계: 데이터베이스 스키마 및 API 설계\n4단계: UI/UX 구조 설계\n5단계: 핵심 기능 구현`,
    approaches: () => `접근법 A - SSR 기반: Next.js + PostgreSQL\n접근법 B - SPA 기반: React + Hono + D1\n접근법 C - 풀스택 프레임워크: Remix/SvelteKit + Supabase`,
    fewShotExamples: `프로젝트: 블로그 플랫폼\n→ 핵심 기능: 글 작성, 카테고리 분류, 댓글, SEO 최적화\n→ 기술 스택: Next.js, MDX, Tailwind, Vercel`,
  },
  'mobile-app': {
    role: '당신은 8년 경력의 모바일 앱 개발 전문가입니다.',
    roleDetail: '크로스플랫폼 모바일 앱 개발 전문가',
    expertise: 'React Native, Flutter, Swift, Kotlin, 앱 배포',
    targetUser: '스마트폰 사용자',
    techStack: 'React Native 또는 Flutter, TypeScript, Expo, Firebase',
    contextDetail: 'iOS와 Android를 모두 지원하는 네이티브 수준의 경험이 중요합니다.',
    coreFeatures: (keyword) => `온보딩 및 사용자 인증\n${keyword} 핵심 기능\n푸시 알림\n오프라인 지원\n설정 및 프로필\n앱 내 결제`,
    dataModel: (keyword) => {
      const first = keyword.split(/\s+/)[0] || 'Item'
      return `User (id, email, name, avatar, settings)\n${first} (id, title, content, user_id, synced_at)\nNotification (id, type, message, read, user_id)`
    },
    chainSteps: (keyword) => `1단계: "${keyword}" 앱 요구사항 및 화면 흐름 정의\n2단계: 기술 스택 및 아키텍처 설계\n3단계: UI/UX와 네비게이션 구조 설계\n4단계: 핵심 기능 및 API 연동 구현\n5단계: 테스트 및 배포 준비`,
    approaches: () => `접근법 A - React Native: 코드 재사용성과 생태계 장점\n접근법 B - Flutter: 네이티브 성능과 일관된 UI\n접근법 C - Native: Swift/Kotlin 기반의 최상 성능`,
    fewShotExamples: `프로젝트: 가계부 앱\n→ 핵심 기능: 지출/수입 입력, 카테고리별 분석, 월간 리포트\n→ 기술 스택: Flutter, SQLite, Firebase`,
  },
  'ai-tool': {
    role: '당신은 AI/ML 엔지니어입니다.',
    roleDetail: 'AI/ML 엔지니어',
    expertise: 'LLM 파인튜닝, RAG, 프롬프트 최적화, Python, TensorFlow, PyTorch',
    targetUser: 'AI 도구를 활용하려는 개발자 및 비즈니스 사용자',
    techStack: 'Python, FastAPI, LangChain, OpenAI API, React 프론트엔드',
    contextDetail: '정확한 결과와 사용자 친화적인 인터페이스가 중요합니다.',
    coreFeatures: (keyword) => `AI 모델 연동\n${keyword} 핵심 기능\n입력/출력 인터페이스\n히스토리 관리\n결과 저장 및 공유`,
    dataModel: (keyword) => `User (id, email, api_key_hash)\nConversation (id, title, model, user_id)\nMessage (id, role, content, conversation_id, tokens)`,
    chainSteps: (keyword) => `1단계: "${keyword}" 도구 기능 정의 및 모델 선택\n2단계: 데이터 파이프라인 및 프롬프트 설계\n3단계: 백엔드 API 및 모델 연동\n4단계: 프론트엔드 인터페이스 구현\n5단계: 테스트 및 프롬프트 최적화`,
    approaches: () => `접근법 A - OpenAI API 기반\n접근법 B - 오픈소스 모델 기반\n접근법 C - 하이브리드 방식`,
    fewShotExamples: `프로젝트: AI 코딩 어시스턴트\n→ 핵심 기능: 코드 생성, 디버깅, 최적화\n→ 기술 스택: FastAPI, LangChain, OpenAI API`,
  },
  custom: {
    role: '당신은 다양한 분야에 정통한 시니어 소프트웨어 엔지니어입니다.',
    roleDetail: '시니어 소프트웨어 엔지니어',
    expertise: '웹, 모바일, 클라우드, 데이터 분야의 폭넓은 경험',
    targetUser: '해당 프로젝트의 실제 사용자',
    techStack: '프로젝트 요구사항에 맞는 최적의 스택',
    contextDetail: '사용자 요구사항에 맞는 최적의 솔루션을 설계합니다.',
    coreFeatures: (keyword) => `${keyword} 핵심 기능\n사용자 인증\n데이터 관리 (CRUD)\nUI/UX\n검색 및 필터링`,
    dataModel: (keyword) => {
      const first = keyword.split(/\s+/)[0] || 'Item'
      return `User (id, email, name, created_at)\n${first} (id, title, data, user_id)`
    },
    chainSteps: (keyword) => `1단계: "${keyword}" 프로젝트 요구사항 분석\n2단계: 기술 스택 및 아키텍처 설계\n3단계: 핵심 기능 구현\n4단계: UI/UX 설계 및 구현\n5단계: 테스트 및 배포`,
    approaches: () => `접근법 A - 빠른 프로토타이핑\n접근법 B - 견고한 설계\n접근법 C - 사용자 중심 점진 개발`,
    fewShotExamples: `프로젝트: 할일 관리 앱\n→ 핵심 기능: 할일 CRUD, 우선순위, 마감일, 카테고리, 공유\n→ 기술 스택: React, Hono, D1`,
  },
}

function getPurposeConfig(purpose: string): PurposeConfig {
  const normalized = (purpose || 'custom').toLowerCase().trim()
  return PURPOSE_CONFIGS[normalized] || PURPOSE_CONFIGS.custom
}

export function validateInput(purpose: string, keyword: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const normalizedPurpose = (purpose || '').toLowerCase().trim()
  if (!normalizedPurpose) errors.push('purpose는 필수입니다.')
  else if (!PURPOSE_CONFIGS[normalizedPurpose] && normalizedPurpose !== 'custom') {
    errors.push(`지원하지 않는 purpose입니다: ${Object.keys(PURPOSE_CONFIGS).join(', ')}`)
  }
  if (!String(keyword || '').trim()) errors.push('keyword는 필수입니다.')
  else if (String(keyword).trim().length < 2) errors.push('keyword는 최소 2자 이상이어야 합니다.')
  else if (String(keyword).trim().length > 200) errors.push('keyword는 200자 이하여야 합니다.')
  return { valid: errors.length === 0, errors }
}

export function normalizePurpose(purpose: string): string {
  return String(purpose || 'custom').toLowerCase().trim()
}

export function normalizeKeyword(keyword: string): string {
  return String(keyword || '').trim()
}

export function getRoleForPurpose(purpose: string): string {
  const cacheKey = `role:${purpose}`
  const cached = globalCache.get<string>(cacheKey)
  if (cached) return cached
  const config = getPurposeConfig(purpose)
  globalCache.set(cacheKey, config.role)
  return config.role
}

export function getRoleDetail(purpose: string): string {
  const cacheKey = `roleDetail:${purpose}`
  const cached = globalCache.get<string>(cacheKey)
  if (cached) return cached
  const config = getPurposeConfig(purpose)
  globalCache.set(cacheKey, config.roleDetail)
  return config.roleDetail
}

export function getExpertise(purpose: string): string {
  const cacheKey = `expertise:${purpose}`
  const cached = globalCache.get<string>(cacheKey)
  if (cached) return cached
  const config = getPurposeConfig(purpose)
  globalCache.set(cacheKey, config.expertise)
  return config.expertise
}

export function getTargetUser(purpose: string): string {
  const cacheKey = `targetUser:${purpose}`
  const cached = globalCache.get<string>(cacheKey)
  if (cached) return cached
  const config = getPurposeConfig(purpose)
  globalCache.set(cacheKey, config.targetUser)
  return config.targetUser
}

export function getTechStack(purpose: string): string {
  const cacheKey = `techStack:${purpose}`
  const cached = globalCache.get<string>(cacheKey)
  if (cached) return cached
  const config = getPurposeConfig(purpose)
  globalCache.set(cacheKey, config.techStack)
  return config.techStack
}

export function getContextDetail(purpose: string): string {
  const cacheKey = `contextDetail:${purpose}`
  const cached = globalCache.get<string>(cacheKey)
  if (cached) return cached
  const config = getPurposeConfig(purpose)
  globalCache.set(cacheKey, config.contextDetail)
  return config.contextDetail
}

export function getCoreFeatures(purpose: string, keyword: string): string {
  const cacheKey = `coreFeatures:${purpose}:${keyword}`
  const cached = globalCache.get<string>(cacheKey)
  if (cached) return cached
  const config = getPurposeConfig(purpose)
  const result = config.coreFeatures(keyword)
  globalCache.set(cacheKey, result)
  return result
}

export function getDataModel(purpose: string, keyword: string): string {
  const cacheKey = `dataModel:${purpose}:${keyword}`
  const cached = globalCache.get<string>(cacheKey)
  if (cached) return cached
  const config = getPurposeConfig(purpose)
  const result = config.dataModel(keyword)
  globalCache.set(cacheKey, result)
  return result
}

export function getChainSteps(purpose: string, keyword: string): string {
  const cacheKey = `chainSteps:${purpose}:${keyword}`
  const cached = globalCache.get<string>(cacheKey)
  if (cached) return cached
  const config = getPurposeConfig(purpose)
  const result = config.chainSteps(keyword)
  globalCache.set(cacheKey, result)
  return result
}

export function getApproaches(purpose: string, keyword: string): string {
  const cacheKey = `approaches:${purpose}:${keyword}`
  const cached = globalCache.get<string>(cacheKey)
  if (cached) return cached
  const config = getPurposeConfig(purpose)
  const result = config.approaches(keyword)
  globalCache.set(cacheKey, result)
  return result
}

export function getFewShotExamples(purpose: string): string {
  const cacheKey = `fewShotExamples:${purpose}`
  const cached = globalCache.get<string>(cacheKey)
  if (cached) return cached
  const config = getPurposeConfig(purpose)
  globalCache.set(cacheKey, config.fewShotExamples)
  return config.fewShotExamples
}

export function clearCache(): void {
  globalCache.clear()
}

export function getCacheStats(): { size: number; keys: string[] } {
  return globalCache.stats()
}

export function registerPurposeConfig(purposeId: string, config: PurposeConfig): void {
  PURPOSE_CONFIGS[purposeId.toLowerCase()] = config
  globalCache.clear()
}

export function getPurposeConfigKeys(): string[] {
  return Object.keys(PURPOSE_CONFIGS)
}
