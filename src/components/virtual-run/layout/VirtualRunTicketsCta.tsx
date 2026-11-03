import Image from "next/image";
import { VIRTUAL_RUN_ASSETS } from "@/lib/virtual-run/assets";
import { VrLink } from "./VrLink";

type Props = {
  compact?: boolean;
  className?: string;
  onNavigate?: () => void;
};

export function VirtualRunTicketsCta({ compact, className, onNavigate }: Props) {
  const rootClass = [
    compact ? "locked-cta locked-cta--compact" : "locked-cta",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <VrLink
      href="/tickets"
      className={rootClass}
      aria-label="참가신청"
      onClick={onNavigate}
    >
      <Image
        src={VIRTUAL_RUN_ASSETS.registerCta}
        alt=""
        width={757}
        height={380}
        className="locked-cta__img"
      />
    </VrLink>
  );
}
