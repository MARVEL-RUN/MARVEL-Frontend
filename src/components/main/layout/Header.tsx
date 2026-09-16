"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { MAIN_ASSETS } from "@/lib/assets";
import { SPONSOR_MAILTO } from "@/lib/legal";
import { LOOKUP_HREF, NAV_ITEMS } from "@/lib/mode";
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
  if (pathname.startsWith(item.href)) return true;
  if (!("children" in item)) return false;
  return item.children.some((child) => childOn(pathname, "", child.href, item.href));
}

const PHONE_NAV = "(max-width: 960px)";
const NAV_PAD = 16;

function navPacked(
  bar: HTMLElement,
  brand: HTMLElement,
  nav: HTMLElement,
  actions: HTMLElement,
) {
  if (window.matchMedia(PHONE_NAV).matches) return false;
  const barW = bar.clientWidth;
  const navW = nav.offsetWidth;
  if (!barW || !navW) return false;
  const lockImg = actions.querySelector(".locked-cta__img");
  let extra = 0;
  if (lockImg instanceof HTMLElement) {
    const lock = lockImg.parentElement;
    extra = Math.max(0, (lockImg.offsetWidth - (lock?.offsetWidth ?? 0)) / 2);
  }
  const navLeft = (barW - navW) / 2;
  const navRight = navLeft + navW;
  const actionsLeft = barW - actions.offsetWidth - extra;
  return navLeft < brand.offsetWidth + NAV_PAD || navRight > actionsLeft - NAV_PAD;
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
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [closedDrop, setClosedDrop] = useState<string | null>(null);
  const [packed, setPacked] = useState(false);
  const [hash, setHash] = useState("");
  const home = pathname === "/";
  const barRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

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

  useLayoutEffect(() => {
    const bar = barRef.current;
    const brand = brandRef.current;
    const nav = navRef.current;
    const actions = actionsRef.current;
    if (!bar || !brand || !nav || !actions) return;

    function measure() {
      setPacked(navPacked(bar, brand, nav, actions));
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(bar);
    ro.observe(brand);
    ro.observe(nav);
    ro.observe(actions);
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    let gone = false;
    document.fonts?.ready.then(() => {
      if (!gone) measure();
    });
    return () => {
      gone = true;
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (packed) return;
    if (window.matchMedia(PHONE_NAV).matches) return;
    setOpen(false);
  }, [packed]);

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
        packed ? "is-packed" : "",
      ].join(" ")}
    >
      <div className="site-header__bar" ref={barRef}>
        <Link
          href="/"
          ref={brandRef}
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

        <nav
          className="site-header__nav"
          aria-label="주요 메뉴"
          aria-hidden={packed || undefined}
          inert={packed || undefined}
          ref={navRef}
        >
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
          <div className="site-header__actions" ref={actionsRef}>
            <RegisterCta className="btn btn--red site-header__cta" compact />
            <Link
              href={LOOKUP_HREF}
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
            href={LOOKUP_HREF}
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
