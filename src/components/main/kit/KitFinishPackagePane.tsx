import {
  FINISH_PACKAGE_ITEMS,
  FINISH_PACKAGE_PICKUP_NOTE,
  type FinishPackageItem,
} from "@/lib/finish-package";

function FinishPackageItemCard({ item }: { item: FinishPackageItem }) {
  return (
    <li>
      <figure className="kit-finish__figure">
        <div className="kit-finish__label">
          <span className="kit-finish__no" aria-hidden="true">
            {item.no}
          </span>
          <figcaption className="kit-finish__title">{item.title}</figcaption>
        </div>
        {item.image ? (
          <span className="kit-finish__media">
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              decoding="async"
            />
          </span>
        ) : null}
        {item.note ? <p className="kit-finish__note">{item.note}</p> : null}
      </figure>
    </li>
  );
}

const FINISH_PAIR = FINISH_PACKAGE_ITEMS.filter((item) => item.no <= 2);
const FINISH_GRID = FINISH_PACKAGE_ITEMS.filter((item) => item.no > 2);

export function KitFinishPackagePane() {
  return (
    <section className="kit-gallery__pane kit-gallery__pane--finish">
      <header className="kit-gallery__head">
        <p className="kit-gallery__index">05 / FINISH</p>
        <h3>완주 패키지</h3>
      </header>
      <div className="kit-finish-wrap">
        <ol className="kit-finish kit-finish--pair">
          {FINISH_PAIR.map((item) => (
            <FinishPackageItemCard key={item.no} item={item} />
          ))}
        </ol>
        <ol className="kit-finish kit-finish--grid">
          {FINISH_GRID.map((item) => (
            <FinishPackageItemCard key={item.no} item={item} />
          ))}
        </ol>
      </div>
      <p className="kit-gallery__note">{FINISH_PACKAGE_PICKUP_NOTE}</p>
    </section>
  );
}
