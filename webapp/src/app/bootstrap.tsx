/** @jsxImportSource hono/jsx */
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { apiRouter } from './routes'
import { HomeScreen } from '../features/home/home-screen'
import {
  DocumentPage,
  FaqPage,
  buildFaqSections,
  buildPrivacySections,
  buildTermsSections,
  formatKoreanDate,
} from '../features/legal/legal-pages'

const app = new Hono()

app.use(renderer)
app.use('/api/*', cors())
app.route('/api', apiRouter)

app.get('/privacy', (c) =>
  c.render(
    <DocumentPage
      title="개인정보처리방침"
      updatedAt={formatKoreanDate(new Date())}
      badgeLabel="PRIVACY"
      intro="PromptBuilder는 서비스 제공과 개선을 위해 필요한 범위에서만 개인정보를 수집하고 처리합니다. 아래 내용은 개인정보가 어떻게 수집, 사용, 보관되는지 설명합니다."
      sections={buildPrivacySections()}
      footerNote="본 방침은 서비스 운영과 관련 법령 변경에 따라 업데이트될 수 있으며, 중요한 변경 사항은 별도로 안내합니다."
      contactHref="mailto:ggg9905@naver.com"
      contactLabel="이메일 문의"
    />,
  ),
)

app.get('/terms', (c) =>
  c.render(
    <DocumentPage
      title="이용약관"
      updatedAt={formatKoreanDate(new Date())}
      badgeLabel="TERMS"
      intro="본 약관은 PromptBuilder 서비스의 이용 조건, 권리와 의무, 책임 범위를 설명합니다. 서비스를 이용하시기 전에 반드시 내용을 확인해 주세요."
      sections={buildTermsSections()}
      footerNote="서비스를 계속 이용하시는 경우 변경된 약관에 동의한 것으로 간주될 수 있습니다."
      contactHref="mailto:ggg9905@naver.com"
      contactLabel="이메일 문의"
    />,
  ),
)

app.get('/faq', (c) =>
  c.render(
    <FaqPage
      title="자주 묻는 질문"
      updatedAt={formatKoreanDate(new Date())}
      intro="가장 많이 받는 질문을 한곳에 정리했습니다. 빠르게 확인할 수 있도록 간단하고 명확하게 답변합니다."
      sections={buildFaqSections()}
    />,
  ),
)

app.get('/', (c) => c.render(<HomeScreen />))

export default app
