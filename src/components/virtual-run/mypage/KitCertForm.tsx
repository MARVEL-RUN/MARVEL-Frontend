"use client";

import { FormEvent, useRef, useState } from "react";
import { FormRow, FormSec } from "@/components/main/register/ApplyUi";
import { demoInstantApproveKit } from "@/lib/virtual-run/cert-demo";
import { virtualRunDemoEnabled } from "@/lib/virtual-run/site";
import { KIT_CERT_HASHTAGS, KIT_CERT_MAX_PHOTOS } from "@/lib/virtual-run/kit-cert";
import { isInstagramPostUrl } from "@/lib/virtual-run/running-cert";
import { useVirtualRunParticipantOrDemo } from "../participant/VirtualRunParticipantProvider";
import { CertSubmitResult } from "./CertSubmitResult";
import { HashtagCopy } from "./HashtagCopy";
import { VrFileField } from "./sessions/VrFileField";

type Step = 1 | 2 | 3;

export function KitCertForm() {
  const { participant, update } = useVirtualRunParticipantOrDemo();
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [instaUrl, setInstaUrl] = useState("");
  const [promoOk, setPromoOk] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateStep(s: Step, fd?: FormData): boolean {
    const next: Record<string, string> = {};
    if (s === 1 && fd && !fd.get("kitPhoto1")) {
      next.kitPhoto1 = "키트 사진 1장 이상 첨부해 주세요.";
    }
    if (s === 2 && fd) {
      if (!fd.get("instaShot")) next.instaShot = "인스타 스크린샷을 첨부해 주세요.";
    }
    if (s === 3) {
      if (!instaUrl.trim()) next.instaUrl = "인스타 링크를 입력해 주세요.";
      else if (!isInstagramPostUrl(instaUrl)) {
        next.instaUrl = "instagram.com/p/ 또는 /reel/ 형식이어야 합니다.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (!validateStep(3, fd)) return;
    if (virtualRunDemoEnabled) update(demoInstantApproveKit(participant));
    setDone(true);
  }

  if (done) {
    return (
      <CertSubmitResult
        mode="approved"
        title="키트 인증 승인 (데모)"
        onAgain={() => {
          setDone(false);
          setStep(1);
        }}
        againLabel="다시 제출 (데모)"
      />
    );
  }

  return (
    <form ref={formRef} className="form vr-cert-form vr-cert-wizard" onSubmit={onSubmit} noValidate>
      <ol className="vr-cert-wizard__steps" aria-label="키트 인증 단계">
        {[1, 2, 3].map((n) => (
          <li key={n} className={step === n ? "is-current" : step > n ? "is-done" : ""}>
            {n}단계
          </li>
        ))}
      </ol>

      {step === 1 ? (
        <FormSec kicker="01 / KIT" title="키트 사진">
          <p className="form-sec__note">배번호 {participant.bib} 이 보이도록 촬영해 주세요.</p>
          {Array.from({ length: KIT_CERT_MAX_PHOTOS }, (_, i) => (
            <VrFileField
              key={i}
              name={`kitPhoto${i + 1}`}
              label={`키트 사진 ${i + 1}`}
              required={i === 0}
              hint={i === 0 ? "필수 · JPG·PNG·HEIC" : "선택"}
              error={i === 0 ? errors.kitPhoto1 : undefined}
            />
          ))}
          <div className="vr-cert-wizard__nav">
            <button
              type="button"
              className="btn btn--red"
              onClick={() => {
                const form = formRef.current;
                if (!form) return;
                if (validateStep(1, new FormData(form))) setStep(2);
              }}
            >
              다음
            </button>
          </div>
        </FormSec>
      ) : null}

      {step === 2 ? (
        <FormSec kicker="02 / PROOF" title="인스타 스크린샷">
          <VrFileField
            name="instaShot"
            label="인스타 게시물 스크린샷"
            required
            hint="필수 해시태그가 보이는 화면"
            error={errors.instaShot}
          />
          <p className="form-row__hint">러닝 인증과 다른 게시물이어야 합니다.</p>
          <div className="vr-cert-wizard__nav">
            <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>
              이전
            </button>
            <button
              type="button"
              className="btn btn--red"
              onClick={() => {
                const form = formRef.current;
                if (!form) return;
                if (validateStep(2, new FormData(form))) setStep(3);
              }}
            >
              다음
            </button>
          </div>
        </FormSec>
      ) : null}

      {step === 3 ? (
        <>
          <FormSec kicker="03 / SNS" title="인스타그램">
            <HashtagCopy text={KIT_CERT_HASHTAGS} />
            <FormRow label="인스타 게시물 링크" required>
              <input
                type="url"
                name="instaUrl"
                className="is-wide"
                value={instaUrl}
                onChange={(e) => setInstaUrl(e.target.value)}
                placeholder="https://www.instagram.com/p/…"
                aria-invalid={Boolean(errors.instaUrl)}
              />
              {errors.instaUrl ? (
                <p className="form-row__hint is-err" role="alert">
                  {errors.instaUrl}
                </p>
              ) : null}
            </FormRow>
            <label className="vr-cert-check">
              <input
                type="checkbox"
                name="promoOk"
                checked={promoOk}
                onChange={(e) => setPromoOk(e.target.checked)}
              />
              <span>홍보 활용 동의 (선택)</span>
            </label>
          </FormSec>
          <div className="vr-cert-wizard__nav">
            <button type="button" className="btn btn--ghost" onClick={() => setStep(2)}>
              이전
            </button>
            <button type="submit" className="btn btn--red">
              키트 인증 제출
            </button>
          </div>
        </>
      ) : null}
    </form>
  );
}
