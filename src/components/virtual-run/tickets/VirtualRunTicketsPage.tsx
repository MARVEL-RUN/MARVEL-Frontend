"use client";

import { Check } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { AddressField, FormRow, FormSec, PhoneField } from "@/components/main/register/ApplyUi";
import { demoTicketPurchase } from "@/lib/virtual-run/cert-demo";
import { readParticipant } from "@/lib/virtual-run/participant-client";
import type { VirtualRunRoundId } from "@/lib/virtual-run/rounds";
import { VIRTUAL_RUN_ROUNDS, virtualRunRoundById } from "@/lib/virtual-run/rounds";
import { virtualRunDemoEnabled } from "@/lib/virtual-run/site";
import { useVirtualRunParticipant } from "../participant/VirtualRunParticipantProvider";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink } from "../layout/VrLink";

type TicketKind = "single" | "package";

const TICKETS: Record<TicketKind, { no: string; code: string; title: string; price: number; desc: string }> = {
  single: {
    no: "01",
    code: "SINGLE",
    title: "1회차 티켓",
    price: 55000,
    desc: "원하는 회차 하나 · 키트 1세트",
  },
  package: {
    no: "02",
    code: "PACKAGE",
    title: "3회차 패키지",
    price: 110000,
    desc: "어벤져스·엑스맨·판타스틱4 · 키트 3세트",
  },
};

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

