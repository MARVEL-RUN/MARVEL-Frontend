"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const DUST = Array.from({ length: 20 }, (_, i) => ({
  left: `${(i * 19 + 7) % 97}%`,
  delay: `${(i * 0.41) % 9}s`,
  duration: `${11 + (i % 8)}s`,
  size: `${2 + (i % 4)}px`,
}));

export function CinematicFX() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") {
      document.documentElement.classList.add("is-live");
      document.documentElement.classList.remove("is-intro");
    }
  }, [pathname]);

  return (
    <div className="fx" aria-hidden>
      <div className="fx-letterbox">
        <span />
        <span />
      </div>
      <span className="fx-vignette" />
      <span className="fx-grain" />
      <span className="fx-scan" />
      <div className="fx-dust">
        {DUST.map((d) => (
          <span
            key={d.left + d.delay}
            className="fx-dust__bit"
            style={{
              left: d.left,
              width: d.size,
              height: d.size,
              animationDelay: d.delay,
              animationDuration: d.duration,
            }}
          />
        ))}
      </div>
    </div>
  );
}
