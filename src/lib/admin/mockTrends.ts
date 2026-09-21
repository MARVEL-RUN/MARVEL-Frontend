export type TrendPoint = {
  date: string;
  count: number;
};

export type TrendKind = "visitor" | "applicant";

export function toYmd(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseYmd(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(value: string, amount: number) {
  const date = parseYmd(value);
  date.setDate(date.getDate() + amount);
  return toYmd(date);
}

export function eachYmd(start: string, end: string) {
  const days: string[] = [];
  if (start > end) return days;
  let cursor = start;
  while (cursor <= end) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

function hash(kind: TrendKind, date: string) {
  let n = kind === "visitor" ? 17 : 41;
  for (const ch of `${kind}:${date}`) n = (n * 33 + ch.charCodeAt(0)) >>> 0;
  return n;
}

function countFor(kind: TrendKind, date: string) {
  const n = hash(kind, date);
  const dow = parseYmd(date).getDay();
  const weekend = dow === 0 || dow === 6;
  if (kind === "visitor") {
    const base = 70 + (n % 90);
    return weekend ? Math.round(base * 0.52) : base;
  }
  const base = n % 11;
  return weekend ? Math.max(0, base - 3) : base + 3;
}

export function mockTrend(kind: TrendKind, start: string, end: string): TrendPoint[] {
  return eachYmd(start, end).map((date) => ({ date, count: countFor(kind, date) }));
}

export function mockSnapshot(kind: TrendKind, today: string, range: TrendPoint[]) {
  const daily = countFor(kind, today);
  const period = range.reduce((sum, row) => sum + row.count, 0);
  const history = mockTrend(kind, addDays(today, -400), today);
  const cumulative = history.reduce((sum, row) => sum + row.count, 0);
  return { daily, period, cumulative };
}
