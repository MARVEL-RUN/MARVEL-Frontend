"use client";

import { NAVER_ANALYTICS_URL } from "@/lib/admin/analytics";
import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  cancelHref: string;
  gaRealtimeUrl?: string;
};

type GuideItem = {
  label: ReactNode;
  hint: string;
};

function GuideBlock({
  title,
  items,
}: {
  title: string;
  items: GuideItem[];
}) {
  return (
    <article className="admin-ops-guide__block">
      <h3>{title}</h3>
      <ul className="admin-ops-guide__list">
        {items.map((item, index) => (
          <li key={index} className="admin-ops-guide__item">
            <span className="admin-ops-guide__label">{item.label}</span>
            <span className="admin-ops-guide__hint">{item.hint}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function OpsGuide({ cancelHref, gaRealtimeUrl }: Props) {
  return (
    <section className="admin-dash__section">
      <h2>운영 가이드</h2>
      <p className="admin-ops-guide__lead">
        자주 쓰는 메뉴 위치와 확인 순서입니다.
      </p>

      <div className="admin-ops-guide">
        <GuideBlock
          title="일일 확인"
          items={[
            {
              label: <Link href="/admin/boards/inquiry">미답변 문의</Link>,
              hint: "게시판 → 문의사항",
            },
            {
              label: <Link href={cancelHref}>환불 대기</Link>,
              hint: "참가신청 → 환불 대기 상태",
            },
            {
              label: (
                <>
                  인원 점검 · <Link href="/admin/capacities">정원 현황</Link>
                </>
              ),
              hint: "위 접수 현황과 함께 확인",
            },
          ]}
        />

        <GuideBlock
          title="신청 · 단체"
          items={[
            {
              label: <Link href="/admin/applications">개인 신청</Link>,
              hint: "참가신청 → 대회 → 목록 → 상세",
            },
            {
              label: <Link href="/admin/members">단체 회원</Link>,
              hint: "단체회원 관리 → 단체 상세",
            },
            {
              label: (
                <>
                  비밀번호 초기화 · <Link href="/admin/admins">관리자</Link>
                </>
              ),
              hint: "개인: 신청 상세 / 단체: 단체 상세",
            },
          ]}
        />

        <GuideBlock
          title="콘텐츠 · 통계"
          items={[
            {
              label: (
                <>
                  <Link href="/admin/boards/notice">게시판</Link>
                  {" · "}
                  <Link href="/admin/content/popups">콘텐츠</Link>
                </>
              ),
              hint: "공지·FAQ / 팝업·약관",
            },
            {
              label: (
                <>
                  {gaRealtimeUrl ? (
                    <>
                      <a
                        href={gaRealtimeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GA 실시간
                      </a>
                      {" · "}
                    </>
                  ) : null}
                  <a
                    href={NAVER_ANALYTICS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    네이버 애널리틱스
                  </a>
                </>
              ),
              hint: "방문자·신청 추이 확인",
            },
          ]}
        />
      </div>
    </section>
  );
}
