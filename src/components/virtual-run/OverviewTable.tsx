import { VIRTUAL_RUN_OVERVIEW_ROWS } from "@/lib/virtual-run/event";

export function OverviewTable() {
  return (
    <section aria-labelledby="vr-overview-title">
      <h2 id="vr-overview-title" className="vr-section-title">
        OVERVIEW
      </h2>
      <dl className="vr-overview">
        {VIRTUAL_RUN_OVERVIEW_ROWS.map((row) => (
          <div key={row.label} className="vr-overview__row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
