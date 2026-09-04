export function MarvelLogo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center bg-[#ED1D24] px-[0.22em] pt-[0.1em] pb-[0.02em] leading-none text-white ${className}`}
      aria-label="MARVEL"
    >
      <span className="font-display text-[1em] font-extrabold tracking-[0.04em]">
        MARVEL
      </span>
    </span>
  );
}
