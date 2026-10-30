import {
  VIRTUAL_RUN_TIMELINE,
  VIRTUAL_RUN_TIMELINE_DISCLAIMER,
} from "@/lib/virtual-run/event";

export function VirtualRunTimeline() {
  return (
    <div className="time-table-wrap">
      <table className="time-table">
        <thead>
          <tr>
            <th>시간</th>
            <th className="time-table__rt">RT</th>
            <th>프로그램</th>
            <th className="time-table__note">비고</th>
          </tr>
        </thead>
        <tbody>
          {VIRTUAL_RUN_TIMELINE.map((row) => (
            <tr key={`${row.from}-${row.to}-${row.program}`}>
              <td>
                <span className="time-table__clock">
                  <span className="time-table__from">{row.from}</span>
                  {row.to ? (
                    <>
                      <span className="time-table__dash">–</span>
                      <span className="time-table__to">{row.to}</span>
                    </>
                  ) : null}
                </span>
              </td>
              <td className="time-table__rt">{row.rt}</td>
              <td>{row.program}</td>
              <td className="time-table__note">{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="time-table__disclaimer">{VIRTUAL_RUN_TIMELINE_DISCLAIMER}</p>
    </div>
  );
}
