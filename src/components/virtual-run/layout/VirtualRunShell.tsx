"use client";

import { useEffect } from "react";
import { CinematicFX } from "../../main/fx/CinematicFX";
import { MainToastHost } from "../../main/feedback/MainFeedback";
import { KeyboardInset } from "../../main/layout/KeyboardInset";
import { LegalModalProvider } from "../../main/legal/LegalModal";
import { VirtualRunFooter } from "./VirtualRunFooter";
import { VirtualRunSiteHeader } from "./VirtualRunSiteHeader";
import "../virtual-run.css";
import "../home/home.css";

export function VirtualRunShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("is-main", "is-live");
  }, []);

  return (
    <LegalModalProvider>
      <div className="virtual-run site">
        <CinematicFX />
        <KeyboardInset />
        <VirtualRunSiteHeader />
        {children}
        <VirtualRunFooter />
        <MainToastHost />
      </div>
    </LegalModalProvider>
  );
}
