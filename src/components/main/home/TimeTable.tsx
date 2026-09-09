import { EVENT } from "@/lib/event";

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
          {EVENT.timeline.map((row) => (
            <tr key={`${row.time}-${row.program}`}>
              <td>{row.time}</td>
              <td>{row.rt}</td>
              <td className={"hl" in row && row.hl ? "is-hl" : undefined}>
                {row.program}
              </td>
              <td>{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
