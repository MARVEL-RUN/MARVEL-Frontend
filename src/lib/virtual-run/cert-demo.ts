import type { VirtualRunParticipant, VirtualRunRunSummary } from "./participant";
import { defaultParticipant } from "./participant";
import { virtualRunRoundById, type VirtualRunRoundId } from "./rounds";
import { virtualRunDemoEnabled } from "./site";

export function demoInstantApproveRunning(
  p: VirtualRunParticipant,
  roundId: VirtualRunRoundId,
  summary: VirtualRunRunSummary,
): VirtualRunParticipant {
  if (!virtualRunDemoEnabled) return p;
  const rewards = [...p.rewards];
  const id = `rw-run-${roundId}-${Date.now()}`;
  if (!rewards.some((r) => r.id === id)) {
    rewards.unshift({
      id,
      kind: "gifticon",
      label: `${virtualRunRoundById(roundId).label} 완주 기프티콘`,
      status: "sent",
      detail: "러닝 인증 승인 즉시 발송",
    });
  }
  return {
    ...p,
    rewards,
    rounds: {
      ...p.rounds,
      [roundId]: {
        status: "approved",
        resubmitCount: p.rounds[roundId]?.resubmitCount ?? 0,
        summary,
      },
    },
  };
}

export function demoInstantApproveKit(p: VirtualRunParticipant): VirtualRunParticipant {
  if (!virtualRunDemoEnabled) return p;
  const rewards = [...p.rewards];
  rewards.unshift({
    id: `rw-kit-${Date.now()}`,
    kind: "sponsor",
    label: "키트 인증 경품",
    status: "queued",
    detail: "협업사 확정 후 발송",
  });
  return {
    ...p,
    kitCert: "approved",
    rewards,
  };
}

export function demoInstantApproveSpot(
  p: VirtualRunParticipant,
  spotId: string,
  spotLabel: string,
): VirtualRunParticipant {
  if (!virtualRunDemoEnabled) return p;
  const rewards = [...p.rewards];
  rewards.unshift({
    id: `rw-spot-${spotId}-${Date.now()}`,
    kind: "coupon",
    label: `${spotLabel} 쿠폰`,
    status: "sent",
    detail: "협력사 쿠폰 코드 문자 발송",
  });
  return {
    ...p,
    spots: { ...p.spots, [spotId]: "approved" },
    rewards,
  };
}

export function demoTicketPurchase(
  p: VirtualRunParticipant | null,
  ownedRoundIds: VirtualRunRoundId[],
  shipping: { name: string; phone: string },
): VirtualRunParticipant {
  const base =
    p ??
    defaultParticipant({
      name: shipping.name,
      bib: String(600000 + Math.floor(Math.random() * 8999)),
      phone: shipping.phone,
      ownedRoundIds: [],
      kitShipping: "preparing",
      kitCert: "none",
      rewards: [],
      rounds: {
        avengers: { status: "locked", resubmitCount: 0 },
        "x-men": { status: "locked", resubmitCount: 0 },
        "fantastic-four": { status: "locked", resubmitCount: 0 },
      },
    });

  const rounds = { ...base.rounds };
  for (const id of ownedRoundIds) {
    if (rounds[id]?.status === "locked" || !rounds[id]) {
      rounds[id] = { status: "ready", resubmitCount: 0 };
    }
  }

  return {
    ...base,
    name: shipping.name,
    phone: shipping.phone,
    ownedRoundIds: [...new Set([...base.ownedRoundIds, ...ownedRoundIds])],
    kitShipping: "preparing",
    trackingNo: undefined,
    rounds,
  };
}
