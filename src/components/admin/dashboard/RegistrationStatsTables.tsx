"use client";

import type {
  RegistrationStatistics,
  RegistrationStatRow,
} from "@/services/admin/stats";

type TableDef = {
  key: string;
  title: string;
  tone: "gender" | "age" | "child";
  rows: RegistrationStatRow[];
};

function courseKm(label: string) {
  const match = label.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function orderedCourses(headers: string[]) {
  return [...headers].sort((a, b) => courseKm(b) - courseKm(a));
}

function isTotalRow(classification: string) {
  return classification.includes("합계");
}

function num(value: number | null | undefined) {
  return (value ?? 0).toLocaleString();
}

function StatsTable({
  title,
  tone,
  courses,
  rows,
}: {
  title: string;
  tone: TableDef["tone"];
  courses: string[];
  rows: RegistrationStatRow[];
}) {
  return (
    <section className={`admin-reg-stats__group admin-reg-stats__group--${tone}`}>
      <div className="admin-reg-stats__group-head">
        <h3 className="admin-reg-stats__group-title">
          <span className="admin-reg-stats__group-mark" aria-hidden />
          {title}
        </h3>
      </div>
      <div className="admin-reg-stats__table-wrap">
        <table className="admin-table admin-reg-stats__table">
          <thead>
            <tr className="admin-reg-stats__group-row">
              <th className="is-name" rowSpan={2}>
                구분
              </th>
              <th
                className="is-group is-course is-section-start"
                colSpan={Math.max(courses.length, 1)}
              >
                코스별
              </th>
              <th className="is-group is-total is-section-start">합계</th>
              <th className="is-group is-pay is-section-start" colSpan={3}>
                결제수단
              </th>
              <th className="is-group is-kind is-section-start" colSpan={2}>
                접수유형
              </th>
            </tr>
            <tr className="admin-reg-stats__leaf-row">
              {courses.map((course, index) => (
                <th
                  key={course}
                  className={`is-num is-course${index === 0 ? " is-section-start" : ""}`}
                >
                  {course}
                </th>
              ))}
              <th className="is-num is-total is-section-start">인원</th>
              <th className="is-num is-pay is-section-start">카드</th>
              <th className="is-num is-pay">간편결제</th>
              <th className="is-num is-pay">미결제</th>
              <th className="is-num is-kind is-section-start">개인</th>
              <th className="is-num is-kind">단체</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.classification}
                className={isTotalRow(row.classification) ? "is-total" : undefined}
              >
                <td className="is-name">{row.classification}</td>
                {courses.map((course, index) => (
                  <td
                    key={course}
                    className={`is-num is-course${index === 0 ? " is-section-start" : ""}`}
                  >
                    {num(row.courseCounts[course] ?? 0)}
                  </td>
                ))}
                <td className="is-num is-total is-section-start">{num(row.totalCount)}</td>
                <td className="is-num is-pay is-section-start">{num(row.cardCount)}</td>
                <td className="is-num is-pay">{num(row.easyPayCount)}</td>
                <td className="is-num is-pay">{num(row.unpaidCount)}</td>
                <td className="is-num is-kind is-section-start">{num(row.personalCount)}</td>
                <td className="is-num is-kind">{num(row.groupCount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function RegistrationStatsTables({
  data,
  eventName,
}: {
  data: RegistrationStatistics;
  eventName?: string;
}) {
  const courses = orderedCourses(data.courseHeaders);
  const tables: TableDef[] = [
    { key: "gender", title: "성별 별", tone: "gender", rows: data.genderStats },
    { key: "age", title: "나이대 별", tone: "age", rows: data.ageGroupStats },
    { key: "child", title: "아동 유무 별", tone: "child", rows: data.childStats },
  ];

  return (
    <div className="admin-reg-stats">
      {eventName ? <p className="admin-reg-stats__event">{eventName}</p> : null}
      <div className="admin-reg-stats__groups">
        {tables.map((table) => (
          <StatsTable
            key={table.key}
            title={table.title}
            tone={table.tone}
            courses={courses}
            rows={table.rows}
          />
        ))}
      </div>
    </div>
  );
}
