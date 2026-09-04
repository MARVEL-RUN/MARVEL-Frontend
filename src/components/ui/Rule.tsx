export function Rule({ width = "wide" }: { width?: "wide" | "narrow" }) {
  return (
    <span
      aria-hidden
      className={`block h-px bg-[var(--rule)] ${
        width === "wide" ? "w-[86%]" : "w-[70%]"
      }`}
    />
  );
}
