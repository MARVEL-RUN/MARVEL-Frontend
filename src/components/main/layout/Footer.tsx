"use client";

import Image from "next/image";
import Link from "next/link";
import { MAIN_ASSETS } from "@/lib/assets";
import { LEGAL_DOCS, OFFICE } from "@/lib/legal";
import { useLegalModal } from "../legal/LegalModal";

const OFFICE_FACTS = [
  { label: "주소", value: OFFICE.address },
  {
    label: "대표번호",
    value: <a href={`tel:${OFFICE.tel}`}>{OFFICE.tel}</a>,
  },
  {
    label: "이메일",
    value: <a href={`mailto:${OFFICE.email}`}>{OFFICE.email}</a>,
  },
  { label: "운영시간", value: OFFICE.hours },
  { label: "대표자", value: OFFICE.ceo },
  { label: "사업자번호", value: OFFICE.bizNo },
  { label: "통신판매번호", value: OFFICE.mailOrderNo },
] as const;

export function Footer() {
  const { open } = useLegalModal();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__info">
          <nav className="site-footer__nav" aria-label="약관">
            {LEGAL_DOCS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  open(item.id);
                }}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/faq">FAQ</Link>
          </nav>

          <p className="site-footer__office-name">{OFFICE.name}</p>
          <dl
            className="site-footer__facts"
            {...{ "x-apple-data-detectors": "false" }}
          >
            {OFFICE_FACTS.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
          <p className="site-footer__copy">{OFFICE.copyright}</p>
        </div>
      </div>

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
