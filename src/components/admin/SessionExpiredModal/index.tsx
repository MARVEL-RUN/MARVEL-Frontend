"use client";

import { adminLoginHref, onSessionExpired, resetSessionExpired } from "@/lib/admin/session";
import { adminToken } from "@/lib/admin/token";
import { useAdminAuthStore } from "@/stores";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";

const PREVIEW_PARAM = "session-expired";

export function AdminSessionExpiredModal() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const labelId = useId();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("preview") === PREVIEW_PARAM) {
      setPreview(true);
      setOpen(true);
    }
    return onSessionExpired(() => setOpen(true));
  }, []);

  if (!open) return null;

  const goLogin = () => {
    setOpen(false);
    resetSessionExpired();

    // 미리보기는 세션을 지우지 않고 창만 닫음
    if (preview) {
      setPreview(false);
      const url = new URL(window.location.href);
      url.searchParams.delete("preview");
      router.replace(`${url.pathname}${url.search}`);
      return;
    }

    const href = adminLoginHref();
    adminToken.clear();
    useAdminAuthStore.getState().logout();
    queryClient.clear();
    router.replace(href);
  };

  return (
    <div className="admin-overlay admin-overlay--session">
      <div
        className="admin-overlay__box admin-session-expired"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={labelId}
      >
        <h2 id={labelId}>로그인이 만료되었습니다</h2>
        <p>
          로그인 유지 시간이 지나 정보를 불러오지 못했습니다.
          <br />
          다시 로그인하면 보던 화면으로 돌아옵니다.
        </p>
        <button type="button" className="admin-btn admin-btn--primary" onClick={goLogin} autoFocus>
          다시 로그인
        </button>
      </div>
    </div>
  );
}
