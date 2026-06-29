import { existsSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'

// 지원 범위: [label](path)와 [label](<path with spaces>)만 검사한다.
// reference-style, 제목 속성, 중첩 괄호 대상은 오탐을 피하기 위해 건너뛴다.
const supportedInlineLinkPattern = /(?<!!)\[[^\]\r\n]+\]\((<[^>\r\n]+>|[^()\s\r\n]+)\)/g
const markdownCodePattern = /```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\r\n]*`/g

const isOutsideRepository = (repositoryRoot, targetPath) => {
  const relativePath = relative(resolve(repositoryRoot), targetPath)
  return relativePath === '..'
    || relativePath.startsWith(`..${sep}`)
    || isAbsolute(relativePath)
}

export const validateLocalMarkdownLinks = ({ content, documentPath, repositoryRoot }) => {
  const errors = []
  const proseContent = String(content).replace(markdownCodePattern, '')

  for (const match of proseContent.matchAll(supportedInlineLinkPattern)) {
    const rawTarget = match[1].startsWith('<') ? match[1].slice(1, -1) : match[1]
    const pathPart = rawTarget.split('#')[0].split('?')[0]

    if (!pathPart || /^(?:https?:|mailto:|tel:)/i.test(pathPart)) continue

    let decodedPath
    try {
      decodedPath = decodeURIComponent(pathPart)
    } catch {
      errors.push(`${pathPart}: URL 인코딩을 해석할 수 없습니다.`)
      continue
    }

    const targetPath = resolve(dirname(documentPath), decodedPath)
    if (isOutsideRepository(repositoryRoot, targetPath)) {
      errors.push(`${pathPart}: 저장소 외부 경로는 허용하지 않습니다.`)
      continue
    }

    if (!existsSync(targetPath)) errors.push(`${pathPart}: 대상이 존재하지 않습니다.`)
  }

  return errors
}
