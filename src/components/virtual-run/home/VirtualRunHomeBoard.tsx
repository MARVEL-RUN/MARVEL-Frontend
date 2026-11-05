"use client";

import { VIRTUAL_RUN_EVENT_ID } from "@/lib/main/config";
import { VIRTUAL_RUN_FAQS } from "@/lib/virtual-run/guide";
import { VIRTUAL_RUN_HOME_NOTICES } from "@/lib/virtual-run/notices";
import {
  getPublicNoticeDetail,
  listPublicNotices,
  mergeNoticeList,
} from "@/services/main/notices";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BoardFold, type BoardFoldItem } from "../../main/board/BoardFold";
import { BoardSwitch, type BoardTabId } from "../../main/board/BoardSwitch";
import { VrLink } from "../layout/VrLink";

const HOME_LIMIT = 5;

function fallbackNotices(): BoardFoldItem[] {
  return VIRTUAL_RUN_HOME_NOTICES.slice(0, HOME_LIMIT).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
  }));
}

function fallbackFaqs(): BoardFoldItem[] {
  return VIRTUAL_RUN_FAQS.slice(0, HOME_LIMIT).map((row, index) => ({
    id: `vr-faq-${index}`,
    title: row.q,
    body: row.a,
  }));
}

async function withNoticeBodies(rows: BoardFoldItem[]) {
  return Promise.all(
    rows.map(async (row) => {
      try {
        const detail = await getPublicNoticeDetail(row.id);
        return { ...row, body: detail.content ?? "" };
      } catch {
        return { ...row, body: "" };
      }
    }),
  );
}

export function VirtualRunHomeBoard() {
  const [tab, setTab] = useState<BoardTabId>("notices");
  const [notices, setNotices] = useState<BoardFoldItem[]>([]);
  const faqs = useMemo(() => fallbackFaqs(), []);

  const loadNoticeBody = useCallback((id: string) => {
    if (id.startsWith("vr-home-notice-")) return;
    void getPublicNoticeDetail(id)
      .then((detail) => {
        setNotices((rows) =>
          rows.map((row) =>
            row.id === id ? { ...row, body: detail.content ?? "" } : row,
          ),
        );
      })
      .catch(() => {
        setNotices((rows) =>
          rows.map((row) => (row.id === id ? { ...row, body: "" } : row)),
        );
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    void listPublicNotices({
      eventId: VIRTUAL_RUN_EVENT_ID || undefined,
      page: 0,
      size: HOME_LIMIT,
      limit: HOME_LIMIT,
      sort: "LATEST",
    })
      .then(async (result) => {
        const rows = mergeNoticeList(
          result.pinnedNoticeList,
          result.noticePage.content ?? [],
        ).map((row) => ({
          id: row.id,
          title: row.title,
        }));
        if (cancelled) return;
        if (rows.length === 0) {
          setNotices(fallbackNotices());
          return;
        }
        setNotices(rows);
        const filled = await withNoticeBodies(rows);
        if (!cancelled) setNotices(filled);
      })
      .catch(() => {
        if (!cancelled) setNotices(fallbackNotices());
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const items = tab === "notices" ? notices : faqs;
  const empty =
    tab === "notices" ? "등록된 공지가 없습니다." : "등록된 FAQ가 없습니다.";

  return (
    <section className="sec board-sec vr-home__board" id="bulletin">
      <div className="wrap reveal">
        <p className="kicker">04 / BULLETIN</p>
        <h2 className="sec__title">
          {tab === "notices" ? (
            <>
              공식 <em>공지</em>
            </>
          ) : (
            <>
              자주 묻는 <em>질문</em>
            </>
          )}
        </h2>
        <BoardSwitch active={tab} onSelect={setTab} />
        <BoardFold
          key={tab}
          items={items}
          empty={empty}
          mark={tab === "faq" ? "Q." : undefined}
          onExpand={tab === "notices" ? loadNoticeBody : undefined}
        />
        <p className="vr-home__board-more">
          {tab === "notices" ? (
            <VrLink href="/notices">공지사항 전체 보기</VrLink>
          ) : (
            <VrLink href="/guide/faq">FAQ 전체 보기</VrLink>
          )}
        </p>
      </div>
    </section>
  );
}
