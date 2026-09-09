import { EVENT } from "@/lib/event";

const MARK_CLASS = {
  gate: "time-table__gate",
  "10k": "time-mark time-mark--cyan",
  "5k": "time-mark time-mark--red",
  "2.3k": "time-mark time-mark--gold",
} as const;

export function TimeTable() {
  return (
    <div className="time-table-wrap">
      <table className="time-table">
        <thead>
          <tr>
            <th>시간</th>
            <th>RT</th>
            <th>프로그램</th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          {EVENT.timeline.map((row) => {
            const mark =
              "mark" in row ? MARK_CLASS[row.mark] : undefined;
            return (
              <tr key={`${row.from}-${row.to}-${row.program}`}>
                <td>
                  <span className="time-table__clock">
                    <span className="time-table__from">{row.from}</span>
                    <span className="time-table__dash">–</span>
                    <span className="time-table__to">{row.to}</span>
                  </span>
                </td>
                <td>{row.rt}</td>
                <td>
                  {mark ? (
                    "mark" in row && row.mark === "gate" ? (
                      <span className={mark}>{row.program}</span>
                    ) : (
                      <mark className={mark}>{row.program}</mark>
                    )
                  ) : (
                    row.program
                  )}
                </td>
                <td>{row.note}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
