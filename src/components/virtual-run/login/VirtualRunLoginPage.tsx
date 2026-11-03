"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { mainToast } from "@/components/main/feedback/MainFeedback";
import { PhoneField } from "@/components/main/register/ApplyUi";
import { defaultParticipant } from "@/lib/virtual-run/participant";
import { readParticipant } from "@/lib/virtual-run/participant-client";
import { virtualRunDemoEnabled } from "@/lib/virtual-run/site";
import { useVirtualRunParticipant } from "../participant/VirtualRunParticipantProvider";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink, useVrPath } from "../layout/VrLink";

const DEMO_BIB = "602601";
const DEMO_PHONE = "01000000000";

export function VirtualRunLoginPage() {
  const router = useRouter();
  const toHref = useVrPath();
  const { update } = useVirtualRunParticipant();
  const [bib, setBib] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function completeLogin(nextBib: string, nextPhone: string) {
    const saved = readParticipant();
    const base =
      saved && saved.bib === nextBib ? saved : defaultParticipant({ bib: nextBib, phone: nextPhone });
    update({ ...base, phone: nextPhone });
    router.push(toHref("/mypage"));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");

    if (virtualRunDemoEnabled && !bib.trim() && !digits) {
      completeLogin(DEMO_BIB, DEMO_PHONE);
      return;
    }
    if (!/^\d{4,8}$/.test(bib.trim())) {
      setError("배번호를 확인해 주세요.");
      return;
    }
    if (digits.length < 10) {
      setError("휴대폰 번호를 확인해 주세요.");
      return;
    }
    if (!sent) {
      setError("");
      setSent(true);
      mainToast.success("인증번호를 보냈습니다.");
      return;
    }
    if (!virtualRunDemoEnabled && !/^\d{6}$/.test(code)) {
      setError("인증번호 6자리를 입력해 주세요.");
      return;
    }
    setError("");
    completeLogin(bib.trim(), digits);
  }

  return (
    <VirtualRunSubPage kicker="LOGIN" title="참가자 로그인" en="BIB · SMS">
      <div className="page__body wrap wrap--narrow">
        <form className="form vr-login" onSubmit={onSubmit} noValidate>
          <header className="form__head">
            <h2>참가자 로그인</h2>
            <p className="form__note">
              회원가입 없이 결제 후 문자로 받은 배번호와 휴대폰 번호로 로그인합니다.
            </p>
          </header>

          <label className="field">
            <span>배번호</span>
            <input
              name="bib"
              inputMode="numeric"
              autoComplete="off"
              maxLength={8}
              placeholder="문자로 받은 배번호"
              value={bib}
              onChange={(e) => setBib(e.target.value.replace(/\D/g, ""))}
              disabled={sent}
            />
          </label>

          <label className="field">
            <span>휴대폰 번호</span>
            <PhoneField value={phone} onChange={setPhone} name="phone" placeholder="010-0000-0000" disabled={sent} />
          </label>

          {sent ? (
            <label className="field">
              <span>인증번호</span>
              <input
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="6자리"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                autoFocus
              />
              <p className="field__hint">
                문자가 오지 않았다면{" "}
                <button type="button" className="vr-text-btn" onClick={() => setSent(false)}>
                  번호 다시 입력
                </button>
              </p>
            </label>
          ) : null}

          {error ? (
            <p className="form__err" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flow__nav">
            <button type="submit" className="btn btn--red">
              {sent ? "로그인" : "인증번호 받기"}
            </button>
          </div>
        </form>

        <div className="lookup-other">
          <VrLink href="/tickets" className="lookup-other__btn">
            아직 티켓이 없으신가요
          </VrLink>
        </div>
      </div>
    </VirtualRunSubPage>
  );
}
