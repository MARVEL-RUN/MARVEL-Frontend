import {
  FINISH_PACKAGE_ITEMS,
  FINISH_PACKAGE_PICKUP_NOTE,
} from "@/lib/finish-package";

export function KitFinishPackagePane() {
  return (
    <section className="kit-gallery__pane kit-gallery__pane--finish">
      <header className="kit-gallery__head">
        <p className="kit-gallery__index">05 / FINISH</p>
        <h3>완주 패키지</h3>
      </header>
      <ol className="kit-finish">
        {FINISH_PACKAGE_ITEMS.map((item) => (
          <li
            key={item.no}
            className={item.wide ? "kit-finish__item--wide" : undefined}
          >
            <figure className="kit-finish__figure">
              <div className="kit-finish__label">
                <span className="kit-finish__no" aria-hidden="true">
                  {item.no}
                </span>
                <figcaption className="kit-finish__title">{item.title}</figcaption>
              </div>
              {item.image ? (
                <span
                  className={
                    item.wide
                      ? "kit-finish__frame kit-finish__frame--wide"
                      : "kit-finish__frame"
                  }
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
              ) : null}
              {item.note ? (
                <p className="kit-finish__note">{item.note}</p>
              ) : null}
            </figure>
          </li>
        ))}
      </ol>
      <p className="kit-gallery__note">{FINISH_PACKAGE_PICKUP_NOTE}</p>
    </section>
  );
}
