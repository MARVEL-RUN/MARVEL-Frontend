import { EVENT, PARTNERS } from "@/lib/constants/event";

export function SiteFooter() {
  return (
    <footer className="mt-14 flex flex-col items-center gap-10">
      <ul className="grid w-full grid-cols-3 items-start gap-2">
        {PARTNERS.map((partner) => (
          <li key={partner.slug} className="flex flex-col items-center gap-2 text-center">
            <p className="text-[10px] tracking-[0.18em] text-white/40">{partner.role}</p>
            <PartnerMark name={partner.name} slug={partner.slug} />
          </li>
        ))}
      </ul>
      <p className="text-[11px] tracking-[0.18em] text-white/40">{EVENT.copyright}</p>
    </footer>
  );
}

function PartnerMark({ name, slug }: { name: string; slug: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-white">
      {slug === "one-universe" ? <OneUniverseIcon /> : null}
      {slug === "flux-sonic" ? <FluxSonicIcon /> : null}
      {slug === "livewith" ? <LivewithIcon /> : null}
      <span className="text-[11px] font-bold tracking-[0.12em] sm:text-[12px]">{name}</span>
    </div>
  );
}

function OneUniverseIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden>
      <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="20" cy="20" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M20 3v34M3 20h34" stroke="currentColor" strokeWidth="1.1" />
      <path d="M8 8l24 24M32 8 8 32" stroke="currentColor" strokeWidth="0.9" />
    </svg>
  );
}

function FluxSonicIcon() {
  return (
    <svg viewBox="0 0 40 28" className="h-7 w-9" aria-hidden>
      <path d="M2 24c7-12 11-18 18-18s11 6 18 18" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9 24c4.5-8 8-12 11-12s6.5 4 11 12" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="20" cy="24" r="2.2" fill="currentColor" />
    </svg>
  );
}

function LivewithIcon() {
  return (
    <svg viewBox="0 0 28 28" className="h-7 w-7" aria-hidden>
      <rect x="2" y="2" width="11" height="11" rx="1.4" fill="currentColor" />
      <rect x="15" y="2" width="11" height="11" rx="1.4" fill="currentColor" opacity="0.55" />
      <rect x="2" y="15" width="11" height="11" rx="1.4" fill="currentColor" opacity="0.55" />
      <rect x="15" y="15" width="11" height="11" rx="1.4" fill="currentColor" />
    </svg>
  );
}
