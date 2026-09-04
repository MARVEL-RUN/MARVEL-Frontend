import { EVENT } from "@/lib/constants/event";
import { MarvelLogo } from "@/components/ui/MarvelLogo";

export function BrandLockup() {
  return (
    <div className="mt-7 flex flex-col items-center text-center">
      <MarvelLogo className="text-[28px] sm:text-[32px]" />
      <p className="font-display mt-1 text-[86px] leading-[0.78] font-extrabold tracking-[-0.06em] italic sm:text-[100px]">
        RUN
      </p>
      <p className="mt-2 text-[13px] font-semibold tracking-[0.32em] sm:text-[14px]">
        {EVENT.year} {EVENT.region}
      </p>
    </div>
  );
}
