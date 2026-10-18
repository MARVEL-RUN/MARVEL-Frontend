import Image from "next/image";
import type { DiscountLinkEntry } from "@/lib/discount-link/config";

export function DiscountPartnerMark({
  entry,
  className,
}: {
  entry: DiscountLinkEntry;
  className?: string;
}) {
  const label = entry.partnerTag ?? "DISCOUNT";
  if (!entry.partnerLogo) {
    return <span className={className}>{label}</span>;
  }
  return (
    <span
      className={[
        className,
        "dl-partner",
        entry.partnerLogoInvert ? "is-invert" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Image src={entry.partnerLogo} alt={label} width={160} height={46} />
    </span>
  );
}
