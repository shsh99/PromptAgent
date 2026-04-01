/** @jsxImportSource hono/jsx */
import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>프롬프트빌더 - 프롬프트 생성과 최적화</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.0/css/all.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    fontFamily: {
                      sans: ['Noto Sans KR', 'sans-serif'],
                      mono: ['JetBrains Mono', 'monospace'],
                    },
                    colors: {
                      brand: {
                        50: '#f0f4ff',
                        100: '#dbe4ff',
                        200: '#bac8ff',
                        300: '#91a7ff',
                        400: '#748ffc',
                        500: '#5c7cfa',
                        600: '#4c6ef5',
                        700: '#4263eb',
                        800: '#3b5bdb',
                        900: '#364fc7',
                      }
                    }
                  }
                }
              }
            `,
          }}
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body class="prompt-shell theme-light bg-white text-slate-900 font-sans min-h-screen">
        {children}
        <script src="/static/features/common/utils.js"></script>
        <script src="/static/features/common/changelog.js"></script>
        <script src="/static/features/history/history-core.js"></script>
        <script src="/static/features/history/history-ui.js"></script>
        <script src="/static/features/history/history-admin-report.js"></script>
        <script src="/static/features/history/history-admin-dashboard.js"></script>
        <script src="/static/features/common/library.js"></script>
        <script src="/static/features/prompt/improve.js"></script>
        <script src="/static/features/prompt/prompt.js"></script>
        <script src="/static/features/prompt/technique.js"></script>
        <script src="/static/features/common/guide.js"></script>
        <script src="/static/features/optimize/optimize-mode.js"></script>
        <script src="/static/features/optimize/optimize-run.js"></script>
        <script src="/static/features/optimize/optimize-results.js"></script>
        <script src="/static/features/optimize/optimize-extras.js"></script>
        <script src="/static/features/common/app.js"></script>
        <script src="/static/features/common/ui-fixes.js"></script>
      </body>
    </html>
  )
})

