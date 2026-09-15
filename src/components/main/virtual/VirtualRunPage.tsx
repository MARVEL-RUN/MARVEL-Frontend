"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { COMING_SOON_ASSETS, MAIN_ASSETS } from "@/lib/assets";
import { EVENT } from "@/lib/event";
import "./virtual.css";

/* 차수 확정 전 — 1·2·3차 구분 없이 COMING SOON
const ROUNDS = [
  {
    id: "1",
    label: "1차",
    accent: "#d16bff",
    panel: "#1c0a3a",
    image: MAIN_ASSETS.virtualBlack,
    alt: "블랙 팬서",
    slogan: "Wakanda Forever",
    line: "어둠을 가르고 달리는 첫 번째 도전",
    rows: [
      { label: "티켓 오픈", date: "11월 4일(수)", time: "14:00" },
      { label: "티켓 마감", date: "11월 18일(수)", time: "14:00" },
      { label: "배송 시작", date: "11월 16일" },
      { label: "인증 마감", date: "11월 27일" },
    ],
  },
  {
    id: "2",
    label: "2차",
    accent: "#3dff7a",
    panel: "#062016",
    image: MAIN_ASSETS.virtualDom,
    alt: "닥터 둠",
    slogan: "Doom Awaits",
    line: "운명을 따라 달리는 두 번째 질주",
    rows: [
      { label: "티켓 오픈", date: "11월 25일(수)", time: "14:00" },
      { label: "티켓 마감", date: "12월 9일(수)", time: "10:00" },
      { label: "배송 시작", date: "12월 7일" },
      { label: "인증 마감", date: "12월 18일" },
    ],
  },
  {
    id: "3",
    label: "3차",
    accent: "#ffb020",
    panel: "#2e1200",
    image: MAIN_ASSETS.virtualThor,
    alt: "토르",
    slogan: "Bring the Thunder",
    line: "번개처럼 치고 나가는 마지막 라운드",
    rows: [
      { label: "티켓 오픈", date: "12월 16일(수)", time: "14:00" },
      { label: "티켓 마감", date: "12월 30일(수)" },
      { label: "배송 시작", date: "12월 28일" },
      { label: "인증 마감", date: "1월 8일" },
    ],
  },
] as const;
*/

const SOON = {
  accent: "#3dff7a",
  panel: "#020805",
} as const;

const HOSTS = [
  {
    role: "주최",
    src: MAIN_ASSETS.footerHost,
    width: 4786,
    height: 1320,
    name: EVENT.sponsors.find((s) => s.role === "주최")?.name ?? "주최",
  },
  {
    role: "주관",
    src: MAIN_ASSETS.footerOrganizer,
    width: 1601,
    height: 220,
    name: EVENT.sponsors.find((s) => s.role === "주관")?.name ?? "주관",
  },
] as const;

export function VirtualRunPage() {
  return (
    <div
      className="virtual is-soon"
      style={
        {
          "--virtual-accent": SOON.accent,
          "--virtual-panel": SOON.panel,
        } as CSSProperties
      }
    >
      <div className="virtual-soon-bg" aria-hidden>
        <Image
          src={MAIN_ASSETS.virtualSoonBg}
          alt=""
          fill
          className="virtual-soon-bg__img is-left"
          sizes="70vw"
          priority
        />
        <Image
          src={MAIN_ASSETS.virtualSoonBg}
          alt=""
          fill
          className="virtual-soon-bg__img is-mid"
          sizes="70vw"
          priority
        />
        <Image
          src={MAIN_ASSETS.virtualSoonBg}
          alt=""
          fill
          className="virtual-soon-bg__img is-right"
          sizes="70vw"
          priority
        />
      </div>

      <header className="virtual-header">
        <Link href="/" className="virtual-header__brand" aria-label="MARVEL RUN 홈">
          <Image
            src={COMING_SOON_ASSETS.logo}
            alt="MARVEL RUN 2026 KOREA"
            width={926}
            height={420}
            className="virtual-header__logo"
            sizes="(max-width: 720px) 40vw, 173px"
            priority
          />
        </Link>
      </header>

      <div className="virtual-stage">
        <section className="virtual-hero">
          <h1 className="virtual-hero__title">버추얼런 안내</h1>
          <p className="virtual-hero__lead">러닝이 가능한 전국 원하는 곳 어디든</p>
          <p className="virtual-hero__soon">COMING SOON</p>
        </section>

        <section className="virtual-sheet" aria-labelledby="virtual-soon-title">
          <article className="virtual-card">
            <div className="virtual-soon-hero">
              <Image
                src={MAIN_ASSETS.virtualSoonHero}
                alt="마블 히어로들과 어벤져스 엠블럼"
                width={353}
                height={377}
                className="virtual-soon-hero__img"
                sizes="(max-width: 720px) min(92vw, 420px), 520px"
                priority
              />
            </div>
            <div className="virtual-card__body">
              <h2 id="virtual-soon-title" className="virtual-card__title">
                버추얼런
              </h2>
              <p className="virtual-soon__copy">
                일정과 신청 안내는 추후 공개됩니다.
              </p>
              <div className="virtual-hosts">
                <p className="virtual-hosts__label">주최 및 주관</p>
                <div className="virtual-hosts__logos">
                  {HOSTS.map((host) => (
                    <Image
                      key={host.role}
                      src={host.src}
                      alt={host.name}
                      width={host.width}
                      height={host.height}
                      className={
                        host.role === "주관"
                          ? "virtual-hosts__logo is-organizer"
                          : "virtual-hosts__logo"
                      }
                      sizes="160px"
                    />
                  ))}
                </div>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}

/* 정식 오픈 시 — 1·2·3차 탭 + 일정
export function VirtualRunPageLive() {
  ...
}
*/
