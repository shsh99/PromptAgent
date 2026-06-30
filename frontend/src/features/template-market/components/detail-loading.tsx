import { useEffect, useRef } from 'react'

interface DetailLoadingProps { onCancel: () => void }

export const DetailLoading = ({ onCancel }: DetailLoadingProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => headingRef.current?.focus(), [])

  return (
    <section className="detail-state" role="dialog" aria-labelledby="detail-loading-title">
      <h3 id="detail-loading-title" ref={headingRef} tabIndex={-1}>상세 프롬프트를 불러오는 중…</h3>
      <span>검증된 프롬프트 구조를 확인하고 있습니다.</span>
      <button type="button" onClick={onCancel}>상세 불러오기 취소</button>
    </section>
  )
}
