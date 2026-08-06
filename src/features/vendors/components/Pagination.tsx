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
    <nav className="flex justify-center items-center gap-2 mt-12" aria-label="Phân trang">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Trang trước"
        className="w-10 h-10 flex items-center justify-center rounded-full border border-rose-100 bg-white text-[#1B2C40] hover:border-[#1B2C40] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-rose-100 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-[#6B92B4] text-sm select-none">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${
              page === currentPage
                ? 'bg-[#1B2C40] text-white shadow-sm'
                : 'border border-rose-100 bg-white text-[#1B2C40] hover:border-[#1B2C40]'
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
        className="w-10 h-10 flex items-center justify-center rounded-full border border-rose-100 bg-white text-[#1B2C40] hover:border-[#1B2C40] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-rose-100 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
