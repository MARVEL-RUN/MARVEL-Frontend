"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { KeyboardInset } from "./KeyboardInset";
import { CinematicFX } from "../fx/CinematicFX";
import { OpeningIntro } from "../fx/OpeningIntro";
import { LegalModalProvider } from "../legal/LegalModal";
import { MainToastHost } from "../feedback/MainFeedback";

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const virtual = pathname.startsWith("/virtual");
  const isHome = pathname === "/";

  if (virtual) {
    return (
      <LegalModalProvider>
        <div className="site">
          <KeyboardInset />
          {children}
          <Footer />
          <MainToastHost />
        </div>
      </LegalModalProvider>
    );
  }

  return (
    <LegalModalProvider>
      <div className="site">
        {isHome ? <OpeningIntro /> : null}
        <CinematicFX />
        <KeyboardInset />
        <Header />
        {children}
        <Footer />
        <MainToastHost />
      </div>
    </LegalModalProvider>
  );
}
