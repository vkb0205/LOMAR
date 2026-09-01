import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, 2, totalPages - 1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

  const sorted = [...pages]
    .filter(page => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const result: (number | 'ellipsis')[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (page - previous > 1) result.push('ellipsis');
    result.push(page);
    previous = page;
  }
  return result;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Phân trang">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Trang trước"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-ink ring-1 ring-ink/15 transition-all duration-500 ease-fluid hover:ring-ink/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:ring-ink/15"
      >
        <ChevronLeft strokeWidth={1.5} className="h-4 w-4" />
      </button>

      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="flex h-10 w-10 select-none items-center justify-center text-sm text-ink/50">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-500 ease-fluid ${
              page === currentPage
                ? 'bg-ink text-canvas shadow-lift'
                : 'bg-canvas text-ink ring-1 ring-ink/15 hover:ring-ink/40'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Trang sau"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-ink ring-1 ring-ink/15 transition-all duration-500 ease-fluid hover:ring-ink/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:ring-ink/15"
      >
        <ChevronRight strokeWidth={1.5} className="h-4 w-4" />
      </button>
    </nav>
  );
}
