"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CinematicFX } from "../fx/CinematicFX";

export function MainShell({ children }: { children: React.ReactNode }) {
  const virtual = usePathname().startsWith("/virtual");

  if (virtual) {
    return (
      <div className="site">
        {children}
        <Footer />
      </div>
    );
  }

  return (
    <div className="site">
      <CinematicFX />
      <Header />
      {children}
      <Footer />
    </div>
  );
}
