"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [];

  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, "...", total);
  } else if (current >= total - 3) {
    pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total);
  }

  return pages;
}

export default function Pagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/60">
      {/* Left: per-page + info */}
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span className="hidden sm:inline">Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white text-gray-700 focus:ring-primary focus:border-primary cursor-pointer"
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="text-gray-400 text-xs whitespace-nowrap">
          {totalItems === 0
            ? "No entries"
            : `Showing ${from}–${to} of ${totalItems}`}
        </span>
      </div>

      {/* Right: page buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Prev */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          {pageNumbers.map((pg, idx) =>
            pg === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-1.5 text-gray-400 text-sm select-none"
              >
                …
              </span>
            ) : (
              <button
                key={pg}
                onClick={() => onPageChange(pg as number)}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === pg
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {pg}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
