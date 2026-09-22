"use client";

import { AdminPagination } from "@/components/admin/Pagination";

type Column<T> = {
  key: string;
  header: React.ReactNode;
  className?: string;
  width?: string;
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
  rowClassName?: (row: T) => string | undefined;
  minRows?: number;
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
  rowClassName,
  minRows,
}: Props<T>) {
  const count = totalCount ?? rows.length;
  const showPager = Boolean(onPage) && !loading && count > 0;
  const padCount = minRows && rows.length > 0 ? Math.max(0, minRows - rows.length) : 0;

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
            <colgroup>
              {columns.map((col) => (
                <col key={col.key} style={col.width ? { width: col.width } : undefined} />
              ))}
            </colgroup>
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
                  className={[rowClassName?.(row), isRowSelected?.(row) ? "is-picked" : undefined]
                    .filter(Boolean)
                    .join(" ") || undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={col.className}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
              {Array.from({ length: padCount }, (_, index) => (
                <tr key={`pad-${index}`} className="is-pad" aria-hidden>
                  {columns.map((col) => (
                    <td key={col.key} className={col.className}>
                      {"\u00a0"}
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
