import Link from "next/link";
import { EVENT } from "@/lib/event";
import { LEGAL_LINKS, OFFICE } from "@/lib/legal";
import { BrandMark } from "./BrandMark";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Link href="/" aria-label="MARVEL RUN 홈">
            <BrandMark />
          </Link>
          <p className="site-footer__office-name">{OFFICE.name}</p>
          <address className="site-footer__office">
            <p>{OFFICE.address}</p>
            <p>사업자번호 : {OFFICE.bizNo}</p>
            <p>통신판매번호 : {OFFICE.mailOrderNo}</p>
            <p>대표자 : {OFFICE.ceo}</p>
            <p>Tel : {OFFICE.tel}</p>
            <p>E-mail : {OFFICE.email}</p>
            <p>사무국 운영시간 : {OFFICE.hours}</p>
          </address>
        </div>

        <nav className="site-footer__nav" aria-label="약관">
          {LEGAL_LINKS.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <ul className="site-footer__sponsors">
          {EVENT.sponsors.map((s) => (
            <li key={s.role}>
              <span>{s.role}</span>
              <strong>{s.name}</strong>
            </li>
          ))}
        </ul>
      </div>
      <p className="site-footer__copy">{OFFICE.copyright}</p>
    </footer>
  );
}
