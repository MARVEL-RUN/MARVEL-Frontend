"use client";

import Link from "next/link";
import { useAppBasePath } from "@/lib/main/useAppBasePath";
import { withAppBase } from "@/lib/preview";
import { SheetModal } from "../SheetModal";

export function RegisterDiscountFallback({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  const base = useAppBasePath();

  if (!open) return null;

  return (
    <SheetModal onClose={onClose} title="할인 링크 접수 불가">
      <p>
        {message || "할인 링크 조건에 맞지 않아 접수를 진행할 수 없습니다."}
      </p>
      <div className="flow__nav">
        <Link className="btn btn--red" href={withAppBase(base, "/")} onClick={onClose}>
          대회 메인으로 이동
        </Link>
        <Link
          className="btn btn--ghost"
          href={withAppBase(base, "/register")}
          onClick={onClose}
        >
          일반 참가신청으로 이동
        </Link>
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          닫기
        </button>
      </div>
    </SheetModal>
  );
}
