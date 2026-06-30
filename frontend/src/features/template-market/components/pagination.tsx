interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null
  return (
    <nav className="market-pagination" aria-label="템플릿 페이지">
      <button type="button" disabled={page === 0} onClick={() => onPageChange(page - 1)}>이전 페이지</button>
      <p><strong>{page + 1}</strong> / {totalPages}</p>
      <button type="button" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>다음 페이지</button>
    </nav>
  )
}
