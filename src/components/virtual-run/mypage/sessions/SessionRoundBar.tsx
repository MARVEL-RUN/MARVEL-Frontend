"use client";

import { roundStatusForParticipant } from "@/lib/virtual-run/participant";
import {
  VIRTUAL_RUN_ROUND_CERT_STATUS_LABEL,
  VIRTUAL_RUN_ROUNDS,
} from "@/lib/virtual-run/rounds";
import { useVirtualRunParticipantOrDemo } from "../../participant/VirtualRunParticipantProvider";

export function SessionRoundBar() {
  const { participant } = useVirtualRunParticipantOrDemo();

  return (
    <ul className="vr-session-bar" aria-label="회차별 인증 상태">
      {VIRTUAL_RUN_ROUNDS.map((round) => {
        const status = roundStatusForParticipant(participant, round.id);
        const done = status === "approved";
        const pending = status === "pending";
        return (
          <li
            key={round.id}
            className={[
              "vr-session-bar__item",
              `vr-session-bar__item--${round.accent}`,
              done ? "is-done" : "",
              pending ? "is-pending" : "",
              status === "rejected" ? "is-rejected" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="vr-session-bar__label">{round.label}</span>
            <span className="vr-session-bar__theme">{round.theme}</span>
            <span className="vr-session-bar__state">
              {VIRTUAL_RUN_ROUND_CERT_STATUS_LABEL[status]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
