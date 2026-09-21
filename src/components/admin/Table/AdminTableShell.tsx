"use client";

import { AdminPagination } from "@/components/admin/Pagination";

type Column<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
};

type Props<T> = {
  title: string;
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  loading?: boolean;
  empty?: string;
  tools?: React.ReactNode;
  actions?: React.ReactNode;
  page?: number;
  pageCount?: number;
  totalCount?: number;
  onPage?: (page: number) => void;
  pageUnit?: string;
  onRowClick?: (row: T) => void;
  isRowSelected?: (row: T) => boolean;
};

export function AdminTableShell<T>({
  title,
  rows,
  columns,
  rowKey,
  loading,
  empty = "데이터가 없습니다.",
  tools,
  actions,
  page = 1,
  pageCount = 1,
  totalCount,
  onPage,
  pageUnit,
  onRowClick,
  isRowSelected,
}: Props<T>) {
  const count = totalCount ?? rows.length;
  const showPager = Boolean(onPage) && !loading && count > 0;

  return (
    <section className="admin-table-shell">
      <div className="admin-table-shell__head">
        <h1>{title}</h1>
        {actions}
      </div>
      <div className="admin-toolbar">
        <p className="admin-toolbar__count">
          검색 결과 총 <strong>{loading ? "…" : count}</strong>개
        </p>
        {tools ? <div className="admin-toolbar__fields">{tools}</div> : null}
      </div>
      <div className="admin-table-wrap">
        {loading ? (
          <p className="admin-empty">불러오는 중…</p>
        ) : rows.length === 0 ? (
          <p className="admin-empty">{empty}</p>
        ) : (
          <table className={`admin-table${onRowClick ? " is-clickable" : ""}`}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={col.className}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={isRowSelected?.(row) ? "is-picked" : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={col.className}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showPager && onPage ? (
        <AdminPagination
          total={count}
          page={page}
          pageCount={Math.max(1, pageCount)}
          onPage={onPage}
          unit={pageUnit}
        />
      ) : null}
    </section>
  );
}
