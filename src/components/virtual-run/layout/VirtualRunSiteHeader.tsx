"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MAIN_ASSETS } from "@/lib/assets";
import { isVirtualRunHomePath, vrPath } from "@/lib/virtual-run/href";
import { VIRTUAL_RUN_NAV } from "@/lib/virtual-run/nav";
import { MOBILE_MQ } from "@/lib/viewport";
import { VrLink } from "./VrLink";

function navActive(pathname: string, href: string, prefixed: boolean): boolean {
  const target = vrPath(href, prefixed);
  if (target === vrPath("/", prefixed)) {
    return pathname === target || pathname === `${target}/`;
  }
  return pathname === target || pathname.startsWith(`${target}/`);
}

export function VirtualRunSiteHeader() {
  const pathname = usePathname();
  const prefixed = pathname.startsWith("/virtual-run");
  const home = isVirtualRunHomePath(pathname);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileHomeSolid, setMobileHomeSolid] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const syncMobileHome = () => setMobileHomeSolid(home && mq.matches);
    syncMobileHome();
    mq.addEventListener("change", syncMobileHome);
    return () => mq.removeEventListener("change", syncMobileHome);
  }, [home]);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const onScroll = () => {
      if (home && mq.matches) return;
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [home]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={[
        "site-header",
        home ? "site-header--home" : "",
        scrolled || open || mobileHomeSolid ? "is-solid" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="site-header__bar">
        <VrLink
          href="/"
          className="site-header__brand"
          aria-label="MARVEL RUN 버추얼런 홈"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        >
          <Image
            src={MAIN_ASSETS.headerLogo}
            alt=""
            width={206}
            height={94}
            className="site-header__logo"
            priority
            draggable={false}
          />
        </VrLink>

        <nav className="site-header__nav" aria-label="버추얼런 메뉴">
          {VIRTUAL_RUN_NAV.map((item) => (
            <VrLink
              key={item.href}
              href={item.href}
              className={
                navActive(pathname, item.href, prefixed)
                  ? "site-header__link is-active"
                  : "site-header__link"
              }
            >
              {item.label}
            </VrLink>
          ))}
        </nav>

        <div className="site-header__tools">
          <div className="site-header__actions">
            <VrLink href="/login" className="btn btn--ghost site-header__cta">
              <span>로그인</span>
            </VrLink>
            <VrLink href="/tickets" className="btn btn--red site-header__cta">
              <span>티켓 구매</span>
            </VrLink>
          </div>

          <button
            type="button"
            className={open ? "site-header__burger is-open" : "site-header__burger"}
            aria-expanded={open}
            aria-controls="vr-mobile-nav"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div
        id="vr-mobile-nav"
        className={open ? "site-header__drawer is-open" : "site-header__drawer"}
        hidden={!open}
      >
        <nav className="site-header__drawer-nav" aria-label="버추얼런 모바일 메뉴">
          {VIRTUAL_RUN_NAV.map((item) => (
            <VrLink
              key={item.href}
              href={item.href}
              className={
                navActive(pathname, item.href, prefixed)
                  ? "site-header__drawer-link is-active"
                  : "site-header__drawer-link"
              }
              onClick={() => setOpen(false)}
            >
              {item.label}
            </VrLink>
          ))}
        </nav>
        <div className="site-header__drawer-actions">
          <VrLink href="/login" className="btn btn--ghost" onClick={() => setOpen(false)}>
            로그인
          </VrLink>
          <VrLink href="/tickets" className="btn btn--red" onClick={() => setOpen(false)}>
            티켓 구매
          </VrLink>
        </div>
      </div>
    </header>
  );
}
