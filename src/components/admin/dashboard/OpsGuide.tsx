"use client";

import { NAVER_ANALYTICS_URL } from "@/lib/admin/analytics";
import Link from "next/link";

type Props = {
  cancelHref: string;
  gaRealtimeUrl?: string;
};

export function OpsGuide({ cancelHref, gaRealtimeUrl }: Props) {
  return (
    <section className="admin-dash__section">
      <h2>운영 가이드</h2>
      <p className="admin-ops-guide__lead">
        대회 운영 때 자주 쓰는 위치와 확인 순서입니다.
      </p>

      <div className="admin-ops-guide">
        <article className="admin-ops-guide__block">
          <h3>일일 확인</h3>
          <ol>
            <li>
              <Link href="/admin/boards/inquiry">미답변 문의</Link>
              에 답변합니다.
            </li>
            <li>
              <Link href={cancelHref}>환불 대기</Link>
              신청을 확인·처리합니다.
            </li>
            <li>
              위 <strong>접수 현황</strong>과{" "}
              <Link href="/admin/capacities">정원 현황</Link>으로 인원을
              점검합니다.
            </li>
          </ol>
        </article>

        <article className="admin-ops-guide__block">
          <h3>신청 · 단체</h3>
          <ul>
            <li>
              개인 신청 조회·상세는{" "}
              <Link href="/admin/applications">참가신청</Link>에서 대회를 고른 뒤
              목록 → 상세로 들어갑니다.
            </li>
            <li>
              단체 대표·구성원은{" "}
              <Link href="/admin/members">단체회원 관리</Link> → 단체 상세에서
              봅니다.
            </li>
            <li>
              비밀번호 초기화: 개인은 신청 상세, 단체는 단체 상세, 관리자 계정은{" "}
              <Link href="/admin/admins">관리자 관리</Link>에서 처리합니다.
            </li>
          </ul>
        </article>

        <article className="admin-ops-guide__block">
          <h3>콘텐츠 · 통계</h3>
          <ul>
            <li>
              공지·문의·FAQ는 <Link href="/admin/boards/notice">게시판</Link>,
              팝업·약관은 <Link href="/admin/content/popups">콘텐츠</Link>{" "}
              메뉴를 사용합니다.
            </li>
            <li>
              방문자·신청 추이는 상단
              {gaRealtimeUrl ? (
                <>
                  {" "}
                  <a
                    href={gaRealtimeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GA 실시간
                  </a>
                  {" · "}
                </>
              ) : (
                " "
              )}
              <a
                href={NAVER_ANALYTICS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                네이버 애널리틱스
              </a>
              에서 확인합니다.
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
}
