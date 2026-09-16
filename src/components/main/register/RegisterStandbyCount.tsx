import { Fragment } from "react";

type Slots = {
  d: string;
  h: string;
  m: string;
  s: string;
};

export function RegisterStandbyCount({ slots }: { slots: Slots }) {
  const units = [
    [slots.d, "DAY"],
    [slots.h, "HR"],
    [slots.m, "MIN"],
    [slots.s, "SEC"],
  ] as const;

  return (
    <div className="standby-count" aria-hidden>
      {units.map(([n, u], i) => (
        <Fragment key={u}>
          {i > 0 ? <i className="standby-count__colon">:</i> : null}
          <span className="standby-count__tick">
            <strong className="standby-count__digit" key={n}>
              {n}
            </strong>
            <em>{u}</em>
          </span>
        </Fragment>
      ))}
    </div>
  );
}
