import { EVENT } from "@/lib/event";

export function Sponsors() {
  return (
    <section className="sponsors">
      <ul className="sponsors__list">
        {EVENT.sponsors.map((sponsor) => (
          <li key={sponsor.role} className="sponsors__item">
            <p className="sponsors__role">{sponsor.role}</p>
            <div className="sponsors__logo" aria-label={sponsor.name} />
          </li>
        ))}
      </ul>
    </section>
  );
}
