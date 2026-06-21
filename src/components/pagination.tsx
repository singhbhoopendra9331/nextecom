"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type PaginationData = {
  page: number;
  pages: number;
  total?: number;
};

type Props = {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
};

export function Pagination({ pagination, onPageChange }: Props) {
  const { page, pages } = pagination;

  if (pages <= 1) return null;

  const createPages = () => {
    const delta = 2;
    const range: number[] = [];

    const start = Math.max(1, page - delta);
    const end = Math.min(pages, page + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  };

  const pageNumbers = createPages();

  return (
    <div className="flex items-center justify-between gap-4 mt-6 flex-wrap">
      {/* INFO */}
      <div className="text-sm text-muted-foreground">
        Page {page} of {pages}
      </div>

      {/* CONTROLS */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="p-2 rounded-md border disabled:opacity-40"
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-md border disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 rounded-md border text-sm
              ${p === page ? "bg-primary text-primary-foreground" : ""}
            `}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="p-2 rounded-md border disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>

        <button
          onClick={() => onPageChange(pages)}
          disabled={page === pages}
          className="p-2 rounded-md border disabled:opacity-40"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}