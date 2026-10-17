function asText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

export function referenceFilterDisplay(raw: unknown) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return "";
  const row = raw as Record<string, unknown>;
  return asText(row.displayName) || asText(row.code);
}
