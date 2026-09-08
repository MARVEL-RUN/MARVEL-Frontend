import { OFFICE } from "@/lib/legal";
import Link from "next/link";

export function AdminFooter() {
  return (
    <footer className="admin-footer">
      <div className="admin-footer__inner">
        <div>
          <strong>{OFFICE.name}</strong>
          <p style={{ margin: "6px 0 0" }}>
            {OFFICE.address} · Tel {OFFICE.tel}
          </p>
        </div>
        <div>
          <Link href="/terms">이용약관</Link>
          <span aria-hidden> · </span>
          <Link href="/privacy">개인정보 처리방침</Link>
          <p style={{ margin: "6px 0 0" }}>{OFFICE.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
