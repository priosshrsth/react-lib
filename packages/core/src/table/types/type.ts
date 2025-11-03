import type { ReactNode } from "react";

export type RowData = Record<string, unknown>;

export interface ColumnDefinition<TData extends RowData> {
  header?: ReactNode;
  accessor: Extract<keyof TData, string> | string;
  value?: ReactNode | ((row: TData, meta: { index: number; pageIndex: number }) => ReactNode);
  columnClassName?: string;
  thClassName?: string;
  cellContentWrapperClassName?: string;
  tdClassName?: string;
  isSortable?: boolean;
  skeleton?: ReactNode;
}
