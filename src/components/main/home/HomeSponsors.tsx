import { SponsorsBrandsRows } from "../brands/BrandsPage";

export function HomeSponsors() {
  return (
    <section className="sponsors" id="sponsors" aria-labelledby="sponsors-title">
      <div className="sponsors__inner reveal">
        <p className="kicker">BRANDS</p>
        <h2 className="sponsors__title" id="sponsors-title">
          마블런과 <em>함께하는 브랜드</em>
        </h2>
        <SponsorsBrandsRows />
      </div>
    </section>
  );
}
