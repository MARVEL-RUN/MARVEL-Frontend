import {
  VIRTUAL_RUN_TIMELINE,
  VIRTUAL_RUN_TIMELINE_DISCLAIMER,
} from "@/lib/virtual-run/event";

export function VirtualRunTimeline() {
  return (
    <div className="vr-timeline">
      <ul className="timeline">
        {VIRTUAL_RUN_TIMELINE.map((row) => (
          <li key={`${row.date}-${row.label}`}>
            <time dateTime={row.dateTime}>{row.date}</time>
            <span>{row.label}</span>
          </li>
        ))}
      </ul>
      <p className="vr-timeline__note">{VIRTUAL_RUN_TIMELINE_DISCLAIMER}</p>
    </div>
  );
}
