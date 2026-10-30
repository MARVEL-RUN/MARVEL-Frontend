import type { ReactNode } from "react";

export function VrFormSec({
  title,
  kicker,
  note,
  children,
}: {
  title: string;
  kicker?: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="form-sec">
      <header className="form-sec__head">
        {kicker ? <p className="form-sec__index">{kicker}</p> : null}
        <h2>{title}</h2>
      </header>
      {note ? <p className="form-sec__note">{note}</p> : null}
      <div className="form-sec__body">{children}</div>
    </section>
  );
}

export function VrFormRow({
  label,
  required,
  hint,
  hintErr,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  hintErr?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="form-row">
      <p className="form-row__label">
        {label}
        {required ? <em> *</em> : null}
      </p>
      <div className="form-row__ctrl">
        {children}
        {hint ? (
          <p className={hintErr ? "form-row__hint is-err" : "form-row__hint"}>{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

export function VrApplyNotice({ lines }: { lines: readonly string[] }) {
  return (
    <div className="apply-notice">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}
