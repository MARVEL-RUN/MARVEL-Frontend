import { OFFICE } from "@/lib/legal";
import Link from "next/link";

export function AdminFooter() {
  return (
    <footer className="admin-footer">
      <div className="admin-footer__inner">
        <p>
          <strong>{OFFICE.name}</strong>
          <span> · </span>
          {OFFICE.address}
        </p>
        <p>
          <Link href="/terms">이용약관</Link>
          <span> · </span>
          <Link href="/privacy">개인정보 처리방침</Link>
          <span> · </span>
          {OFFICE.copyright}
        </p>
      </div>
    </footer>
  );
}
