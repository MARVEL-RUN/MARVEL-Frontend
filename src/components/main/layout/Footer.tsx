import Image from "next/image";
import Link from "next/link";
import { EVENT } from "@/lib/event";
import { MAIN_ASSETS } from "@/lib/assets";
import { LEGAL_LINKS, OFFICE } from "@/lib/legal";

const SPONSOR_LOGOS = {
  주최: {
    src: MAIN_ASSETS.footerHost,
    width: 4786,
    height: 1320,
  },
  주관: {
    src: MAIN_ASSETS.footerOrganizer,
    width: 1601,
    height: 220,
  },
} as const;

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div>
          <p className="site-footer__office-name">{OFFICE.name}</p>
          <address className="site-footer__office">
            <p>{OFFICE.address}</p>
            <p>
              대표자 : {OFFICE.ceo}
              <span aria-hidden> | </span>
              Tel : {OFFICE.tel}
              <span aria-hidden> | </span>
              Email: {OFFICE.email}
            </p>
            <p>
              사업자번호: {OFFICE.bizNo}
              <span aria-hidden> | </span>
              통신판매번호: {OFFICE.mailOrderNo}
            </p>
            <p>※ 사무국 운영시간 : {OFFICE.hours}</p>
          </address>
          <p className="site-footer__copy">{OFFICE.copyright}</p>
        </div>

        <nav className="site-footer__nav" aria-label="약관">
          {LEGAL_LINKS.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <ul className="site-footer__sponsors">
        {EVENT.sponsors.map((s) => {
          const logo = SPONSOR_LOGOS[s.role];

          return (
            <li key={s.role}>
              <span>{s.role}</span>
              <Image
                src={logo.src}
                alt={s.name}
                width={logo.width}
                height={logo.height}
                className={s.role === "주관" ? "is-organizer" : undefined}
              />
            </li>
          );
        })}
      </ul>

      <Link
        href="/"
        className="site-footer__logo"
        aria-label="MARVEL RUN 홈"
        draggable={false}
      >
        <Image
          src={MAIN_ASSETS.footerLogo}
          alt=""
          width={1236}
          height={98}
          draggable={false}
        />
      </Link>
    </footer>
  );
}
