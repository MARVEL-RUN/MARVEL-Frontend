import type { Gender } from "@/lib/register";

export const API_GENDERS = ["M", "F"] as const;

export type ApiGender = (typeof API_GENDERS)[number];

export function uiGenderFromApi(value?: string | null): Exclude<Gender, "none"> | undefined {
  const key = (value ?? "").trim().toUpperCase();
  if (key === "M" || key === "MALE" || key === "남" || key === "남성") return "male";
  if (key === "F" || key === "FEMALE" || key === "여" || key === "여성") return "female";
  return undefined;
}

export function genderLabel(gender?: Exclude<Gender, "none"> | ApiGender | string | null) {
  const ui = typeof gender === "string" ? uiGenderFromApi(gender) : gender;
  if (ui === "male") return "남성";
  if (ui === "female") return "여성";
  return "-";
}

export function toApiGender(raw?: string | null): ApiGender | "" {
  const key = (raw ?? "").trim().toUpperCase();
  if (key === "M" || key === "MALE" || key === "남" || key === "남성") return "M";
  if (key === "F" || key === "FEMALE" || key === "여" || key === "여성") return "F";
  return "";
}
