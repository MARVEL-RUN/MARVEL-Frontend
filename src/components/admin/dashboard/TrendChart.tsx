"use client";

import { useMemo, useState } from "react";

type DayPoint = {
  date: string;
  label: string;
  visitors: number;
  applicants: number;
};

const DAYS_14: DayPoint[] = [
  { date: "2026-08-26", label: "8/26", visitors: 142, applicants: 3 },
  { date: "2026-08-27", label: "8/27", visitors: 168, applicants: 4 },
  { date: "2026-08-28", label: "8/28", visitors: 154, applicants: 2 },
  { date: "2026-08-29", label: "8/29", visitors: 201, applicants: 7 },
  { date: "2026-08-30", label: "8/30", visitors: 176, applicants: 5 },
  { date: "2026-08-31", label: "8/31", visitors: 229, applicants: 8 },
  { date: "2026-09-01", label: "9/1", visitors: 188, applicants: 4 },
  { date: "2026-09-02", label: "9/2", visitors: 182, applicants: 6 },
  { date: "2026-09-03", label: "9/3", visitors: 210, applicants: 8 },
  { date: "2026-09-04", label: "9/4", visitors: 198, applicants: 5 },
  { date: "2026-09-05", label: "9/5", visitors: 256, applicants: 12 },
  { date: "2026-09-06", label: "9/6", visitors: 241, applicants: 9 },
  { date: "2026-09-07", label: "9/7", visitors: 318, applicants: 14 },
  { date: "2026-09-08", label: "9/8", visitors: 274, applicants: 11 },
];

const TABS = [
  { key: 7, label: "7일" },
  { key: 14, label: "14일" },
] as const;

function ticks(max: number, count = 4) {
  const step = Math.ceil(max / count) || 1;
  return Array.from({ length: count + 1 }, (_, i) => step * (count - i));
}

export function TrendChart() {
  const [range, setRange] = useState<7 | 14>(7);
  const rows = DAYS_14.slice(-range);
  const visitMax = Math.max(...rows.map((row) => row.visitors), 1);
  const applyMax = Math.max(...rows.map((row) => row.applicants), 1);
  const visitTicks = useMemo(() => ticks(visitMax), [visitMax]);
  const applyTicks = useMemo(() => ticks(applyMax), [applyMax]);
  const today = rows[rows.length - 1];
  const visitSum = rows.reduce((sum, row) => sum + row.visitors, 0);
  const applySum = rows.reduce((sum, row) => sum + row.applicants, 0);

  return (
    <section className="admin-chart">
      <header className="admin-chart__head">
        <h2>날짜별 현황</h2>
        <p>방문자 · 신청자</p>
        <div className="admin-chart__tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={range === tab.key}
              className={range === tab.key ? "is-on" : undefined}
              onClick={() => setRange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="admin-chart__plot">
        <div className="admin-chart__axis" aria-hidden>
          {visitTicks.map((n) => (
            <span key={`v-${n}`}>{n.toLocaleString()}</span>
          ))}
        </div>
        <div className="admin-chart__cols">
          {rows.map((row) => (
            <div key={row.date} className="admin-chart__col">
              <div className="admin-chart__bars">
                <span
                  className="admin-chart__bar is-visit"
                  style={{ height: `${Math.max((row.visitors / visitTicks[0]) * 100, 2)}%` }}
                  title={`방문자 ${row.visitors}`}
                />
                <span
                  className="admin-chart__bar is-apply"
                  style={{ height: `${Math.max((row.applicants / applyTicks[0]) * 100, 2)}%` }}
                  title={`신청자 ${row.applicants}`}
                />
              </div>
              <em>{row.label}</em>
            </div>
          ))}
        </div>
        <div className="admin-chart__axis admin-chart__axis--right" aria-hidden>
          {applyTicks.map((n) => (
            <span key={`a-${n}`}>{n.toLocaleString()}</span>
          ))}
        </div>
      </div>

      <footer className="admin-chart__foot">
        <span>
          <i className="admin-chart__dot is-visit" />
          방문자
        </span>
        <span>
          <i className="admin-chart__dot is-apply" />
          신청자
        </span>
        <strong>오늘 방문자 {today.visitors.toLocaleString()}</strong>
        <strong>오늘 신청 {today.applicants.toLocaleString()}</strong>
        <span>
          {range}일 합계 {visitSum.toLocaleString()} / {applySum.toLocaleString()}
        </span>
      </footer>
    </section>
  );
}
