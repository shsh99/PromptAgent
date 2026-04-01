/** @jsxImportSource hono/jsx */

type SiteFooterProps = {
  contactHref?: string
  contactLabel?: string
  onSuggestion?: boolean
  onAdmin?: boolean
}

export function SiteFooter({
  contactHref = 'mailto:ggg9905@naver.com',
  contactLabel = '이메일 문의',
  onSuggestion = true,
  onAdmin = true,
}: SiteFooterProps) {
  return (
    <footer class="px-4 pb-8 sm:px-6 lg:px-8">
      <div class="site-footer-card mx-auto max-w-7xl rounded-[32px] border border-slate-200/80 bg-white/95 px-6 py-6 text-center shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur">
        <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-slate-500">
          <a href="/privacy" class="transition hover:text-brand-600">개인정보처리방침</a>
          <span class="text-slate-300">|</span>
          <a href="/terms" class="transition hover:text-brand-600">이용약관</a>
          <span class="text-slate-300">|</span>
          <a href="/faq" class="transition hover:text-brand-600">자주 묻는 질문</a>
          {onSuggestion ? (
            <>
              <span class="text-slate-300">|</span>
              <button type="button" onclick="showSuggestionBoard()" class="transition hover:text-brand-600">건의하기</button>
            </>
          ) : null}
          {onAdmin ? (
            <>
              <span class="text-slate-300">|</span>
              <button type="button" onclick="promptAdminToken()" class="transition hover:text-brand-600">관리자 모드</button>
            </>
          ) : null}
          <span class="text-slate-300">|</span>
          <a href={contactHref} class="transition hover:text-brand-600">{contactLabel}</a>
        </div>
        <p class="mt-4 text-sm font-medium text-slate-400">Powered by PromptBuilder</p>
      </div>
    </footer>
  )
}
