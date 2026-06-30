import type { PromptTemplateSummary } from '../api/prompt-templates'

const difficultyLabel = { BEGINNER: '입문', INTERMEDIATE: '중급', ADVANCED: '고급' } as const

interface TemplateCardProps {
  template: PromptTemplateSummary
  onOpen: (element: HTMLButtonElement) => void
}

export const TemplateCard = ({ template, onOpen }: TemplateCardProps) => (
  <article className="template-card">
    <div className="template-card__meta">
      <span>{template.categoryLabel}</span>
      <span>{difficultyLabel[template.difficulty]}</span>
      <span className="verified-mark"><i aria-hidden="true">✓</i> 검증 완료</span>
    </div>
    <h3>{template.title}</h3>
    <p>{template.summary}</p>
    <ul className="template-tags" aria-label="태그">
      {template.tags.map((tag) => <li key={tag}>#{tag}</li>)}
    </ul>
    <button type="button" onClick={(event) => onOpen(event.currentTarget)}>
      <span>{template.title} 상세 보기</span><span aria-hidden="true">→</span>
    </button>
  </article>
)
