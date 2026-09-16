"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { MAIN_ASSETS } from "@/lib/assets";
import { REGISTER_HREF, registrationOpen } from "@/lib/mode";

type Props = {
  className?: string;
  compact?: boolean;
  plain?: boolean;
};

export function RegisterCta({ className, compact, plain }: Props) {
  if (registrationOpen) {
    return (
      <Link href={REGISTER_HREF} className={className}>
        참가신청
      </Link>
    );
  }

  if (plain) {
    return (
      <button type="button" className={`${className} btn--locked`} disabled>
        <Lock size={16} strokeWidth={2.4} aria-hidden />
        참가신청
      </button>
    );
  }

  return (
    <Link
      href={REGISTER_HREF}
      className={compact ? "locked-cta locked-cta--compact" : "locked-cta"}
      aria-label="참가신청"
    >
      <Image
        src={MAIN_ASSETS.registerLocked}
        alt=""
        width={309}
        height={155}
        className="locked-cta__img"
      />
    </Link>
  );
}
