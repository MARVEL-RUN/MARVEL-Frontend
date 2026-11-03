import {
  VIRTUAL_RUN_TIMELINE,
  VIRTUAL_RUN_TIMELINE_DISCLAIMER,
} from "@/lib/virtual-run/event";

export function VirtualRunTimeline() {
  return (
    <div className="time-table-wrap vr-time-table">
      <table className="time-table">
        <thead>
          <tr>
            <th>날짜</th>
            <th>일정</th>
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
              <td>
                {row.key ? <span className="time-table__gate">{row.program}</span> : row.program}
                {row.note ? <small className="vr-time-table__sub">{row.note}</small> : null}
              </td>
              <td className="time-table__note">{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="time-table__disclaimer">{VIRTUAL_RUN_TIMELINE_DISCLAIMER}</p>
    </div>
  );
}
