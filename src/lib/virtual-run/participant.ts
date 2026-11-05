import type { VirtualRunRoundCertStatus, VirtualRunRoundId } from "./rounds";

export type KitShippingStatus = "preparing" | "shipping" | "delivered";

export type KitCertStatus = "none" | "pending" | "approved" | "rejected";

export type SpotCertStatus = "none" | "pending" | "approved" | "rejected";

export type VirtualRunRunSummary = {
  runDate: string;
  distanceKm: number;
  durationLabel: string;
  paceLabel: string | null;
};

export type VirtualRunRoundProgress = {
  status: VirtualRunRoundCertStatus;
  rejectReason?: string;
  resubmitCount: number;
  summary?: VirtualRunRunSummary;
};

export type VirtualRunRewardRow = {
  id: string;
  kind: "gifticon" | "coupon" | "sponsor";
  label: string;
  status: "sent" | "failed" | "queued";
  detail?: string;
};

export type VirtualRunParticipant = {
  name: string;
  bib: string;
  phone: string;
  /** 신청 조회 응답의 종목명. 차수는 조회에 아직 없다 */
  categoryName?: string;
  ownedRoundIds: VirtualRunRoundId[];
  kitShipping: KitShippingStatus;
  trackingNo?: string;
  kitCert: KitCertStatus;
  kitRejectReason?: string;
  kitResubmitCount: number;
  rounds: Record<VirtualRunRoundId, VirtualRunRoundProgress>;
  spots: Record<string, SpotCertStatus>;
  rewards: VirtualRunRewardRow[];
};

export const VR_PARTICIPANT_STORAGE_KEY = "marvel-run:vr-participant-v2";

export function defaultParticipant(partial?: Partial<VirtualRunParticipant>): VirtualRunParticipant {
  const owned: VirtualRunRoundId[] = partial?.ownedRoundIds ?? [
    "avengers",
    "x-men",
    "fantastic-four",
  ];
  const baseRound = (status: VirtualRunRoundCertStatus): VirtualRunRoundProgress => ({
    status,
    resubmitCount: 0,
  });
  return {
    name: partial?.name ?? "김마블",
    bib: partial?.bib ?? "602601",
    phone: partial?.phone ?? "01000000000",
    ownedRoundIds: owned,
    kitShipping: partial?.kitShipping ?? "delivered",
    trackingNo: partial?.trackingNo ?? "123456789012",
    kitCert: partial?.kitCert ?? "none",
    kitResubmitCount: partial?.kitResubmitCount ?? 0,
    rounds: partial?.rounds ?? {
      avengers: {
        status: "approved",
        resubmitCount: 0,
        summary: {
          runDate: "2026-12-01",
          distanceKm: 5.02,
          durationLabel: "0:32:15",
          paceLabel: "6'25\" / km",
        },
      },
      "x-men": baseRound("ready"),
      "fantastic-four": baseRound("ready"),
    },
    spots: partial?.spots ?? {},
    rewards: partial?.rewards ?? [],
    categoryName: partial?.categoryName,
  };
}

/** 신청 조회로 연 로그인. 배번·차수는 조회 응답에 없으므로 비운다 */
export function participantFromLookup(input: {
  name: string;
  phone: string;
  categoryName?: string | null;
}): VirtualRunParticipant {
  const ready = { status: "ready" as const, resubmitCount: 0 };
  const next = defaultParticipant({
    name: input.name,
    phone: input.phone,
    bib: "",
    categoryName: input.categoryName?.trim() || undefined,
    ownedRoundIds: [],
    kitShipping: "preparing",
    kitCert: "none",
    kitResubmitCount: 0,
    spots: {},
    rewards: [],
    rounds: {
      avengers: ready,
      "x-men": ready,
      "fantastic-four": ready,
    },
  });
  delete next.trackingNo;
  return next;
}

export function roundStatusForParticipant(
  p: VirtualRunParticipant,
  roundId: VirtualRunRoundId,
): VirtualRunRoundCertStatus {
  const owned = p.ownedRoundIds.includes(roundId);
  if (!owned) return "locked";
  return p.rounds[roundId]?.status ?? "ready";
}

export function combinedMedalCount(p: VirtualRunParticipant): number {
  return p.ownedRoundIds.filter((id) => p.rounds[id]?.status === "approved").length;
}
