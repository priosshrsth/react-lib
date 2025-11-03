"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { useSearchQuery } from "../../search-query/contexts/use-search-query";

const MAX_PAGES_TO_SHOW_ALL_PAGES = 7;
const MIN_PAGE_TO_SHOW_ELLIPSIS = 3;

interface PageBtnProps {
  num: number;
  isActive: boolean;
  onClick: (n: number) => void;
  pageBtnClassName?: string;
  activePageBtnClassName?: string;
}

function PageBtn({ num, isActive, onClick, pageBtnClassName, activePageBtnClassName }: PageBtnProps) {
  const className = [pageBtnClassName, isActive ? activePageBtnClassName : undefined].filter(Boolean).join(" ");
  return (
    <button
      aria-current={isActive ? "page" : undefined}
      className={clsx("pagination-button", className)}
      key={num}
      onClick={() => onClick(num)}
      type="button"
    >
      {num}
    </button>
  );
}

const makeEllipsis = (keyId: string, className?: string) => (
  <span className={className || undefined} key={keyId}>
    …
  </span>
);

export interface PaginationProps {
  containerClassName?: string;
  resultsWrapperClassName?: string;
  pageNumbersWrapperClassName?: string;
  navButtonClassName?: string;
  pageButtonClassName?: string;
  activePageButtonClassName?: string;
  ellipsisClassName?: string;
  prevLabel?: ReactNode;
  nextLabel?: ReactNode;
}

export function Pagination({
  containerClassName,
  resultsWrapperClassName,
  pageNumbersWrapperClassName,
  navButtonClassName,
  pageButtonClassName,
  activePageButtonClassName,
  ellipsisClassName,
  prevLabel = "<",
  nextLabel = ">",
}: PaginationProps): ReactNode {
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
    list.push(
      <PageBtn
        activePageBtnClassName={activePageButtonClassName}
        isActive={page === n}
        key={n}
        num={n}
        onClick={onJump}
        pageBtnClassName={pageButtonClassName}
      />
    );

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
      list.push(makeEllipsis("ellipsis-left", ellipsisClassName));
    }

    // Middle window (neighbors)
    const { start, end } = windowRange(page, totalPages);
    addRange(list, start, end);

    // Right ellipsis
    if (page < totalPages - 2) {
      list.push(makeEllipsis("ellipsis-right", ellipsisClassName));
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
    <div className={clsx("react-lib-pagination", containerClassName)}>
      <div className={clsx("summary", resultsWrapperClassName)}>
        <span>
          Showing {total > 0 ? startItem : 0}-{endItem} of {total} results
        </span>
      </div>

      <div className={"pagination-buttons"}>
        <button
          className={clsx("pagination-button", navButtonClassName)}
          disabled={page <= 1}
          onClick={handlePrevious}
          type="button"
        >
          {prevLabel}
        </button>

        <div className={pageNumbersWrapperClassName}>{renderPageNumbers()}</div>

        <button
          className={clsx("pagination-button", navButtonClassName)}
          disabled={page >= totalPages}
          onClick={handleNext}
          type="button"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
