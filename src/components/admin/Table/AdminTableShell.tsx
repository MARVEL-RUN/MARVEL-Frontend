"use client";

type Column<T> = {
  key: string;
  header: string;
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
  onPage?: (page: number) => void;
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
  onPage,
}: Props<T>) {
  return (
    <section className="admin-table-shell">
      <div className="admin-table-shell__head">
        <h1>{title}</h1>
        {actions}
      </div>
      <div className="admin-toolbar">
        <p className="admin-toolbar__count">
          검색 결과 총 <strong>{loading ? "…" : rows.length}</strong>개
        </p>
        {tools ? <div className="admin-toolbar__fields">{tools}</div> : null}
      </div>
      <div className="admin-table-wrap">
        {loading ? (
          <p className="admin-empty">불러오는 중…</p>
        ) : rows.length === 0 ? (
          <p className="admin-empty">{empty}</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((col) => (
                    <td key={col.key}>{col.render(row)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {onPage && pageCount > 1 ? (
        <div className="admin-pager">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={n === page ? "is-on" : undefined}
              onClick={() => onPage(n)}
            >
              {n}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