export function VirtualRunTicketsPage() {
  const { update } = useVirtualRunParticipant();
  const [kind, setKind] = useState<TicketKind>("single");
  const [singleRound, setSingleRound] = useState<VirtualRunRoundId>("avengers");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState({ zonecode: "", address: "", addressDetail: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ bib: string; roundIds: VirtualRunRoundId[]; kind: TicketKind } | null>(null);

  const roundIds = useMemo((): VirtualRunRoundId[] => {
    if (kind === "package") return VIRTUAL_RUN_ROUNDS.map((r) => r.id);
    return [singleRound];
  }, [kind, singleRound]);

  const ticket = TICKETS[kind];
  const roundText = (ids: VirtualRunRoundId[]) =>
    ids.map((id) => virtualRunRoundById(id).theme).join(" · ");

  function onPay(e: FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    const filled = name.trim() && digits.length >= 10 && addr.address;
    if (!filled && !virtualRunDemoEnabled) {
      setError(
        !name.trim()
          ? "이름을 입력해 주세요."
          : digits.length < 10
            ? "휴대폰 번호를 확인해 주세요."
            : "배송 주소를 입력해 주세요.",
      );
      return;
    }
    setError("");
    const shipping = {
      name: name.trim() || "김마블",
      phone: digits.length >= 10 ? digits : "01000000000",
    };
    const next = demoTicketPurchase(readParticipant(), roundIds, shipping);
    update(next);
    setDone({ bib: next.bib, roundIds, kind });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <VirtualRunSubPage kicker="TICKET" title="티켓 구매" en="GET YOUR PASS">
        <div className="page__body wrap wrap--narrow">
          <section className="ticket ticket--done">
            <span className="kicker">PAYMENT COMPLETE</span>
            <h2>
              결제가 <em>완료</em>되었습니다
            </h2>
            <p className="ticket__meta">배번호와 마이페이지 링크를 문자로 보내드립니다.</p>
            <p className="ticket__no">BIB {done.bib}</p>
            <dl className="spec">
              <div>
                <dt>티켓</dt>
                <dd>{TICKETS[done.kind].title}</dd>
              </div>
              <div>
                <dt>회차</dt>
                <dd>{roundText(done.roundIds)}</dd>
              </div>
              <div>
                <dt>결제 금액</dt>
                <dd>{won(TICKETS[done.kind].price)}</dd>
              </div>
              <div>
                <dt>키트 배송</dt>
                <dd>11월 30일부터 순차 배송</dd>
              </div>
            </dl>
            <div className="flow__nav">
              <VrLink href="/guide" className="btn btn--ghost">
                인증 가이드
              </VrLink>
              <VrLink href="/mypage" className="btn btn--red">
                마이페이지
              </VrLink>
            </div>
          </section>
        </div>
      </VirtualRunSubPage>
    );
  }

  return (
    <VirtualRunSubPage kicker="TICKET" title="티켓 구매" en="GET YOUR PASS">
      <div className="page__body wrap wrap--narrow">
        <form className="form" onSubmit={onPay} noValidate>
          <section className="block">
            <header className="form__head">
              <h2>티켓 선택</h2>
              <p className="form__note">회차마다 키트 1세트가 배송되고, 구매한 회차만 인증할 수 있습니다.</p>
            </header>
            <ul className="kind-pick vr-pick" role="radiogroup" aria-label="티켓 종류">
              {(Object.keys(TICKETS) as TicketKind[]).map((k) => {
                const t = TICKETS[k];
                const on = kind === k;
                return (
                  <li key={k}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={on}
                      className={`kind-pick__item${k === "package" ? " kind-pick__item--cyan" : ""}${on ? " is-on" : ""}`}
                      onClick={() => setKind(k)}
                    >
                      <span className="kind-pick__no">{t.no}</span>
                      <span className="kind-pick__body">
                        <span className="kind-pick__code">{t.code}</span>
                        <strong className="kind-pick__title">{t.title}</strong>
                        <span className="vr-pick__price">{won(t.price)}</span>
                        <span className="kind-pick__desc">{t.desc}</span>
                      </span>
                      <span className="vr-pick__mark" aria-hidden>
                        {on ? <Check size={14} strokeWidth={3} /> : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <FormSec kicker="01 / ROUND" title="참가 회차">
            <FormRow label="회차" required>
              {kind === "single" ? (
                <div className="seg vr-round-seg" role="radiogroup" aria-label="회차">
                  {VIRTUAL_RUN_ROUNDS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      role="radio"
                      aria-checked={singleRound === r.id}
                      className={`is-${r.accent}${singleRound === r.id ? " is-on" : ""}`}
                      onClick={() => setSingleRound(r.id)}
                    >
                      {r.label} · {r.theme}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="seg vr-round-seg">
                  {VIRTUAL_RUN_ROUNDS.map((r) => (
                    <span key={r.id} className={`is-${r.accent} is-on`}>
                      {r.label} · {r.theme}
                    </span>
                  ))}
                </div>
              )}
              <p className="form-row__hint">
                {kind === "single" ? "고른 회차의 키트와 러닝 인증 1회가 포함됩니다." : "세 회차 키트를 모두 받고, 회차마다 한 번씩 인증합니다."}
              </p>
            </FormRow>
          </FormSec>

          <FormSec kicker="02 / SHIPPING" title="참가자 · 배송 정보">
            <FormRow label="이름" required>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </FormRow>
            <FormRow label="휴대폰 번호" required>
              <PhoneField value={phone} onChange={setPhone} autoComplete="tel" placeholder="010-0000-0000" />
              <p className="form-row__hint">결제 후 이 번호로 배번호와 마이페이지 링크를 보내드립니다.</p>
            </FormRow>
            <FormRow label="배송 주소" required>
              <AddressField
                zonecode={addr.zonecode}
                address={addr.address}
                addressDetail={addr.addressDetail}
                onChange={(patch) => setAddr((prev) => ({ ...prev, ...patch }))}
              />
            </FormRow>
          </FormSec>

          <section className="vr-sum" aria-label="결제 요약">
            <dl>
              <div>
                <dt>티켓</dt>
                <dd>{ticket.title}</dd>
              </div>
              <div>
                <dt>회차</dt>
                <dd>{roundText(roundIds)}</dd>
              </div>
            </dl>
            <p className="vr-sum__total">
              <span>결제 금액</span>
              <strong>{won(ticket.price)}</strong>
            </p>
          </section>

          {error ? (
            <p className="form__err" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flow__nav">
            <button type="submit" className="btn btn--red">
              {won(ticket.price)} 결제하기
            </button>
          </div>
        </form>

        <div className="lookup-other">
          <VrLink href="/login" className="lookup-other__btn">
            이미 티켓이 있으신가요
          </VrLink>
        </div>
      </div>
    </VirtualRunSubPage>
  );
}
