import { EVENT } from "@/lib/event";

export function EventInfo() {
  return (
    <section className="info">
      <h2 className="info__heading">대회안내</h2>

      <dl className="info__list">
        {EVENT.info.map((item) => (
          <div key={item.label} className="info__row">
            <dt className="info__label">{item.label}</dt>
            <dd className="info__value">{item.value}</dd>
            {"note" in item && item.note ? (
              <dd className="info__note">{item.note}</dd>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  );
}
