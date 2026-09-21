import type { CourseId, Gender } from "@/lib/register";

/** 목록 API 전까지 임시 매핑 (DB category-* ) */
const COURSE_TO_CATEGORY: Record<CourseId, string> = {
  "10k": "category-1",
  "5k": "category-2",
  "2.3k": "category-3",
};

export function eventCategoryIdForCourse(courseId: CourseId) {
  const id = COURSE_TO_CATEGORY[courseId];
  if (!id) throw new Error("지원하지 않는 참가종목입니다.");
  return id;
}

export function genderToApi(gender: Gender | ""): "M" | "F" {
  if (gender === "male") return "M";
  if (gender === "female") return "F";
  throw new Error("결제 신청에는 성별(남성/여성)이 필요합니다.");
}

export function phoneDigits(phone: string) {
  return phone.replace(/\D/g, "");
}

/** API는 yyyy-MM-dd. UI·검증은 yyyyMMdd */
export function birthToApi(ymd: string) {
  if (!/^\d{8}$/.test(ymd)) throw new Error("생년월일이 올바르지 않습니다.");
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}
