"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { KeyboardInset } from "./KeyboardInset";
import { CinematicFX } from "../fx/CinematicFX";
import { LegalModalProvider } from "../legal/LegalModal";

export function MainShell({ children }: { children: React.ReactNode }) {
  const virtual = usePathname().startsWith("/virtual");

  if (virtual) {
    return (
      <LegalModalProvider>
        <div className="site">
          <KeyboardInset />
          {children}
          <Footer />
        </div>
      </LegalModalProvider>
    );
  }

  return (
    <LegalModalProvider>
      <div className="site">
        <CinematicFX />
        <KeyboardInset />
        <Header />
        {children}
        <Footer />
      </div>
    </LegalModalProvider>
  );
}
