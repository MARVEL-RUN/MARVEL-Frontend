import { EVENT } from "@/lib/constants/event";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BrandLockup } from "@/components/coming-soon/BrandLockup";
import { HeroBanner } from "@/components/coming-soon/HeroBanner";

export function ComingSoonPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[var(--bg)] text-white">
      <div className="dot-grid pointer-events-none absolute inset-0" />
      <div className="page-chevrons page-chevrons--left" />
      <div className="page-chevrons page-chevrons--right" />
      <p aria-hidden className="run-watermark">
        RUN
      </p>

      <div className="relative mx-auto w-full max-w-[520px] px-5 pt-6 pb-12 sm:max-w-[560px]">
        <HeroBanner />
        <BrandLockup />

        <section className="mt-8 flex items-end justify-center gap-3 sm:gap-4">
          <p className="mb-1 max-w-[9.5rem] text-right text-[11px] leading-[1.45] text-white/70 sm:text-[12px]">
            {EVENT.registrationTeaser}
          </p>
          <p className="font-display text-[40px] leading-none font-extrabold tracking-[-0.03em] text-[#cfd8e3] italic sm:text-[46px]">
            COMING SOON
          </p>
        </section>

        <section className="mt-10">
          <SectionHeading>대회 안내</SectionHeading>
          <dl className="mx-auto flex max-w-[380px] flex-col gap-6">
            <InfoRow label={EVENT.dateLabel} value={EVENT.date} />
            <InfoRow
              label={EVENT.venueLabel}
              value={EVENT.venue}
              sub={EVENT.venueAddress}
            />
            <InfoRow label={EVENT.registrationLabel} value={EVENT.registration} />
          </dl>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}

function InfoRow({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="grid grid-cols-[4.75rem_1fr] items-baseline gap-x-5 sm:grid-cols-[5.25rem_1fr]">
      <dt className="text-[12px] text-white/50">{label}</dt>
      <dd>
        <p className="text-[15px] font-semibold tracking-[-0.01em]">{value}</p>
        {sub ? <p className="mt-1 text-[11px] leading-relaxed text-white/40">{sub}</p> : null}
      </dd>
    </div>
  );
}
