"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { VR_HOME_CURSOR_FX } from "@/lib/virtual-run/home-fx";
import { isVirtualRunHomePath } from "@/lib/virtual-run/href";
import { CinematicFX } from "../../main/fx/CinematicFX";
import { MainToastHost } from "../../main/feedback/MainFeedback";
import { KeyboardInset } from "../../main/layout/KeyboardInset";
import { LegalModalProvider } from "../../main/legal/LegalModal";
import { VirtualRunParticipantProvider } from "../participant/VirtualRunParticipantProvider";
import { VirtualRunKitMedalLoader } from "../kit/VirtualRunKitMedalLoader";
import { VirtualRunFooter } from "./VirtualRunFooter";
import { VirtualRunSiteHeader } from "./VirtualRunSiteHeader";
import "../virtual-run.css";
import "../home/home.css";
import "../event/event.css";
import "../tickets/tickets.css";
import "../guide/guide.css";

/** 홈 메달 로딩. 다시 켤 때 true */
const VR_HOME_MEDAL_LOAD = false;

export function VirtualRunShell({ children }: { children: React.ReactNode }) {
  const home = isVirtualRunHomePath(usePathname());

  useEffect(() => {
    document.documentElement.classList.add("is-main", "is-live");
  }, []);

  return (
    <LegalModalProvider>
      <VirtualRunParticipantProvider>
        <div
          className={
            home && VR_HOME_CURSOR_FX ? "virtual-run site is-vr-build" : "virtual-run site"
          }
        >
          {home && VR_HOME_MEDAL_LOAD ? <VirtualRunKitMedalLoader /> : null}
          <CinematicFX />
          <KeyboardInset />
          <VirtualRunSiteHeader />
          {children}
          <VirtualRunFooter />
          <MainToastHost />
        </div>
      </VirtualRunParticipantProvider>
    </LegalModalProvider>
  );
}
