"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { COMING_SOON_ASSETS, MAIN_ASSETS } from "@/lib/assets";
import { EVENT } from "@/lib/event";
import "./virtual.css";

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

type RoundId = (typeof ROUNDS)[number]["id"];

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
  const [roundId, setRound] = useState<RoundId>("1");
  const round = ROUNDS.find((item) => item.id === roundId) ?? ROUNDS[0];

  return (
    <div
      className="virtual"
      style={
        {
          "--virtual-accent": round.accent,
          "--virtual-panel": round.panel,
        } as CSSProperties
      }
    >
      <header className="virtual-header">
        <Link href="/" className="virtual-header__brand" aria-label="MARVEL RUN 홈">
          <Image
            src={COMING_SOON_ASSETS.logo}
            alt="MARVEL RUN 2026 KOREA"
            width={926}
            height={420}
            className="virtual-header__logo"
            priority
          />
        </Link>
      </header>

      <div className="virtual-stage">
        <section className="virtual-hero">
          <h1 className="virtual-hero__title">버추얼런 안내</h1>
          <p className="virtual-hero__lead">러닝이 가능한 전국 원하는 곳 어디든</p>
          <div className="virtual-hero__rounds" role="tablist" aria-label="차수">
            {ROUNDS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={roundId === item.id}
                className={roundId === item.id ? "virtual-round is-on" : "virtual-round"}
                onClick={() => setRound(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="virtual-hero__slogan">{round.slogan}</p>
          <p className="virtual-hero__line">{round.line}</p>
        </section>

        <section className="virtual-sheet" aria-labelledby="virtual-round-title">
          <article className="virtual-card">
            <div className="virtual-card__visual">
              <Image
                key={round.id}
                src={round.image}
                alt={round.alt}
                width={582}
                height={328}
                className="virtual-card__img"
                priority
              />
            </div>
            <div className="virtual-card__body">
              <h2 id="virtual-round-title" className="virtual-card__title">
                {round.label} 버추얼런
              </h2>
              <dl className="virtual-info">
                {round.rows.map((row) => (
                  <div key={row.label} className="virtual-info__row">
                    <dt>{row.label}</dt>
                    <dd>
                      <span className="virtual-info__date">{row.date}</span>
                      {"time" in row && row.time ? (
                        <span className="virtual-info__time">{row.time}</span>
                      ) : null}
                    </dd>
                  </div>
                ))}
              </dl>
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
