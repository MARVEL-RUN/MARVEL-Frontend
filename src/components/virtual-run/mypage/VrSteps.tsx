export function VrSteps({ labels, current }: { labels: readonly string[]; current: number }) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="vr-steps">
      <p className="vr-steps__count">
        STEP <strong>{pad(current)}</strong> / {pad(labels.length)}
      </p>
      <ol className="vr-steps__list">
        {labels.map((label, i) => {
          const n = i + 1;
          const cls = n === current ? "is-on" : n < current ? "is-done" : undefined;
          return (
            <li key={label} className={cls} aria-current={n === current ? "step" : undefined}>
              <span className="vr-steps__no">{pad(n)}</span>
              <span className="vr-steps__label">{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
