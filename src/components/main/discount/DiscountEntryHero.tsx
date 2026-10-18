import type { DiscountLinkVariant } from "@/lib/discount-link/config";

export type DiscountHeroProps = {
  kicker: string;
  title: string;
  en: string;
  lead?: string;
  partnerTag?: string;
  variant?: DiscountLinkVariant;
};

export function DiscountEntryHero({ entry }: { entry: DiscountHeroProps }) {
  return (
    <header className="discount-hero" aria-labelledby="discount-hero-title">
      <div className="discount-hero__mesh" aria-hidden />
      <div className="discount-hero__slash" aria-hidden />
      <div className="wrap discount-hero__inner">
        <div className="discount-hero__top">
          {entry.partnerTag ? (
            <span className="discount-hero__partner">{entry.partnerTag}</span>
          ) : null}
          <span className="discount-hero__badge">할인 링크 전용</span>
        </div>
        <p className="kicker discount-hero__kicker">{entry.kicker}</p>
        <h1 id="discount-hero-title" className="discount-hero__title">
          {entry.title}
        </h1>
        <p className="discount-hero__en">{entry.en}</p>
        {entry.lead ? <p className="discount-hero__lead">{entry.lead}</p> : null}
      </div>
    </header>
  );
}
