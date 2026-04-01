/** @jsxImportSource hono/jsx */
import { SiteFooter } from '../../components/site-footer'

type Section = {
  title: string
  body?: string
  bullets?: string[]
  numbered?: string[]
}

type DocumentPageProps = {
  title: string
  updatedAt: string
  badgeLabel: string
  intro: string
  sections: Section[]
  footerNote?: string
  contactHref?: string
  contactLabel?: string
}

function formatParagraph(text: string) {
  return text.split('\n').map((line, index) => (
    <>
      {index > 0 ? <br /> : null}
      {line}
    </>
  ))
}

export function DocumentPage({
  title,
  updatedAt,
  badgeLabel,
  intro,
  sections,
  footerNote,
  contactHref = 'mailto:support@promptbuilder.co.kr',
  contactLabel = '메일 문의',
}: DocumentPageProps) {
  return (
    <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(92,124,250,0.08),transparent_26%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.06),transparent_22%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_55%,#e2e8f0_100%)] text-slate-900">
      <main class="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <section class="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div class="flex flex-col gap-4 border-b border-slate-200/80 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
            <div>
              <div class="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-700">
                <span class="h-2 w-2 rounded-full bg-brand-500"></span>
                {badgeLabel}
              </div>
              <h1 class="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
              <p class="mt-2 text-sm text-slate-500">최종 업데이트: {updatedAt}</p>
            </div>
            <a
              href="/"
              class="inline-flex items-center justify-center rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-500"
            >
              메인으로
            </a>
          </div>

          <div class="space-y-6 px-5 py-6 sm:px-6">
            <div class="rounded-3xl bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700">{formatParagraph(intro)}</div>

            {sections.map((section, index) => (
              <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" key={`${section.title}-${index}`}>
                <h2 class="text-xl font-bold tracking-tight text-slate-950">
                  {index + 1}. {section.title}
                </h2>
                {section.body ? <p class="mt-3 text-sm leading-7 text-slate-700">{formatParagraph(section.body)}</p> : null}
                {section.bullets ? (
                  <ul class="mt-4 space-y-2 text-sm leading-7 text-slate-700">
                    {section.bullets.map((bullet) => (
                      <li class="flex gap-3" key={bullet}>
                        <span class="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-brand-500"></span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {section.numbered ? (
                  <ol class="mt-4 space-y-2 text-sm leading-7 text-slate-700">
                    {section.numbered.map((item, itemIndex) => (
                      <li class="flex gap-3" key={item}>
                        <span class="font-semibold text-brand-700">{itemIndex + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                ) : null}
              </section>
            ))}

            <div class="rounded-3xl border border-brand-200 bg-brand-50 px-5 py-4 text-sm leading-7 text-brand-900">
              <p class="font-semibold">책임 안내</p>
              <p class="mt-1">
                {footerNote ||
                  '본 문서는 PromptBuilder 서비스 운영 정책을 안내하기 위한 예시입니다. 실제 서비스 운영 상황에 맞게 검토 후 사용해 주세요.'}
              </p>
            </div>
          </div>
        </section>

        <SiteFooter contactHref={contactHref} contactLabel={contactLabel} />
      </main>
    </div>
  )
}

export function FaqPage({
  title,
  updatedAt,
  intro,
  sections,
}: Pick<DocumentPageProps, 'title' | 'updatedAt' | 'intro' | 'sections'>) {
  return (
    <div class="min-h-screen bg-[radial-gradient(circle_at_top,rgba(92,124,250,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.05),transparent_24%),linear-gradient(180deg,#ffffff_0%,#f8fafc_52%,#eef2f7_100%)] text-slate-900">
      <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header class="mb-8 text-center">
          <div class="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-xs font-semibold text-brand-700 shadow-sm">
            <span class="h-2 w-2 rounded-full bg-brand-500"></span>
            FAQ
          </div>
          <h1 class="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
          <p class="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">{intro}</p>
          <p class="mt-3 text-sm text-slate-400">최종 업데이트: {updatedAt}</p>
        </header>

        <section class="space-y-5">
          {sections.map((section) => (
            <article
              class="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:px-6"
              key={section.title}
            >
              <div class="mb-3 text-[13px] font-bold uppercase tracking-[0.18em] text-brand-600">Q.</div>
              <h2 class="text-2xl font-black tracking-tight text-slate-950">{section.title}</h2>
              <div class="mt-4 border-t border-slate-100 pt-4">
                <div class="mb-2 text-[13px] font-bold uppercase tracking-[0.18em] text-slate-400">A.</div>
                <p class="text-base leading-8 text-slate-700">{formatParagraph(section.body || '')}</p>
                {section.bullets ? (
                  <ul class="mt-4 space-y-2 text-sm leading-7 text-slate-700">
                    {section.bullets.map((bullet) => (
                      <li class="flex gap-3" key={bullet}>
                        <span class="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-brand-500"></span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          ))}
        </section>

        <SiteFooter />
      </main>
    </div>
  )
}

export function buildPrivacySections(): Section[] {
  return [
    {
      title: '개인정보 수집 및 이용 목적',
      body:
        'PromptBuilder는 서비스 제공, 문의 대응, 품질 개선, 보안 유지, 부정 이용 방지를 위해 필요한 최소한의 정보를 처리합니다. 수집 목적이 달라질 경우 사전에 고지하고 동의를 받습니다.',
      bullets: ['AI 프롬프트 생성 및 저장 기능 제공', '서비스 이용 패턴 분석 및 품질 개선', '부정 이용 방지 및 보안 사고 대응', '고객 문의 및 장애 처리'],
    },
    {
      title: '수집하는 개인정보 항목',
      body: '서비스 제공에 필요한 범위에서 자동 수집 정보와 사용자가 직접 입력한 정보를 함께 처리할 수 있습니다.',
      bullets: [
        '자동 수집 정보: IP 주소, 접속 로그, 쿠키, 브라우저 정보, 접속 기기 정보',
        '사용자 입력 정보: 프롬프트 입력 텍스트, 키워드, 설정값, 문의 내용',
        '선택 제공 정보: 서비스 개선 제안, 피드백, 추가 입력 항목',
      ],
    },
    {
      title: '보유 및 이용기간',
      body:
        '수집된 개인정보는 목적 달성 시까지 보관하며, 관련 법령 또는 내부 보안 정책에 따라 필요한 기간 동안 보관할 수 있습니다. 보존 의무가 종료되면 지체 없이 파기합니다.',
      bullets: ['서비스 이용 기록: 운영 및 분쟁 대응 목적의 기간 동안 보관', '접속 로그: 보안, 장애 분석, 악성 이용 방지 목적의 기간 동안 보관', '문의 내역: 처리 완료 후 일정 기간 보관 후 삭제'],
    },
    {
      title: '개인정보의 제3자 제공',
      body: '원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만 법령 근거가 있거나 이용자가 사전에 동의한 경우에는 예외적으로 제공될 수 있습니다.',
      bullets: ['이용자가 사전에 명시적으로 동의한 경우', '법령에 따라 제공이 요구되는 경우', '수사, 보안, 사고 대응을 위해 법적으로 필요한 경우'],
    },
    {
      title: '권리와 행사 방법',
      body: '이용자는 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지 등을 요청할 수 있습니다. 요청은 서비스 내 문의 기능 또는 지정된 연락처를 통해 접수합니다.',
      bullets: ['개인정보 열람 요구', '개인정보 정정 및 삭제 요구', '개인정보 처리정지 요구', '동의 철회 및 문의'],
    },
    {
      title: '개인정보보호책임자',
      body: '개인정보 처리에 관한 문의, 열람 요청, 수정 요청 등은 아래 연락처를 통해 접수할 수 있습니다. 접수된 문의는 가능한 범위에서 신속하게 회신합니다.',
      bullets: ['이메일: support@promptbuilder.co.kr', '업무 시간: 평일 10:00 ~ 18:00'],
    },
    {
      title: '방침 변경',
      body: '본 방침은 서비스 운영 정책 및 관련 법령 변경에 따라 수정될 수 있으며, 중요한 변경 사항은 서비스 내 공지 또는 안내 페이지를 통해 고지합니다.',
    },
  ]
}

export function buildTermsSections(): Section[] {
  return [
    { title: '목적', body: '본 약관은 PromptBuilder가 제공하는 프롬프트 생성, 편집, 최적화, 기록 관리 및 관련 부가 기능의 이용 조건을 정하는 것을 목적으로 합니다.' },
    {
      title: '정의',
      body: '본 약관에서 사용하는 용어의 의미는 다음과 같습니다. 서비스는 PromptBuilder가 제공하는 웹 기반 프롬프트 도구를 의미하며, 이용자는 본 서비스에 접속해 기능을 사용하는 개인 또는 단체를 의미합니다.',
      bullets: ['서비스: PromptBuilder가 제공하는 프롬프트 생성 및 관리 기능', '이용자: 서비스를 사용하는 회원 또는 비회원', '콘텐츠: 이용자가 입력하거나 생성한 텍스트, 데이터, 설정값'],
    },
    {
      title: '약관의 효력 및 변경',
      body: '본 약관은 서비스 화면 또는 연결 페이지에 게시한 시점부터 효력이 발생합니다. 운영상 또는 법적 필요에 따라 변경될 수 있으며, 변경 시 변경 사항과 시행일을 고지합니다.',
      numbered: ['이용자가 변경된 약관에 동의하지 않는 경우 이용을 중단할 수 있습니다.', '변경된 약관의 효력은 고지된 시행일부터 발생합니다.'],
    },
    {
      title: '서비스 제공',
      body: 'PromptBuilder는 다음과 같은 서비스를 제공합니다. 서비스 구성은 운영 정책에 따라 추가, 변경 또는 종료될 수 있습니다.',
      bullets: ['AI 프롬프트 생성 서비스', '키워드 및 목적 분석 서비스', '프롬프트 최적화 및 개선 도구', '기타 운영상 필요한 부가 서비스'],
    },
    {
      title: '서비스 이용',
      body: '이용자는 서비스의 정상적인 사용 범위 내에서 기능을 활용해야 하며, 시스템 안정성을 해치거나 타인에게 피해를 주는 방식으로 이용할 수 없습니다.',
      bullets: ['비정상적인 요청 반복 또는 과도한 호출 금지', '불법적, 사기적, 권리 침해 목적의 사용 금지', '허위 정보 입력 및 타인 정보의 무단 사용 금지', '시스템 보안 우회 시도 금지'],
    },
    {
      title: '이용자의 의무',
      body: '이용자는 입력하는 정보의 정확성, 적법성, 권리 관계를 스스로 확인해야 하며, 서비스가 생성한 결과를 최종 사용 전에 검토해야 합니다.',
      bullets: ['타인의 개인정보, 저작권, 상표권 등을 침해하지 않을 의무', '허위 또는 오해의 소지가 있는 정보를 입력하지 않을 의무', '서비스 결과물을 사용하기 전에 적절히 검토할 의무'],
    },
    {
      title: '서비스 이용 제한',
      body: '운영자는 보안, 법적 대응, 서비스 안정성 확보를 위해 필요하다고 판단하는 경우 이용 제한 조치를 취할 수 있습니다.',
      numbered: ['명백한 약관 위반 또는 법령 위반이 확인된 경우', '자동화 도구, 크롤링, 스크래핑 등 비정상 접근이 확인된 경우', '보안상 위험이 있거나 시스템에 과부하를 유발하는 경우'],
    },
    { title: '지식재산권', body: '서비스 자체의 디자인, 소스코드, 상표, 문구 등은 운영자 또는 정당한 권리자에게 귀속됩니다. 이용자가 생성한 콘텐츠의 권리 관계는 관련 법령 및 별도 합의에 따릅니다.' },
    { title: '면책조항', body: '서비스는 편의성을 높이기 위한 도구이며, 결과물의 완전성, 적합성, 특정 목적에의 적합성을 보증하지 않습니다. 이용자는 결과물을 참고 자료로 활용하고 최종 판단은 직접 해야 합니다.' },
    { title: '분쟁 해결', body: '서비스와 관련하여 분쟁이 발생할 경우 상호 협의를 우선하며, 협의로 해결되지 않는 경우 관련 법령에 따른 관할 법원에서 해결합니다.' },
  ]
}

export function buildFaqSections(): Section[] {
  return [
    { title: 'PromptBuilder는 무료로 사용할 수 있나요?', body: '기본 기능은 무료로 사용할 수 있도록 설계할 수 있습니다. 다만 고급 기능, 저장 용량, 호출 횟수, 팀 기능 등은 운영 정책에 따라 제한될 수 있습니다.' },
    { title: '어떤 AI 모델을 지원하나요?', body: 'ChatGPT, Claude, Gemini 계열처럼 대화형 LLM에 맞춘 프롬프트를 중심으로 구성할 수 있으며, 이미지 생성이나 코딩 보조 같은 다양한 활용 방식도 함께 고려할 수 있습니다.' },
    { title: '생성된 프롬프트의 저작권은 어떻게 되나요?', body: '프롬프트 템플릿과 서비스 구조는 운영자에게 귀속될 수 있지만, 사용자가 작성한 입력 내용과 생성 결과물의 사용 권한은 별도 정책과 법령에 따릅니다. 상업적 사용 전에는 반드시 검토해 주세요.' },
    { title: '자동화 도구나 크롤링을 사용해도 되나요?', body: '아니요. 서비스 안정성을 해치는 봇, 크롤러, 스크래퍼, 자동화된 대량 요청은 제한할 수 있습니다. 정상적인 브라우저를 통한 이용을 권장합니다.' },
    { title: '개인정보는 어떻게 관리되나요?', body: '서비스는 최소 수집, 목적 제한, 보관 기간 관리 원칙을 따르며, 불필요한 정보는 저장하지 않거나 일정 기간 후 삭제합니다. 자세한 내용은 개인정보처리방침을 확인해 주세요.' },
    { title: '문제가 생기면 어디로 문의하나요?', body: '서비스 내 문의 기능 또는 support@promptbuilder.co.kr로 연락하시면 됩니다. 오류 제보, 개선 요청, 제휴 문의도 함께 접수할 수 있습니다.' },
  ]
}

export function formatKoreanDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
