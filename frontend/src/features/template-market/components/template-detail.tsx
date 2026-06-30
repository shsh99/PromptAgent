import type { PromptTemplateDetail } from '../api/prompt-templates'
import { CopyButton } from './copy-button'

interface TemplateDetailProps { template: PromptTemplateDetail; onClose: () => void }

const sections = (template: PromptTemplateDetail) => [
  ['역할', template.requiredSections.role],
  ['목적', template.requiredSections.objective],
  ['배경과 입력', template.requiredSections.input.backgroundAndInput],
  ['대상 사용자', template.requiredSections.input.targetAudience],
  ['제약 조건', template.requiredSections.constraints.rules],
  ['불확실성 처리', template.requiredSections.constraints.uncertaintyHandling],
  ['출력 형식', template.requiredSections.outputFormat],
  ['품질 기준', template.requiredSections.qualityCriteria.criteria],
  ['최종 자체 점검', template.requiredSections.qualityCriteria.selfCheck],
] as const

export const TemplateDetail = ({ template, onClose }: TemplateDetailProps) => (
  <section className="template-detail" aria-labelledby="template-detail-title">
    <header className="template-detail__header">
      <div>
        <p className="eyebrow">PROMPT BLUEPRINT · {template.version}</p>
        <h3 id="template-detail-title">{template.title}</h3>
        <p>{template.summary}</p>
      </div>
      <button className="detail-close" type="button" onClick={onClose}>상세 닫기</button>
    </header>
    <div className="prompt-blueprint">
      {sections(template).map(([label, value], index) => (
        <article key={label}>
          <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <div><h4>{label}</h4><p>{value}</p></div>
        </article>
      ))}
    </div>
    <div className="copy-workbench">
      <div>
        <p className="eyebrow">READY TO USE</p>
        <h4>완성 프롬프트</h4>
      </div>
      <CopyButton prompt={template.copyablePrompt} />
      <textarea aria-label="복사할 완성 프롬프트" readOnly value={template.copyablePrompt} />
    </div>
  </section>
)
