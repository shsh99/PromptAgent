import { useEffect, useRef } from 'react'

import type { DetailState } from '../hooks/use-template-market'
import { DetailLoading } from './detail-loading'
import { TemplateDetail } from './template-detail'

interface DetailRegionProps { detail: DetailState; onClose: () => void }

export const DetailRegion = ({ detail, onClose }: DetailRegionProps) => {
  const errorHeadingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (detail.phase === 'not-found' || detail.phase === 'error') errorHeadingRef.current?.focus()
  }, [detail.phase])

  if (detail.phase === 'loading') return <DetailLoading onCancel={onClose} />
  if (detail.phase === 'success') return <TemplateDetail template={detail.data} onClose={onClose} />
  if (detail.phase !== 'not-found' && detail.phase !== 'error') return null
  return (
    <section className="detail-state detail-state--error" role="region" aria-labelledby="detail-error-title" aria-live="polite">
      <h3 id="detail-error-title" ref={errorHeadingRef} tabIndex={-1}>
        {detail.phase === 'not-found' ? '선택한 공개 템플릿을 찾을 수 없습니다.' : '상세 프롬프트를 불러오지 못했습니다.'}
      </h3>
      <span>{detail.phase === 'not-found' ? '목록에서 다른 검증 템플릿을 선택하세요.' : '잠시 후 목록에서 다시 선택하세요.'}</span>
      <button type="button" onClick={onClose}>목록 탐색으로 돌아가기</button>
    </section>
  )
}
