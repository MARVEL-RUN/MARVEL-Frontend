import { VIRTUAL_RUN_OVERVIEW_ROWS } from "@/lib/virtual-run/event";

export function OverviewTable() {
  return (
    <section aria-labelledby="vr-overview-title">
      <h2 id="vr-overview-title">OVERVIEW</h2>
      <dl className="spec">
        {VIRTUAL_RUN_OVERVIEW_ROWS.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
