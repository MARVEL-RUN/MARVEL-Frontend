"use client";

import { FormEvent, useMemo, useState } from "react";
import { VIRTUAL_RUN_EVENT } from "@/lib/virtual-run/event";
import { demoTicketPurchase } from "@/lib/virtual-run/cert-demo";
import { readParticipant, writeParticipant } from "@/lib/virtual-run/participant-client";
import type { VirtualRunRoundId } from "@/lib/virtual-run/rounds";
import { VIRTUAL_RUN_ROUNDS } from "@/lib/virtual-run/rounds";
import { virtualRunDemoEnabled } from "@/lib/virtual-run/site";
import { useVirtualRunParticipant } from "../participant/VirtualRunParticipantProvider";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink } from "../layout/VrLink";

type TicketKind = "single" | "package";

export function VirtualRunTicketsPage() {
  const { update, login } = useVirtualRunParticipant();
  const [kind, setKind] = useState<TicketKind>("single");
  const [singleRound, setSingleRound] = useState<VirtualRunRoundId>("avengers");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [done, setDone] = useState(false);
  const [bib, setBib] = useState("");

  const ownedRoundIds = useMemo((): VirtualRunRoundId[] => {
    if (kind === "package") return VIRTUAL_RUN_ROUNDS.map((r) => r.id);
    return [singleRound];
  }, [kind, singleRound]);

  function onPay(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) return;
    const existing = readParticipant();
    const next = demoTicketPurchase(existing, ownedRoundIds, { name: name.trim(), phone: phone.trim() });
    writeParticipant(next);
    update(next);
    login({ name: name.trim(), phone: phone.trim(), bib: next.bib });
    setBib(next.bib);
    setDone(true);
  }

  if (done) {
    return (
      <VirtualRunSubPage kicker="TICKET" title="티켓 구매" en="GET YOUR PASS">
        <section className="guide-sec">
          <div className="wrap wrap--narrow vr-page-inner">
            <article className="vr-panel vr-cert-done">
              <h2>결제 완료 (데모)</h2>
              <p>
                배번호 <strong>{bib}</strong> · 키트 배송 준비 상태로 등록되었습니다.
              </p>
              <VrLink href="/mypage" className="btn btn--red vr-stack-sm">
                마이페이지
              </VrLink>
            </article>
          </div>
        </section>
      </VirtualRunSubPage>
    );
  }

  return (
    <VirtualRunSubPage kicker="TICKET" title="티켓 구매" en="GET YOUR PASS">
      <section className="guide-sec">
        <div className="wrap wrap--narrow vr-page-inner">
          <p className="vr-page-lead">회차·배송 정보 입력 후 결제합니다.</p>
          <form className="inquiry-secret__form--stack" onSubmit={onPay}>
            <div className="vr-ticket-options">
              <label className="vr-ticket-option">
                <input
                  type="radio"
                  name="ticket"
                  value="single"
                  checked={kind === "single"}
                  onChange={() => setKind("single")}
                />
                <div>
                  <strong>1회차</strong>
                  <p className="vr-form-note">{VIRTUAL_RUN_EVENT.ticketSingle}</p>
                </div>
              </label>
              <label className="vr-ticket-option">
                <input
                  type="radio"
                  name="ticket"
                  value="package"
                  checked={kind === "package"}
                  onChange={() => setKind("package")}
                />
                <div>
                  <strong>3회차 PKG</strong>
                  <p className="vr-form-note">{VIRTUAL_RUN_EVENT.ticketPackage}</p>
                </div>
              </label>
            </div>

            {kind === "single" ? (
              <label className="inquiry-secret__field">
                <span>참가 회차</span>
                <span className="inquiry-secret__control">
                  <select
                    value={singleRound}
                    onChange={(e) => setSingleRound(e.target.value as VirtualRunRoundId)}
                  >
                    {VIRTUAL_RUN_ROUNDS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label} · {r.theme}
                      </option>
                    ))}
                  </select>
                </span>
              </label>
            ) : null}

            <label className="inquiry-secret__field">
              <span>이름</span>
              <span className="inquiry-secret__control">
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </span>
            </label>
            <label className="inquiry-secret__field">
              <span>휴대폰</span>
              <span className="inquiry-secret__control">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  required
                />
              </span>
            </label>
            <label className="inquiry-secret__field">
              <span>배송 주소</span>
              <span className="inquiry-secret__control">
                <input value={address} onChange={(e) => setAddress(e.target.value)} required />
              </span>
            </label>

            <button type="submit" className="btn btn--red">
              {virtualRunDemoEnabled ? "결제하기 (데모 · 즉시 완료)" : "결제하기"}
            </button>
            <p className="vr-form-note">실결제·PG 연동 전입니다. 데모에서는 입력만으로 구매가 완료됩니다.</p>
          </form>
          <p className="vr-form-note vr-stack-top">
            이미 티켓이 있으신가요?{" "}
            <VrLink href="/login" className="vr-inline-link">
              로그인
            </VrLink>
          </p>
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
