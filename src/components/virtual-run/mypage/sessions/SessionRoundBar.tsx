import { DEMO_SESSION_ROUNDS } from "@/lib/virtual-run/running-cert";

export function SessionRoundBar() {
  return (
    <ul className="vr-session-bar" aria-label="회차별 인증 상태">
      {DEMO_SESSION_ROUNDS.map((round) => (
        <li
          key={round.id}
          className={round.certified ? "vr-session-bar__item is-done" : "vr-session-bar__item"}
        >
          <span className="vr-session-bar__label">{round.label}</span>
          <span className="vr-session-bar__theme">{round.theme}</span>
          <span className="vr-session-bar__state">{round.certified ? "인증 완료" : "대기"}</span>
        </li>
      ))}
    </ul>
  );
}
