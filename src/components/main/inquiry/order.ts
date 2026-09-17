export function inquiryUnlockKey(id: string) {
  return `mr-inquiry-unlock-${id}`;
}

function inquiryPasswordKey(id: string) {
  return `mr-inquiry-password-${id}`;
}

export function isInquiryUnlocked(id: string) {
  return (
    typeof window !== "undefined" &&
    sessionStorage.getItem(inquiryUnlockKey(id)) === "1"
  );
}

export function getInquiryPassword(id: string) {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(inquiryPasswordKey(id)) ?? "";
}

export function unlockInquiry(id: string, password = "") {
  sessionStorage.setItem(inquiryUnlockKey(id), "1");
  sessionStorage.setItem(inquiryPasswordKey(id), password);
}

export function clearInquirySession(id: string) {
  sessionStorage.removeItem(inquiryUnlockKey(id));
  sessionStorage.removeItem(inquiryPasswordKey(id));
}

export function inquiryDateParts(iso: string | null | undefined) {
  if (!iso) return { day: "-", time: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: iso, time: "" };
  const p = (n: number) => String(n).padStart(2, "0");
  return {
    day: `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`,
    time: `${p(d.getHours())}:${p(d.getMinutes())}`,
  };
}

export function formatInquiryDate(iso: string | null | undefined) {
  const { day, time } = inquiryDateParts(iso);
  return time ? `${day} ${time}` : day;
}

export function toDateTimeAttr(isoOrStamp: string) {
  if (isoOrStamp.includes("T")) return isoOrStamp;
  const [day, time] = isoOrStamp.split(" ");
  const isoDay = day.replaceAll(".", "-");
  return time ? `${isoDay}T${time}` : isoDay;
}
