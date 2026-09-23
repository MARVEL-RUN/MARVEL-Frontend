"use client";

import { hasAdminApi } from "@/lib/admin/config";
import { addDays, toYmd } from "@/lib/admin/mockTrends";
import {
  fetchPaymentDailyGraph,
  type PaymentDailyGraphDay,
} from "@/services/admin/stats";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

const PRESETS = [
  { label: "7일", days: 6 },
  { label: "30일", days: 29 },
  { label: "1년", days: 364 },
] as const;

const CHART_H = 148;
const BAR_MAX = 112;
const LINE_PAD = { top: 8, right: 6, bottom: 6, left: 6 };

type ChartPoint = {
  date: string;
  count: number;
};

function formatListDate(date: string) {
  const [y, m, d] = date.split("-");
  return `${y}. ${m}. ${d}.`;
}

function formatAxisDate(date: string) {
  const [, m, d] = date.split("-");
  return `${Number(m)}/${Number(d)}`;
}

function yTicks(max: number) {
  if (max <= 0) return [0, 0, 0];
  const top = Math.max(4, Math.ceil(max / 4) * 4);
  return [top, Math.round(top / 2), 0];
}

function linePoint(index: number, total: number, count: number, max: number, width: number) {
  const innerW = Math.max(0, width - LINE_PAD.left - LINE_PAD.right);
  const innerH = Math.max(0, CHART_H - LINE_PAD.top - LINE_PAD.bottom);
  const x =
    total <= 1 ? LINE_PAD.left + innerW / 2 : LINE_PAD.left + (innerW * index) / (total - 1);
  const y = LINE_PAD.top + innerH - (max > 0 ? (count / max) * innerH : 0);
  return { x, y };
}

