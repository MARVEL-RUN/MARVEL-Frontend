"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultParticipant } from "@/lib/virtual-run/participant";
import { writeParticipant } from "@/lib/virtual-run/participant-client";
import { virtualRunDemoEnabled } from "@/lib/virtual-run/site";
import { useVirtualRunParticipant } from "../participant/VirtualRunParticipantProvider";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink } from "../layout/VrLink";

export function VirtualRunLoginPage() {
  const router = useRouter();
  const { login, update } = useVirtualRunParticipant();
  const [sent, setSent] = useState(false);

  function completeLogin(bib: string, phone: string) {
    const base = defaultParticipant({ bib, phone });
    writeParticipant(base);
    update(base);
    login({ bib, phone });
    router.push("/mypage");
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const bib = String(fd.get("bib") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();

    if (virtualRunDemoEnabled) {
      completeLogin(bib || "602601", phone || "01000000000");
      return;
    }

    if (!sent) {
      setSent(true);
      return;
    }

    completeLogin(bib, phone);
  }

  function demoSkip() {
    completeLogin("602601", "01000000000");
  }

  return (
    <VirtualRunSubPage kicker="LOGIN" title="로그인" en="BIB · SMS">
      <section className="guide-sec">
        <div className="wrap wrap--narrow vr-page-inner vr-page-inner--auth">
          <p className="vr-page-lead">
            회원가입 없이 배번호와 휴대폰 문자 인증으로 로그인합니다.
          </p>
          {virtualRunDemoEnabled ? (
            <button type="button" className="btn btn--red" onClick={demoSkip}>
              데모 로그인 (인증 생략)
            </button>
          ) : null}
          <form className="inquiry-secret__form--stack" onSubmit={onSubmit} noValidate>
            <label className="inquiry-secret__field">
              <span>배번호</span>
              <span className="inquiry-secret__control">
                <input
                  id="vr-bib"
                  name="bib"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={virtualRunDemoEnabled ? "602601" : undefined}
                />
              </span>
            </label>
            <label className="inquiry-secret__field">
              <span>휴대폰 번호</span>
              <span className="inquiry-secret__control">
                <input
                  id="vr-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="01012345678"
                />
              </span>
            </label>
            {!virtualRunDemoEnabled && !sent ? (
              <button type="submit" className="btn btn--red">
                인증번호 받기
              </button>
            ) : (
              <>
                {!virtualRunDemoEnabled ? (
                  <label className="inquiry-secret__field">
                    <span>인증번호</span>
                    <span className="inquiry-secret__control">
                      <input id="vr-code" name="code" inputMode="numeric" maxLength={6} />
                    </span>
                  </label>
                ) : null}
                <button type="submit" className="btn btn--red">
                  {virtualRunDemoEnabled ? "로그인 (데모)" : "로그인"}
                </button>
              </>
            )}
          </form>
          <p className="vr-form-note">
            티켓이 없으신가요?{" "}
            <VrLink href="/tickets" className="vr-inline-link">
              티켓 구매
            </VrLink>
          </p>
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
