"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useRef, useState } from "react";
import { MAIN_ASSETS } from "@/lib/assets";
import { resetFlowIfCurrent } from "@/lib/main/flowReset";
import { useAppHref } from "@/lib/main/useAppBasePath";
import { registrationRound2HintUi } from "@/lib/register-schedule";
import { RegisterClosedModal } from "./RegisterClosedModal";
import { RegisterRound2HintModal } from "./RegisterRound2HintModal";
import { RegisterRound2WaitModal } from "./RegisterRound2WaitModal";
import { useRegistrationOpen } from "./useRegistrationOpen";
import { useRegistrationRound2Pause } from "./useRegistrationRound2Pause";

type Props = {
  className?: string;
  compact?: boolean;
  plain?: boolean;
  onNavigate?: () => void;
};

export function RegisterCta({ className, compact, plain, onNavigate }: Props) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [closedOpen, setClosedOpen] = useState(false);
  const [round2Open, setRound2Open] = useState(false);
  const registrationOpen = useRegistrationOpen();
  const round2Pause = useRegistrationRound2Pause();
  const registerHref = useAppHref("/register");

  if (registrationOpen && !round2Pause) {
    return (
      <Link
        href={registerHref}
        className={className}
        onClick={() => {
          resetFlowIfCurrent(registerHref, "register");
          onNavigate?.();
        }}
      >
        참가신청
      </Link>
    );
  }

  if (registrationOpen && round2Pause) {
    const round2Ui = registrationRound2HintUi();
    return (
      <>
        <span ref={anchorRef} className="register-cta-anchor">
          {plain ? (
            <button
              type="button"
              className={`${className} btn--locked`}
              aria-haspopup="dialog"
              aria-expanded={round2Open}
              onClick={() => setRound2Open(true)}
            >
              참가신청
            </button>
          ) : (
            <button
              type="button"
              className={compact ? "locked-cta locked-cta--compact" : "locked-cta"}
              aria-label="참가신청"
              aria-haspopup="dialog"
              aria-expanded={round2Open}
              onClick={() => setRound2Open(true)}
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
        </span>
        {round2Ui === "standby" ? (
          <RegisterRound2WaitModal
            open={round2Open}
            onClose={() => setRound2Open(false)}
          />
        ) : (
          <RegisterRound2HintModal
            open={round2Open}
            anchorRef={anchorRef}
            onClose={() => setRound2Open(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      {plain ? (
        <button
          type="button"
          className={`${className} btn--locked`}
          aria-haspopup="dialog"
          aria-expanded={closedOpen}
          onClick={() => setClosedOpen(true)}
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
          aria-expanded={closedOpen}
          onClick={() => setClosedOpen(true)}
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
      <RegisterClosedModal open={closedOpen} onClose={() => setClosedOpen(false)} />
    </>
  );
}
