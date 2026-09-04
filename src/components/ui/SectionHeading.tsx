export function SectionHeading({ children }: { children: string }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <span className="h-px flex-1 bg-white/20" />
      <h2 className="shrink-0 text-[13px] font-semibold tracking-[0.2em] text-white">
        {children}
      </h2>
      <span className="h-px flex-1 bg-white/20" />
    </div>
  );
}
