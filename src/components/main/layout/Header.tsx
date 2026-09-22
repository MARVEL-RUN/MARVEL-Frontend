"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { MAIN_ASSETS } from "@/lib/assets";
import { SPONSOR_MAILTO } from "@/lib/legal";
import { useAppHref } from "@/lib/main/useAppBasePath";
import { NAV_ITEMS } from "@/lib/mode";
import { RegisterCta } from "../register/RegisterCta";
import { pinToHeader } from "@/lib/pin-header";

function hrefPath(href: string) {
  return href.split("#")[0];
}

function childOn(pathname: string, hash: string, childHref: string, parentHref: string) {
  const id = childHref.split("#")[1];
  if (id) return pathname.startsWith(parentHref) && hash === "#" + id;
  const path = hrefPath(childHref);
  return pathname === path || pathname.startsWith(`${path}/`);
}

function itemOn(pathname: string, item: (typeof NAV_ITEMS)[number]) {
  if (item.href === "/") return pathname === "/";
  if (pathname.startsWith(item.href)) return true;
  if (!("children" in item)) return false;
  return item.children.some((child) => childOn(pathname, "", child.href, item.href));
}

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
        <svg viewBox="0 0 24 24" width="15" height="15">
          <path
            fill="currentColor"
            d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 4-8 5L4 8V6l8 5 8-5z"
          />
        </svg>
      </span>
      협찬문의
    </a>
  );
}

export function Header() {
  const pathname = usePathname();
  const lookupHref = useAppHref("/lookup");
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [closedDrop, setClosedDrop] = useState<string | null>(null);
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
    setOpenGroup(null);
  }, [pathname]);

  useEffect(() => {
    if (!open) setOpenGroup(null);
  }, [open]);

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

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1200px)");
    const onChange = () => {
      if (!mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function closeDrop(href: string) {
    setClosedDrop(href);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

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
            const active = itemOn(pathname, item);
            const kids = "children" in item ? item.children : undefined;
            const pick = "pickChild" in item && item.pickChild;
            const linkClass = active ? "site-header__link is-active" : "site-header__link";
            const link = pick ? (
              <button type="button" className={linkClass} aria-haspopup="true">
                {item.label}
              </button>
            ) : (
              <Link
                href={item.href}
                className={linkClass}
                onClick={() => closeDrop(item.href)}
              >
                {item.label}
              </Link>
            );
            if (!kids) return <span key={item.href}>{link}</span>;
            return (
              <div
                key={item.href}
                className={[
                  "site-header__item",
                  closedDrop === item.href ? "is-closed" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseLeave={() => {
                  if (closedDrop === item.href) setClosedDrop(null);
                }}
              >
                {link}
                <div className="site-header__drop">
                  {kids.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="site-header__drop-link"
                      onClick={(event) => {
                        closeDrop(item.href);
                        goSection(event, child.href, item.href, false);
                      }}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="site-header__tools">
          <div className="site-header__actions">
            <RegisterCta className="btn btn--red site-header__cta" compact />
            <Link
              href={lookupHref}
              className="btn btn--ghost site-header__cta site-header__lookup"
            >
              <span>신청조회</span>
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
      </div>

      <div
        id="mobile-nav"
        className={open ? "site-header__drawer is-open" : "site-header__drawer"}
        hidden={!open}
      >
        <nav className="site-header__drawer-nav" aria-label="모바일 메뉴">
          {NAV_ITEMS.map((item) => {
            const kids = "children" in item ? item.children : undefined;
            const pick = "pickChild" in item && item.pickChild;
            const expanded = openGroup === item.href;
            const parentClass = itemOn(pathname, item)
              ? "site-header__drawer-link is-active"
              : "site-header__drawer-link";
            const parent = pick ? (
              <button
                type="button"
                className={parentClass}
                aria-expanded={expanded}
                onClick={() =>
                  setOpenGroup((v) => (v === item.href ? null : item.href))
                }
              >
                {item.label}
              </button>
            ) : (
              <Link
                href={item.href}
                className={parentClass}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
            if (!kids) return <span key={item.href}>{parent}</span>;
            return (
              <div key={item.href} className="site-header__drawer-group">
                <div className="site-header__drawer-row">
                  {parent}
                  <button
                    type="button"
                    className="site-header__drawer-caret"
                    aria-expanded={expanded}
                    aria-label={`${item.label} 하위 메뉴`}
                    onClick={() =>
                      setOpenGroup((v) => (v === item.href ? null : item.href))
                    }
                  />
                </div>
                {expanded
                  ? kids.map((child) => {
                    const on = childOn(pathname, hash, child.href, item.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={
                          on
                            ? "site-header__drawer-sub is-active"
                            : "site-header__drawer-sub"
                        }
                        onClick={(event) =>
                          goSection(event, child.href, item.href, true)
                        }
                      >
                        {child.label}
                      </Link>
                    );
                  })
                  : null}
              </div>
            );
          })}
        </nav>
        <div className="site-header__drawer-actions">
          <RegisterCta className="btn btn--red" plain />
          <Link
            href={lookupHref}
            className="btn btn--ghost site-header__lookup"
          >
            <span>신청조회</span>
          </Link>
          <SponsorInquiry className="site-header__spon" />
        </div>
      </div>
    </header>
  );
}
