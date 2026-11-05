"use client";

import { FormEvent, useRef, useState } from "react";
import { FormRow, FormSec } from "@/components/main/register/ApplyUi";
import { demoInstantApproveKit } from "@/lib/virtual-run/cert-demo";
import { virtualRunDemoEnabled } from "@/lib/virtual-run/site";
import { KIT_CERT_HASHTAGS, KIT_CERT_MAX_PHOTOS } from "@/lib/virtual-run/kit-cert";
import { isInstagramPostUrl } from "@/lib/virtual-run/running-cert";
import { useVirtualRunParticipantOrDemo } from "../participant/VirtualRunParticipantProvider";
import { HashtagCopy } from "./HashtagCopy";
import { VrFileField } from "./VrFileField";
import { VrSteps } from "./VrSteps";

type Step = 1 | 2;

const STEP_LABELS = ["키트 사진", "인스타 인증"] as const;

function hasFile(fd: FormData, name: string): boolean {
  const v = fd.get(name);
  return v instanceof File && v.size > 0;
}

export function KitCertForm({ onDone }: { onDone: (mode: "approved" | "pending") => void }) {
  const { participant, update } = useVirtualRunParticipantOrDemo();
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [instaUrl, setInstaUrl] = useState("");
  const [promoOk, setPromoOk] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toStep2() {
    const fd = new FormData(formRef.current!);
    const next: Record<string, string> = {};
    if (!hasFile(fd, "kitPhoto1")) next.kitPhoto1 = "키트 사진을 1장 이상 첨부해 주세요.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setStep(2);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (!hasFile(fd, "instaShot")) next.instaShot = "게시물 스크린샷을 첨부해 주세요.";
    if (!instaUrl.trim()) next.instaUrl = "게시물 링크를 입력해 주세요.";
    else if (!isInstagramPostUrl(instaUrl)) {
      next.instaUrl = "instagram.com/p/ 또는 /reel/ 로 시작하는 주소를 넣어 주세요.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    if (virtualRunDemoEnabled) {
      update(demoInstantApproveKit(participant));
      onDone("approved");
    } else {
      update({ ...participant, kitCert: "pending" });
      onDone("pending");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <form ref={formRef} className="form vr-cert-form" onSubmit={onSubmit} noValidate>
      <VrSteps labels={STEP_LABELS} current={step} />

      <div hidden={step !== 1}>
        <FormSec
          kicker="01 / KIT"
          title="키트 사진"
          note={`배번호 ${participant.bib.trim() || "-"}가 선명하게 보이도록 찍어 주세요.`}
        >
          {Array.from({ length: KIT_CERT_MAX_PHOTOS }, (_, i) => (
            <VrFileField
              key={i}
              name={`kitPhoto${i + 1}`}
              label={`키트 사진 ${i + 1}`}
              required={i === 0}
              hint={i === 0 ? undefined : "선택"}
              error={i === 0 ? errors.kitPhoto1 : undefined}
            />
          ))}
        </FormSec>
        <div className="flow__nav">
          <button type="button" className="btn btn--red" onClick={toStep2}>
            다음
          </button>
        </div>
      </div>

      <div hidden={step !== 2}>
        <FormSec
          kicker="02 / INSTAGRAM"
          title="인스타 인증"
          note="러닝 인증과 다른 게시물로 올려 주세요."
        >
          <HashtagCopy tags={KIT_CERT_HASHTAGS} />
          <VrFileField
            name="instaShot"
            label="게시물 스크린샷"
            required
            hint="해시태그가 보이는 화면"
            error={errors.instaShot}
          />
          <FormRow label="게시물 링크" required>
            <input
              type="text"
              inputMode="url"
              name="instaUrl"
              className="is-wide"
              value={instaUrl}
              onChange={(e) => setInstaUrl(e.target.value)}
              placeholder="https://www.instagram.com/p/..."
              aria-invalid={Boolean(errors.instaUrl)}
            />
            {errors.instaUrl ? (
              <p className="form-row__hint is-err" role="alert">
                {errors.instaUrl}
              </p>
            ) : null}
          </FormRow>
          <div className="vr-agree">
            <label className="guardian-consent-check">
              <input type="checkbox" checked={promoOk} onChange={(e) => setPromoOk(e.target.checked)} />
              <span className="guardian-consent-check__label">
                <em className="is-opt">[선택]</em> 공식 채널 리그램 등 홍보 활용에 동의합니다.
              </span>
            </label>
          </div>
        </FormSec>
        <div className="flow__nav">
          <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>
            이전
          </button>
          <button type="submit" className="btn btn--red">
            제출하기
          </button>
        </div>
      </div>
    </form>
  );
}
