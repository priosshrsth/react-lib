"use client";

import { useSearchQuery } from "@react-lib/core/search-query/contexts/use-search-query";
import type { ReactNode } from "react";

const PAGE_BTN_CLASS = "h-9 w-9 p-0 transition-colors";

const MAX_PAGES_TO_SHOW_ALL_PAGES = 7;
const MIN_PAGE_TO_SHOW_ELLIPSIS = 3;

type PageBtnProps = {
  num: number;
  isActive: boolean;
  onClick: (n: number) => void;
};

function PageBtn({ num, isActive, onClick }: PageBtnProps) {
  return (
    <button
      aria-current={isActive ? "page" : undefined}
      className={`${PAGE_BTN_CLASS} ${isActive ? "rounded-md border border-border font-medium" : ""}`}
      key={num}
      onClick={() => onClick(num)}
      type="button"
    >
      {num}
    </button>
  );
}

const makeEllipsis = (keyId: string) => (
  <span className="px-2 text-muted-foreground" key={keyId}>
    …
  </span>
);

export function Pagination(): ReactNode {
  const {
    searchQuery: { page, limit },
    total,
    updateQuery,
  } = useSearchQuery();
  const totalPages = Math.ceil(total / limit);
  // Hide pagination when there's 0 or 1 page
  if (!Number.isFinite(totalPages)) {
    return null;
  }
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const onJump = (n: number) => {
    updateQuery({ page: n });
  };

  const handlePrevious = () => {
    if (page > 1) {
      updateQuery({ page: page - 1 });
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      updateQuery({ page: page + 1 });
    }
  };

  // Helpers to keep renderPageNumbers simple and under complexity limits
  const addPage = (list: ReactNode[], n: number) =>
    list.push(<PageBtn isActive={page === n} key={n} num={n} onClick={onJump} />);

  const addRange = (list: ReactNode[], start: number, end: number) => {
    for (let i = start; i <= end; i++) {
      addPage(list, i);
    }
  };

  const windowRange = (current: number, totalPgs: number) => {
    const start = Math.max(2, current - 1);
    const end = Math.min(totalPgs - 1, current + 1);
    return { start, end };
  };

  const renderWithEllipsis = (): ReactNode[] => {
    const list: ReactNode[] = [];

    // Always show first
    addPage(list, 1);

    // Left ellipsis
    if (page > MIN_PAGE_TO_SHOW_ELLIPSIS) {
      list.push(makeEllipsis("ellipsis-left"));
    }

    // Middle window (neighbors)
    const { start, end } = windowRange(page, totalPages);
    addRange(list, start, end);

    // Right ellipsis
    if (page < totalPages - 2) {
      list.push(makeEllipsis("ellipsis-right"));
    }

    // Always show last (if more than one page)
    if (totalPages > 1) {
      addPage(list, totalPages);
    }

    return list;
  };

  const renderAll = (): ReactNode[] => {
    const list: ReactNode[] = [];
    addRange(list, 1, totalPages);
    return list;
  };

  const renderPageNumbers = () => {
    if (totalPages <= MAX_PAGES_TO_SHOW_ALL_PAGES) {
      return renderAll();
    }
    return renderWithEllipsis();
  };

  return (
    <div className="flex items-center justify-between border-border/50 border-t bg-background/50 px-6 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <span className="font-medium">
          Showing {total > 0 ? startItem : 0}-{endItem} of {total} results
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          className="bg-transparent transition-colors hover:bg-muted/50 disabled:opacity-60"
          disabled={page <= 1}
          onClick={handlePrevious}
          type={"button"}
        >
          {"<"}
        </button>

        <div className="mx-2 flex items-center gap-1">{renderPageNumbers()}</div>

        <button
          className="bg-transparent transition-colors hover:bg-muted/50 disabled:opacity-60"
          disabled={page >= totalPages}
          onClick={handleNext}
          type={"button"}
        >
          {">"}
        </button>
      </div>
    </div>
  );
}
