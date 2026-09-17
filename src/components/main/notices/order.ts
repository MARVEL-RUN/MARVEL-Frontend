export function noticeDateParts(iso: string | null | undefined) {
  if (!iso) return { day: "-", time: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: iso, time: "" };
  const p = (n: number) => String(n).padStart(2, "0");
  return {
    day: `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`,
    time: `${p(d.getHours())}:${p(d.getMinutes())}`,
  };
}

export function formatNoticeDate(iso: string | null | undefined) {
  const { day, time } = noticeDateParts(iso);
  return time ? `${day} ${time}` : day;
}

export function toDateTimeAttr(isoOrStamp: string) {
  if (isoOrStamp.includes("T")) return isoOrStamp;
  const [day, time] = isoOrStamp.split(" ");
  const isoDay = day.replaceAll(".", "-");
  return time ? `${isoDay}T${time}` : isoDay;
}

export function fileNameFromUrl(url: string) {
  try {
    const path = new URL(url, "https://local.invalid").pathname;
    const name = decodeURIComponent(path.split("/").filter(Boolean).pop() ?? "");
    return name || url;
  } catch {
    return url;
  }
}
