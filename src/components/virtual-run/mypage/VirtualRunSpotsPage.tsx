"use client";

import { FormEvent, useMemo, useState } from "react";
import { FormRow, FormSec } from "@/components/main/register/ApplyUi";
import { demoInstantApproveSpot } from "@/lib/virtual-run/cert-demo";
import { virtualRunDemoEnabled } from "@/lib/virtual-run/site";
import { isInstagramPostUrl } from "@/lib/virtual-run/running-cert";
import { SPOT_CERT_HASHTAGS, VIRTUAL_RUN_SPOTS } from "@/lib/virtual-run/spots";
import { useVirtualRunParticipantOrDemo } from "../participant/VirtualRunParticipantProvider";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { CertSubmitResult } from "./CertSubmitResult";
import { HashtagCopy } from "./HashtagCopy";
import { VrFileField } from "./sessions/VrFileField";

export function VirtualRunSpotsPage() {
  const { participant, update } = useVirtualRunParticipantOrDemo();
  const openSpots = useMemo(
    () =>
      VIRTUAL_RUN_SPOTS.filter(
        (s) => participant.spots[s.id] !== "approved" && participant.spots[s.id] !== "pending",
      ),
    [participant.spots],
  );
  const [spotId, setSpotId] = useState(openSpots[0]?.id ?? VIRTUAL_RUN_SPOTS[0].id);
  const [visitDate, setVisitDate] = useState("");
  const [instaUrl, setInstaUrl] = useState("");
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const spot = VIRTUAL_RUN_SPOTS.find((s) => s.id === spotId)!;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (!visitDate) next.visitDate = "방문 날짜를 선택해 주세요.";
    if (!fd.get("spotShot")) next.spotShot = "거점 인증샷을 첨부해 주세요.";
    if (!fd.get("instaShot")) next.instaShot = "인스타 스크린샷을 첨부해 주세요.";
    if (!instaUrl.trim()) next.instaUrl = "인스타 링크를 입력해 주세요.";
    else if (!isInstagramPostUrl(instaUrl)) {
      next.instaUrl = "instagram.com/p/ 또는 /reel/ URL이어야 합니다.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    if (virtualRunDemoEnabled) update(demoInstantApproveSpot(participant, spotId, spot.label));
    setDone(true);
  }

  if (done) {
    return (
      <VirtualRunSubPage kicker="MY PAGE" title="거점 이벤트" en="SPOT">
        <section className="guide-sec">
          <div className="wrap wrap--narrow vr-page-inner">
            <CertSubmitResult
              mode="approved"
              title="거점 인증 승인 (데모)"
              onAgain={() => setDone(false)}
            />
          </div>
        </section>
      </VirtualRunSubPage>
    );
  }

  return (
    <VirtualRunSubPage kicker="MY PAGE" title="거점 이벤트" en="SPOT">
      <section className="guide-sec">
        <div className="wrap wrap--narrow vr-page-inner">
          <p className="vr-page-lead">협업 거점 방문 인증 · 거점별 1회 (데모 즉시 승인)</p>
          <form className="form vr-cert-form" onSubmit={onSubmit} noValidate>
            <FormSec kicker="SPOT" title="거점 인증">
              <FormRow label="거점" required>
                <select
                  name="spotId"
                  value={spotId}
                  onChange={(e) => setSpotId(e.target.value as typeof spotId)}
                >
                  {VIRTUAL_RUN_SPOTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                      {participant.spots[s.id] === "approved" ? " · 완료" : ""}
                    </option>
                  ))}
                </select>
                <p className="form-row__hint">{spot.note}</p>
              </FormRow>
              <FormRow label="방문 날짜" required>
                <input
                  type="date"
                  name="visitDate"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  aria-invalid={Boolean(errors.visitDate)}
                />
                {errors.visitDate ? (
                  <p className="form-row__hint is-err" role="alert">
                    {errors.visitDate}
                  </p>
                ) : null}
              </FormRow>
              <VrFileField
                name="spotShot"
                label="거점 인증샷"
                required
                error={errors.spotShot}
              />
              <HashtagCopy text={SPOT_CERT_HASHTAGS} />
              <VrFileField
                name="instaShot"
                label="인스타 스크린샷"
                required
                error={errors.instaShot}
              />
              <FormRow label="인스타 링크" required>
                <input
                  type="url"
                  className="is-wide"
                  value={instaUrl}
                  onChange={(e) => setInstaUrl(e.target.value)}
                  aria-invalid={Boolean(errors.instaUrl)}
                />
                {errors.instaUrl ? (
                  <p className="form-row__hint is-err" role="alert">
                    {errors.instaUrl}
                  </p>
                ) : null}
              </FormRow>
            </FormSec>
            <button type="submit" className="btn btn--red">
              거점 인증 제출
            </button>
          </form>
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
