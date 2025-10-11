import clsx from "clsx";

import "src/components/modules/data-table/styles/table.css";
import { useSearchQuery } from "@packages/core/search-query/contexts/use-search-query";
import type { ColumnDefinition, RowData } from "@packages/core/table/types/type";
import type { ReactNode } from "react";
import { Pagination } from "./pagination";

type ClassNames = {
  theadClassName?: string;
  tbodyClassName?: string;
  headRowClassName?: string;
  bodyRowClassName?: string;
  trClassName?: string;
  thClassName?: string;
  tdClassName?: string;
  footerClassName?: string;
  className?: string;
};

export type TableProps = ClassNames & {
  noData?: ReactNode;
  loading?: boolean;
  onSortBy?: (sortBy: string) => void;
  children?: ReactNode;
  showPagination?: boolean;
  isLoading: boolean;
};

type DataTableProps<TData extends RowData> = TableProps & {
  data: TData[];
  columns: ColumnDefinition<TData>[];
};

export function Table<TData extends RowData>({
  data,
  className,
  columns,
  children,
  theadClassName,
  tbodyClassName,
  headRowClassName,
  bodyRowClassName,
  trClassName,
  thClassName,
  tdClassName,
  footerClassName,
  isLoading,
  onSortBy,
  showPagination,
}: DataTableProps<TData>): ReactNode {
  const {
    searchQuery: { page, limit },
  } = useSearchQuery();
  return (
    <table className={clsx("react-lib-table overflow-clip rounded-sm", className)} data-label="table">
      <thead className={theadClassName}>
        <tr className={clsx(trClassName, headRowClassName)}>
          {columns.map((column, index) => {
            return (
              <th
                className={clsx(thClassName, column.columnClassName, column.thClassName)}
                key={`${column.accessor}-${index}`}
                onClick={column.isSortable ? () => onSortBy?.(column.accessor) : undefined}
              >
                <div className={"heading-wrapper"}>
                  <span>{column.header ?? column.accessor}</span>
                  {/*{column.isSortable && (*/}
                  {/*  <CustomIcon*/}
                  {/*    name={"sort-desc"}*/}
                  {/*    className={clsx(*/}
                  {/*      "sort-icon",*/}
                  {/*      "w-4",*/}
                  {/*      defaultSortDirection === "asc" || (sortBy === column.accessor && sortDir === "asc")*/}
                  {/*        ? "is-asc rotate-180"*/}
                  {/*        : "is-desc",*/}
                  {/*    )}*/}
                  {/*  />*/}
                  {/*)}*/}
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody className={clsx(tbodyClassName)}>
        {(!data?.length || isLoading) && children ? (
          <tr className={clsx(trClassName, bodyRowClassName)}>
            <td colSpan={columns.length}>{children}</td>
          </tr>
        ) : null}
        {data.map((row, rowIndex) => (
          <tr className={clsx(trClassName, bodyRowClassName)} key={"id" in row ? (row.id as string) : rowIndex}>
            {columns.map((column, colIndex) => (
              <td
                className={clsx(tdClassName, column.columnClassName, column.tdClassName)}
                key={`${column.accessor}-${colIndex}`}
              >
                <div className={clsx(column.cellContentWrapperClassName)}>
                  {typeof column.value === "function"
                    ? column.value(row, {
                        index: rowIndex,
                        pageIndex: page && limit ? (page - 1) * limit + rowIndex : rowIndex,
                      })
                    : ((column.value ?? row[column.accessor]) as ReactNode)}
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      {!!showPagination && (
        <tfoot className={footerClassName}>
          <tr className={clsx(trClassName)}>
            <td colSpan={columns.length}>
              <div className={"pagination-wrapper"}>
                <Pagination />
              </div>
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}
