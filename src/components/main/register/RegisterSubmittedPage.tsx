"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAppHref } from "@/lib/main/useAppBasePath";
import { scrollPageTop } from "@/lib/scroll-page";
import { SideBanner } from "../layout/SideBanner";

export function RegisterSubmittedPage() {
  const lookupHref = useAppHref("/lookup");
  const homeHref = useAppHref("/");

  useEffect(() => {
    scrollPageTop();
  }, []);

  return (
    <main className="page">
      <SideBanner kicker="ENTRY" title="참가신청" en="JOIN THE RUN" />
      <div className="page__body wrap">
        <section className="ticket ticket--done">
          <p className="kicker">APPLICATION COMPLETE</p>
          <h2>신청이 완료되었습니다</h2>
          <p className="ticket__meta">추후 신청조회를 통해 결제를 진행하세요.</p>
          <div className="flow__nav">
            <Link href={lookupHref} className="btn btn--red">
              신청조회
            </Link>
            <Link href={homeHref} className="btn btn--ghost">
              홈으로
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
