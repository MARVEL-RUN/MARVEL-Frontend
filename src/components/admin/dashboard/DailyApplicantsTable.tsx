"use client";

import type { DailyApplicantStat } from "@/services/admin/stats";

type Props = {
  rows: DailyApplicantStat[];
  loading?: boolean;
};

function formatDay(date: string) {
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return date;
  return `${y}. ${m}. ${d}.`;
}

export function DailyApplicantsTable({ rows, loading }: Props) {
  return (
    <section className="admin-dash__section">
      <h2>날짜별 신청</h2>
      <p className="admin-ops-guide__lead">
        신청일 기준 건수입니다. 대회당 최근 목록 기준으로 집계합니다.
      </p>

      <div className="admin-daily-table">
        {loading && rows.length === 0 ? (
          <p className="admin-empty">불러오는 중…</p>
        ) : rows.length === 0 ? (
          <p className="admin-empty">신청 내역이 없습니다.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th scope="col">날짜</th>
                <th scope="col" className="is-num">
                  합계
                </th>
                <th scope="col" className="is-num">
                  개인
                </th>
                <th scope="col" className="is-num">
                  단체
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.date}>
                  <td>{formatDay(row.date)}</td>
                  <td className="is-num">{row.total.toLocaleString()}</td>
                  <td className="is-num">{row.individual.toLocaleString()}</td>
                  <td className="is-num">{row.group.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
