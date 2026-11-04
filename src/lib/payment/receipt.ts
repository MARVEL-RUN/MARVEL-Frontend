export function pickReceiptUrl(data: unknown): string {
  if (!data || typeof data !== "object" || Array.isArray(data)) return "";
  const root = data as Record<string, unknown>;
  const payload =
    root.data && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;
  const direct = payload.receiptUrl;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  const receipt = payload.receipt;
  if (typeof receipt === "string" && receipt.trim()) return receipt.trim();
  if (receipt && typeof receipt === "object" && !Array.isArray(receipt)) {
    const url = (receipt as Record<string, unknown>).url;
    if (typeof url === "string" && url.trim()) return url.trim();
  }
  return "";
}
