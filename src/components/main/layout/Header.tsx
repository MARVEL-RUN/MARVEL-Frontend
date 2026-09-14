"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { MAIN_ASSETS } from "@/lib/assets";
import { SPONSOR_MAILTO } from "@/lib/legal";
import { LOOKUP_HREF, NAV_ITEMS, REGISTER_HREF, registerUiOpen } from "@/lib/mode";
import { pinToHeader } from "@/lib/pin-header";

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
  const [hash, setHash] = useState("");
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
    const jump = () => {
      const next = window.location.hash;
      setHash(next);
      const id = decodeURIComponent(next.replace(/^#/, ""));
      if (!id) return;
      const target = document.getElementById(id);
      if (target) pinToHeader(target);
    };
    const timer = window.setTimeout(jump, 80);
    window.addEventListener("hashchange", jump);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", jump);
    };
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const cta = registerUiOpen ? "참가신청" : "접수 안내";

  function goSection(
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
    parentHref: string,
    close: boolean,
  ) {
    const id = href.split("#")[1];
    if (close) setOpen(false);
    if (!id || pathname !== parentHref) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    history.replaceState(null, "", href);
    setHash("#" + id);
    if (close) window.setTimeout(() => pinToHeader(target), 60);
    else pinToHeader(target);
  }

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
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            const kids = "children" in item ? item.children : undefined;
            const link = (
              <Link
                href={item.href}
                className={active ? "site-header__link is-active" : "site-header__link"}
              >
                {item.label}
              </Link>
            );
            if (!kids) return <span key={item.href}>{link}</span>;
            return (
              <div key={item.href} className="site-header__item">
                {link}
                <div className="site-header__drop">
                  {kids.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="site-header__drop-link"
                      onClick={(event) => goSection(event, child.href, item.href, false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
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
        <nav className="site-header__drawer-nav" aria-label="모바일 메뉴">
          {NAV_ITEMS.map((item) => {
            const kids = "children" in item ? item.children : undefined;
            const parent = (
              <Link
                href={item.href}
                className={
                  pathname.startsWith(item.href)
                    ? "site-header__drawer-link is-active"
                    : "site-header__drawer-link"
                }
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
            if (!kids) return <span key={item.href}>{parent}</span>;
            return (
              <div key={item.href} className="site-header__drawer-group">
                {parent}
                {kids.map((child) => {
                  const id = child.href.split("#")[1];
                  const on = pathname.startsWith(item.href) && hash === "#" + id;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={
                        on ? "site-header__drawer-sub is-active" : "site-header__drawer-sub"
                      }
                      onClick={(event) => goSection(event, child.href, item.href, true)}
                    >
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div className="site-header__drawer-actions">
          <Link href={REGISTER_HREF} className="btn btn--red">
            {cta}
          </Link>
          <Link href={LOOKUP_HREF} className="btn btn--ghost">
            신청조회
          </Link>
          <SponsorInquiry className="site-header__spon" />
        </div>
      </div>
    </header>
  );
}
