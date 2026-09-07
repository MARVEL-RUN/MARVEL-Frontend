import Image from "next/image";
import Link from "next/link";
import { EVENT } from "@/lib/event";
import { MAIN_ASSETS } from "@/lib/assets";
import { LEGAL_LINKS, OFFICE } from "@/lib/legal";

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
        {EVENT.sponsors.map((s) => (
          <li key={s.role}>
            <span>{s.role}</span>
            <strong>{s.name}</strong>
          </li>
        ))}
      </ul>

      <Link href="/" className="site-footer__logo" aria-label="MARVEL RUN 홈">
        <Image
          src={MAIN_ASSETS.logo}
          alt=""
          width={1257}
          height={98}
        />
      </Link>
    </footer>
  );
}
