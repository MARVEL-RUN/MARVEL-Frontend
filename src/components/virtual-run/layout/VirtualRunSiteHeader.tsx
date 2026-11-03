"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { MAIN_ASSETS } from "@/lib/assets";
import { pinToHeader } from "@/lib/pin-header";
import { isVirtualRunHomePath, vrPath } from "@/lib/virtual-run/href";
import { vrNavChildActive, vrNavItemActive } from "@/lib/virtual-run/nav-active";
import { visibleVirtualRunNav } from "@/lib/virtual-run/nav-visible";
import { isVirtualRunNavGroup } from "@/lib/virtual-run/nav";
import { virtualRunOpenFlags } from "@/lib/virtual-run/open-schedule";
import { useVirtualRunParticipant } from "../participant/VirtualRunParticipantProvider";
import { MOBILE_MQ } from "@/lib/viewport";
import { VirtualRunTicketsCta } from "./VirtualRunTicketsCta";
import { VrLink } from "./VrLink";

export function VirtualRunSiteHeader() {
  const pathname = usePathname();
  const prefixed = pathname.startsWith("/virtual-run");
  const home = isVirtualRunHomePath(pathname);
  const navItems = visibleVirtualRunNav(virtualRunOpenFlags());
  const { isLoggedIn } = useVirtualRunParticipant();
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileHomeSolid, setMobileHomeSolid] = useState(false);
  const [closedDrop, setClosedDrop] = useState<string | null>(null);
  const [hash, setHash] = useState("");

  useEffect(() => {
    setOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  useEffect(() => {
    if (!open) setOpenGroup(null);
  }, [open]);

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

  useEffect(() => {
    const jump = () => {
      const next = window.location.hash;
      setHash(next);
      const id = decodeURIComponent(next.replace(/^#/, ""));
      if (!id) return;
      const target = document.getElementById(id);
      if (target) pinToHeader(target);
    };
    setHash(window.location.hash);
    const timer = window.setTimeout(jump, 80);
    // 첫 로드는 이미지·폰트로 위쪽 높이가 늦게 잡혀서 load 뒤 한 번 더
    const late = document.readyState !== "complete";
    if (late) window.addEventListener("load", jump, { once: true });
    window.addEventListener("hashchange", jump);
    return () => {
      window.clearTimeout(timer);
      if (late) window.removeEventListener("load", jump);
      window.removeEventListener("hashchange", jump);
    };
  }, [pathname]);

  function closeDrop(href: string) {
    setClosedDrop(href);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  function goSection(
    event: MouseEvent<HTMLAnchorElement>,
    childHref: string,
    parentHref: string,
    closeDrawer: boolean,
  ) {
    const id = childHref.split("#")[1];
    if (closeDrawer) setOpen(false);
    if (!id) return;
    const parentPath = vrPath(parentHref.split("#")[0], prefixed);
    if (pathname !== parentPath && pathname !== `${parentPath}/`) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    history.replaceState(null, "", vrPath(childHref, prefixed));
    setHash(`#${id}`);
    if (closeDrawer) window.setTimeout(() => pinToHeader(target), 60);
    else pinToHeader(target);
  }

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
          data-vr-pick="LOGO"
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

        <nav className="site-header__nav" aria-label="버추얼런 메뉴" data-vr-pick="NAV">
          {navItems.map((item) => {
            const active = vrNavItemActive(pathname, prefixed, item, hash);
            const kids = isVirtualRunNavGroup(item) ? item.children : undefined;
            const pick = isVirtualRunNavGroup(item);
            const linkClass = active ? "site-header__link is-active" : "site-header__link";

            if (!kids) {
              return (
                <span key={item.href}>
                  <VrLink href={item.href} className={linkClass} onClick={() => closeDrop(item.href)}>
                    {item.label}
                  </VrLink>
                </span>
              );
            }

            const link = pick ? (
              <button
                type="button"
                className={linkClass}
                aria-haspopup="true"
                /* 클릭 포커스가 남으면 focus-within으로 드롭·딤이 고정됨 */
                onMouseDown={(e) => e.preventDefault()}
              >
                {item.label}
              </button>
            ) : (
              <VrLink href={item.href} className={linkClass} onClick={() => closeDrop(item.href)}>
                {item.label}
              </VrLink>
            );

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
                    <VrLink
                      key={child.href}
                      href={child.href}
                      className="site-header__drop-link"
                      onClick={(event) => {
                        closeDrop(item.href);
                        goSection(event, child.href, item.href, false);
                      }}
                    >
                      {child.label}
                    </VrLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="site-header__tools">
          <div className="site-header__actions" data-vr-pick="BUTTON">
            {isLoggedIn ? (
              <VrLink href="/mypage" className="btn btn--ghost site-header__cta">
                <span>마이페이지</span>
              </VrLink>
            ) : (
              <VrLink href="/login" className="btn btn--ghost site-header__cta">
                <span>로그인</span>
              </VrLink>
            )}
            <VirtualRunTicketsCta compact className="site-header__cta" />
          </div>

          <button
            type="button"
            className={open ? "site-header__burger is-open" : "site-header__burger"}
            aria-expanded={open}
            aria-controls="vr-mobile-nav"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            data-vr-pick="MENU"
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
          {navItems.map((item) => {
            const kids = isVirtualRunNavGroup(item) ? item.children : undefined;
            const pick = isVirtualRunNavGroup(item);
            const expanded = openGroup === item.href;
            const parentClass = vrNavItemActive(pathname, prefixed, item, hash)
              ? "site-header__drawer-link is-active"
              : "site-header__drawer-link";

            if (!kids) {
              return (
                <span key={item.href}>
                  <VrLink href={item.href} className={parentClass} onClick={() => setOpen(false)}>
                    {item.label}
                  </VrLink>
                </span>
              );
            }

            const parent = pick ? (
              <button
                type="button"
                className={parentClass}
                aria-expanded={expanded}
                onClick={() => setOpenGroup((v) => (v === item.href ? null : item.href))}
              >
                {item.label}
              </button>
            ) : (
              <VrLink href={item.href} className={parentClass} onClick={() => setOpen(false)}>
                {item.label}
              </VrLink>
            );

            return (
              <div key={item.href} className="site-header__drawer-group">
                <div className="site-header__drawer-row">
                  {parent}
                  <button
                    type="button"
                    className="site-header__drawer-caret"
                    aria-expanded={expanded}
                    aria-label={`${item.label} 하위 메뉴`}
                    onClick={() => setOpenGroup((v) => (v === item.href ? null : item.href))}
                  />
                </div>
                {expanded
                  ? kids.map((child) => {
                      const on = vrNavChildActive(pathname, prefixed, child.href, item.href, hash);
                      return (
                        <VrLink
                          key={child.href}
                          href={child.href}
                          className={
                            on ? "site-header__drawer-sub is-active" : "site-header__drawer-sub"
                          }
                          onClick={(event) => goSection(event, child.href, item.href, true)}
                        >
                          {child.label}
                        </VrLink>
                      );
                    })
                  : null}
              </div>
            );
          })}
        </nav>
        <div className="site-header__drawer-actions">
          {isLoggedIn ? (
            <VrLink href="/mypage" className="btn btn--ghost" onClick={() => setOpen(false)}>
              마이페이지
            </VrLink>
          ) : (
            <VrLink href="/login" className="btn btn--ghost" onClick={() => setOpen(false)}>
              로그인
            </VrLink>
          )}
          <VrLink href="/tickets" className="btn btn--red" onClick={() => setOpen(false)}>
            티켓 구매
          </VrLink>
        </div>
      </div>
    </header>
  );
}
