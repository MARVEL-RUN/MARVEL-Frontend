export function StatsLoading({ label = "불러오는 중입니다" }: { label?: string }) {
  return (
    <div className="admin-stats-loading" role="status" aria-live="polite">
      <span className="admin-stats-loading__spin" aria-hidden />
      <span>{label}</span>
    </div>
  );
}
