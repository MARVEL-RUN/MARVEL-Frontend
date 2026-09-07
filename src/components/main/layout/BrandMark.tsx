export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "mark mark--compact" : "mark"}>
      <span className="mark__marvel">MARVEL</span>
      <span className="mark__run">RUN</span>
    </span>
  );
}
