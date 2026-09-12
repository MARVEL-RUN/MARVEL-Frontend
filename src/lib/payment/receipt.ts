import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { formatFee } from "@/lib/register";

export type ReceiptFile = {
  orderId: string;
  orderName: string;
  paidAmount: number;
  approvedAt?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function receiptMarkup(data: ReceiptFile) {
  const paid = data.paidAmount ? formatFee(data.paidAmount) : "-";
  const when = data.approvedAt
    ? new Date(data.approvedAt).toLocaleString("ko-KR")
    : "-";
  return `
    <p style="margin:0 0 4px;font-size:11px;font-weight:800;letter-spacing:.16em;color:#e62429;">RECEIPT</p>
    <h1 style="margin:0 0 4px;font-size:22px;">결제 영수증</h1>
    <p style="margin:0 0 20px;color:#555;">MARVEL RUN 2026 KOREA</p>
    <dl style="display:grid;grid-template-columns:7rem 1fr;gap:10px 14px;margin:0;">
      <dt style="color:#666;">주문명</dt><dd style="margin:0;font-weight:700;">${escapeHtml(data.orderName || "-")}</dd>
      <dt style="color:#666;">주문번호</dt><dd style="margin:0;font-weight:700;">${escapeHtml(data.orderId || "-")}</dd>
      <dt style="color:#666;">결제금액</dt><dd style="margin:0;font-weight:700;">${escapeHtml(paid)}</dd>
      <dt style="color:#666;">승인일시</dt><dd style="margin:0;font-weight:700;">${escapeHtml(when)}</dd>
    </dl>
  `;
}

export async function downloadReceipt(data: ReceiptFile) {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = [
    "position:fixed",
    "left:-9999px",
    "top:0",
    "width:360px",
    "box-sizing:border-box",
    "padding:28px 24px",
    "background:#fff",
    "color:#191919",
    "font:15px/1.5 system-ui,sans-serif",
  ].join(";");
  host.innerHTML = receiptMarkup(data);
  document.body.appendChild(host);

  try {
    const canvas = await html2canvas(host, {
      scale: 2,
      backgroundColor: "#ffffff",
    });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "mm", format: "a5", orientation: "portrait" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;
    const ratio = canvas.height / canvas.width;
    let w = maxW;
    let h = w * ratio;
    if (h > maxH) {
      h = maxH;
      w = h / ratio;
    }
    pdf.addImage(img, "PNG", (pageW - w) / 2, margin, w, h);
    pdf.save(`marvelrun-receipt${data.orderId ? `-${data.orderId}` : ""}.pdf`);
  } finally {
    host.remove();
  }
}
