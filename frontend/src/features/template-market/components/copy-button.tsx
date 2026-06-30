import { useState } from 'react'

interface CopyButtonProps { prompt: string }

export const CopyButton = ({ prompt }: CopyButtonProps) => {
  const [message, setMessage] = useState('')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setMessage('프롬프트를 복사했습니다.')
    } catch {
      setMessage('복사하지 못했습니다. 아래 내용을 직접 선택해 복사하세요.')
    }
  }

  return (
    <div className="copy-action">
      <button type="button" onClick={copy}>완성 프롬프트 복사</button>
      <p role="status" aria-label="복사 결과" aria-live="polite">{message}</p>
    </div>
  )
}
