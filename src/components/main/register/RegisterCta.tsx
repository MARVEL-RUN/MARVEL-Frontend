"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useState } from "react";
import { MAIN_ASSETS } from "@/lib/assets";
import { REGISTER_HREF } from "@/lib/mode";
import { RegisterClosedModal } from "./RegisterClosedModal";
import { useRegistrationOpen } from "./useRegistrationOpen";

type Props = {
  className?: string;
  compact?: boolean;
  plain?: boolean;
};

export function RegisterCta({ className, compact, plain }: Props) {
  const [open, setOpen] = useState(false);
  const registrationOpen = useRegistrationOpen();

  if (registrationOpen) {
    return (
      <Link href={REGISTER_HREF} className={className}>
        참가신청
      </Link>
    );
  }

  return (
    <>
      {plain ? (
        <button
          type="button"
          className={`${className} btn--locked`}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Lock size={16} strokeWidth={2.4} aria-hidden />
          참가신청
        </button>
      ) : (
        <button
          type="button"
          className={compact ? "locked-cta locked-cta--compact" : "locked-cta"}
          aria-label="참가신청"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Image
            src={MAIN_ASSETS.registerLocked}
            alt=""
            width={309}
            height={155}
            className="locked-cta__img"
          />
        </button>
      )}
      <RegisterClosedModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
