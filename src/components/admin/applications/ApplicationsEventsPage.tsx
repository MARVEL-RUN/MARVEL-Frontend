"use client";

import Link from "next/link";
import { ADMIN_RACE_EVENTS } from "@/lib/admin/raceEvents";

export function ApplicationsEventsPage() {
  return (
    <div className="admin-page">
      <section className="admin-table-shell">
        <div className="admin-table-shell__head">
          <h1>신청자관리</h1>
        </div>
        <p className="admin-apps-lead">관리할 대회를 선택하세요.</p>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>대회</th>
                <th>신청 유형</th>
                <th>접수 기간</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {ADMIN_RACE_EVENTS.map((event) => (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td>{event.summary}</td>
                  <td>{event.periodLabel}</td>
                  <td>
                    <Link
                      className="admin-btn admin-btn--primary"
                      href={`/admin/applications/${event.id}`}
                    >
                      신청자 관리
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
