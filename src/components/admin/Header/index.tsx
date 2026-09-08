"use client";

import { ADMIN_NAV } from "@/lib/admin/nav";
import { MAIN_ASSETS } from "@/lib/assets";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UtilityIcons } from "./UtilityIcons";

export function AdminHeader() {
  const pathname = usePathname();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileKey, setMobileKey] = useState<string | null>(null);

  useEffect(() => {
    setOpenKey(null);
    setMobileOpen(false);
    setMobileKey(null);
  }, [pathname]);

  return (
    <header className="admin-header">
      <div className="admin-header__bar">
        <Link href="/admin" className="admin-header__brand">
          <Image
            src={MAIN_ASSETS.logo}
            alt="MARVEL RUN"
            width={1257}
            height={98}
            className="admin-header__logo"
            priority
          />
          <span className="admin-header__label">ADMIN</span>
        </Link>

        <nav className="admin-header__nav" aria-label="관리자 메뉴">
          {ADMIN_NAV.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`admin-header__item${openKey === item.key ? " is-open" : ""}`}
              onClick={() => setOpenKey((prev) => (prev === item.key ? null : item.key))}
            >
              {item.name}
            </button>
          ))}
        </nav>

        <div className="admin-header__right">
          <div className="admin-header__utils">
            <UtilityIcons />
            <Link href="/" className="admin-header__home">
              사이트 바로가기
            </Link>
          </div>
          <button
            type="button"
            className="admin-header__burger"
            aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
      </div>

      {openKey ? (
        <div className="admin-header__mega">
          <div className="admin-header__dim" onClick={() => setOpenKey(null)} />
          <div className="admin-header__mega-panel">
            <div className="admin-header__mega-inner">
              <div />
              <div className="admin-header__mega-cols">
                {ADMIN_NAV.map((item) => (
                  <div key={item.key}>
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href} onClick={() => setOpenKey(null)}>
                        {child.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
              <div />
            </div>
          </div>
        </div>
      ) : null}

      {mobileOpen ? (
        <div className="admin-header__mobile">
          <div className="admin-header__dim" onClick={() => setMobileOpen(false)} />
          <nav className="admin-header__mobile-panel">
            {ADMIN_NAV.map((item) => (
              <div key={item.key}>
                <button
                  type="button"
                  onClick={() => setMobileKey((prev) => (prev === item.key ? null : item.key))}
                >
                  {item.name}
                </button>
                {mobileKey === item.key ? (
                  <div className="admin-header__mobile-sub">
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href}>
                        {child.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            <Link href="/">사이트 바로가기</Link>
            <Link href="/admin/login">로그인</Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