function linePath(trend: ChartPoint[], max: number, width: number) {
  return trend
    .map((item, i) => {
      const { x, y } = linePoint(i, trend.length, item.count, max, width);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function lineArea(trend: ChartPoint[], max: number, width: number) {
  if (!trend.length) return "";
  const line = linePath(trend, max, width);
  const first = linePoint(0, trend.length, trend[0].count, max, width);
  const last = linePoint(trend.length - 1, trend.length, trend[trend.length - 1].count, max, width);
  return `${line} L ${last.x} ${CHART_H - LINE_PAD.bottom} L ${first.x} ${CHART_H - LINE_PAD.bottom} Z`;
}

function axisIndices(total: number, maxLabels = 8) {
  if (total <= 1) return [0];
  if (total <= maxLabels) return Array.from({ length: total }, (_, i) => i);
  const step = (total - 1) / (maxLabels - 1);
  const indices = [0];
  for (let i = 1; i < maxLabels - 1; i++) indices.push(Math.round(i * step));
  indices.push(total - 1);
  return [...new Set(indices)];
}

type Props = {
  eventId: string;
};

export function PaymentDailyGraph({ eventId }: Props) {
  const today = toYmd(new Date());
  const [startDate, setStartDate] = useState(addDays(today, -29));
  const [endDate, setEndDate] = useState(today);
  const [hover, setHover] = useState<PaymentDailyGraphDay | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "payment-daily-graph", eventId, startDate, endDate],
    queryFn: () => fetchPaymentDailyGraph({ eventId, startDate, endDate }),
    enabled: hasAdminApi && Boolean(eventId),
  });

  const days = data?.days ?? [];
  const trend = useMemo<ChartPoint[]>(
    () => days.map((row) => ({ date: row.date, count: row.dailyCount })),
    [days],
  );

  const todayCount = days.find((row) => row.date === today)?.dailyCount ?? 0;
  const maxCount = Math.max(1, ...trend.map((row) => row.count));
  const ticks = yTicks(maxCount);
  const useLine = trend.length > 45;
  const dayCount = trend.length;
  const activePreset = PRESETS.find(
    (preset) => addDays(today, -preset.days) === startDate && endDate === today,
  )?.label;
  const gradientId = `payment-daily-${eventId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const plotWidth = 640;

  const applyPreset = (offset: number) => {
    setStartDate(addDays(today, -offset));
    setEndDate(today);
    setHover(null);
  };

  return (
    <section className="admin-trend admin-trend--embed">
      <h3 className="admin-trend__embed-title">일별 결제자</h3>
      <div className="admin-trend__body">
        <div className="admin-trend__filters">
          <label>
            시작일
            <input
              type="date"
              value={startDate}
              max={endDate}
              disabled={isLoading}
              onChange={(event) => {
                setStartDate(event.target.value);
                setHover(null);
              }}
            />
          </label>
          <label>
            종료일
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={today}
              disabled={isLoading}
              onChange={(event) => {
                setEndDate(event.target.value);
                setHover(null);
              }}
            />
          </label>
          <div className="admin-trend__presets">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className={activePreset === preset.label ? "is-on" : undefined}
                disabled={isLoading}
                onClick={() => applyPreset(preset.days)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-trend__stats">
          <div>
            <span>오늘</span>
            <strong>{isLoading ? "…" : todayCount.toLocaleString()}</strong>
          </div>
          <div>
            <span>기간 합계</span>
            <strong>{isLoading ? "…" : (data?.periodTotal ?? 0).toLocaleString()}</strong>
          </div>
          <div className="is-accent">
            <span>누적</span>
            <strong>{isLoading ? "…" : (data?.cumulativeTotal ?? 0).toLocaleString()}</strong>
          </div>
        </div>

        {isError ? (
          <p className="admin-empty">일별 결제자 그래프를 불러오지 못했습니다.</p>
        ) : isLoading && !days.length ? (
          <p className="admin-empty">불러오는 중…</p>
        ) : !days.length ? (
          <p className="admin-empty">표시할 데이터가 없습니다.</p>
        ) : (
          <>
            <div className="admin-trend__chart" onMouseLeave={() => setHover(null)}>
              {hover ? (
                <div className="admin-trend__tip">
                  <p>{formatListDate(hover.date)}</p>
                  <strong>
                    {hover.dailyCount.toLocaleString()}
                    <em>명</em>
                  </strong>
                  <p className="admin-trend__tip-sub">
                    누적 {hover.cumulativeCount.toLocaleString()}명
                  </p>
                </div>
              ) : null}

              <div className="admin-trend__plot">
                <div className="admin-trend__y">
                  {ticks.map((tick) => (
                    <span key={`y-${tick}`}>{tick.toLocaleString()}</span>
                  ))}
                </div>
                <div className="admin-trend__grid">
                  {ticks.map((tick) => (
                    <i key={`g-${tick}`} />
                  ))}
                  {useLine ? (
                    <svg
                      className="admin-trend__line"
                      viewBox={`0 0 ${plotWidth} ${CHART_H}`}
                      preserveAspectRatio="none"
                      aria-hidden
                    >
                      <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1a73e8" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#1a73e8" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      <path d={lineArea(trend, maxCount, plotWidth)} fill={`url(#${gradientId})`} />
                      <path
                        d={linePath(trend, maxCount, plotWidth)}
                        fill="none"
                        stroke="#1a73e8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  ) : (
                    <div className="admin-trend__bars">
                      {days.map((item) => {
                        const h = Math.max(
                          item.dailyCount > 0 ? 6 : 2,
                          Math.round((item.dailyCount / maxCount) * BAR_MAX),
                        );
                        const on = hover?.date === item.date;
                        return (
                          <button
                            key={item.date}
                            type="button"
                            className={on ? "is-on" : undefined}
                            style={{ height: h }}
                            aria-label={`${formatListDate(item.date)} ${item.dailyCount}명`}
                            onMouseEnter={() => setHover(item)}
                          />
                        );
                      })}
                    </div>
                  )}
                  <div className={`admin-trend__axis${useLine ? " is-plot" : ""}`}>
                    {useLine
                      ? axisIndices(trend.length).map((index) => (
                          <span
                            key={trend[index].date}
                            style={{
                              left: `${trend.length <= 1 ? 50 : (index / (trend.length - 1)) * 100}%`,
                            }}
                          >
                            {formatAxisDate(trend[index].date)}
                          </span>
                        ))
                      : trend.map((item, index) => {
                          const show =
                            dayCount <= 10 ||
                            index % Math.ceil(dayCount / 8) === 0 ||
                            index === dayCount - 1;
                          return (
                            <span key={item.date} className={show ? undefined : "is-hidden"}>
                              {show ? formatAxisDate(item.date) : ""}
                            </span>
                          );
                        })}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-trend__list admin-trend__list--triple">
              <div className="admin-trend__list-head">
                <span>날짜</span>
                <span>당일</span>
                <span>누적</span>
              </div>
              <div className="admin-trend__list-body">
                {[...days].reverse().map((item) => (
                  <button
                    key={item.date}
                    type="button"
                    className={hover?.date === item.date ? "is-on" : undefined}
                    onMouseEnter={() => setHover(item)}
                  >
                    <span>{formatListDate(item.date)}</span>
                    <strong>
                      {item.dailyCount.toLocaleString()}
                      <em>명</em>
                    </strong>
                    <strong>
                      {item.cumulativeCount.toLocaleString()}
                      <em>명</em>
                    </strong>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
