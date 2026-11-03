"use client";

import { roundStatusForParticipant } from "@/lib/virtual-run/participant";
import { VIRTUAL_RUN_ROUND_CERT_STATUS_LABEL, VIRTUAL_RUN_ROUNDS } from "@/lib/virtual-run/rounds";
import { VIRTUAL_RUN_ROUND_STATUS_TONE } from "@/lib/virtual-run/status";
import { useVirtualRunParticipantOrDemo } from "../../participant/VirtualRunParticipantProvider";
import { VrStatus } from "../VrStatus";

export function SessionRoundBar() {
  const { participant } = useVirtualRunParticipantOrDemo();

  return (
    <ul className="vr-round-tiles" aria-label="회차별 인증 상태">
      {VIRTUAL_RUN_ROUNDS.map((round) => {
        const status = roundStatusForParticipant(participant, round.id);
        return (
          <li key={round.id} className={`vr-round-tile is-${round.accent}${status === "locked" ? " is-off" : ""}`}>
            <span className="vr-round-tile__no">{String(round.order).padStart(2, "0")}</span>
            <span className="vr-round-tile__body">
              <span className="vr-round-tile__code">{round.code}</span>
              <strong>{round.theme}</strong>
            </span>
            <VrStatus tone={VIRTUAL_RUN_ROUND_STATUS_TONE[status]}>
              {VIRTUAL_RUN_ROUND_CERT_STATUS_LABEL[status]}
            </VrStatus>
          </li>
        );
      })}
    </ul>
  );
}
