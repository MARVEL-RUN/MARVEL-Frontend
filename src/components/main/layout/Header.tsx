"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MAIN_ASSETS } from "@/lib/assets";
import { SPONSOR_MAILTO } from "@/lib/legal";
import { LOOKUP_HREF, NAV_ITEMS, REGISTER_HREF, registerUiOpen } from "@/lib/mode";

function SponsorInquiry({ className }: { className?: string }) {
  return (
    <a
      href={SPONSOR_MAILTO}
      className={className}
      target="_blank"
      rel="noreferrer"
      title="협찬문의"
    >
      <span className="site-header__spon-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="13" height="13">
          <path
            fill="currentColor"
            d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.58.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.58 1 1 0 0 1-.25 1.02z"
          />
        </svg>
      </span>
      협찬문의
    </a>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const home = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const cta = registerUiOpen ? "참가신청" : "접수 안내";

  return (
    <header
      className={[
        "site-header",
        home ? "site-header--home" : "",
        scrolled || open ? "is-solid" : "",
      ].join(" ")}
    >
      <div className="site-header__bar">
        <Link
          href="/"
          className="site-header__brand"
          aria-label="MARVEL RUN 홈"
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
        </Link>

        <nav className="site-header__nav" aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname.startsWith(item.href)
                  ? "site-header__link is-active"
                  : "site-header__link"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__actions">
          <Link href={REGISTER_HREF} className="btn btn--red site-header__cta">
            {cta}
          </Link>
          <Link href={LOOKUP_HREF} className="btn btn--ghost site-header__cta">
            신청조회
          </Link>
          <SponsorInquiry className="site-header__spon" />
        </div>

        <button
          type="button"
          className={open ? "site-header__burger is-open" : "site-header__burger"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        id="mobile-nav"
        className={open ? "site-header__drawer is-open" : "site-header__drawer"}
        hidden={!open}
      >
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="site-header__drawer-link">
            {item.label}
          </Link>
        ))}
        <Link href={REGISTER_HREF} className="btn btn--red">
          {cta}
        </Link>
        <Link href={LOOKUP_HREF} className="btn btn--ghost">
          신청조회
        </Link>
        <SponsorInquiry className="site-header__spon" />
      </div>
    </header>
  );
}
