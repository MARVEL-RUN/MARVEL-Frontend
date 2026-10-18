import type {
  RegistrationCategory,
  RegistrationStartGroup,
  StartGroupInput,
} from "@/services/main/types";
import { categoryLabel, sortedCategories } from "./registration-options";

/** 출발 그룹 선택·표기·수정 UI. `1`일 때만 켬 */
export const hasStartGroupFeature =
  process.env.NEXT_PUBLIC_START_GROUP === "1";

export type StartGroupPreviewSection = {
  key: string;
  title: string;
  groups: RegistrationStartGroup[];
};

/** 종목별 출발 그룹 — 미선택 시 미리보기용 */
export function startGroupPreviewSections(categories: RegistrationCategory[]) {
  return sortedCategories(categories)
    .map((category) => ({
      key: category.categoryId,
      title: categoryLabel(category),
      groups: sortedStartGroups(category),
    }))
    .filter((section) => section.groups.length > 0);
}

export type StartGroupDraft = {
  startGroupId: string;
  startGroupUnselected: boolean;
};

export const EMPTY_START_GROUP_DRAFT: StartGroupDraft = {
  startGroupId: "",
  startGroupUnselected: false,
};

/** 종목 변경·UI 꺼짐 등 — API 미선택(후미) */
export const UNSELECTED_START_GROUP_INPUT: StartGroupInput = {
  startGroupId: null,
  startGroupUnselected: true,
};

export const UNSELECTED_START_GROUP_DRAFT: StartGroupDraft = {
  startGroupId: "",
  startGroupUnselected: true,
};

export function sortedStartGroups(
  category: RegistrationCategory | undefined,
): RegistrationStartGroup[] {
  return [...(category?.startGroups ?? [])];
}

export function findStartGroup(
  category: RegistrationCategory | undefined,
  groupId: string,
) {
  const key = groupId.trim();
  if (!key) return undefined;
  return category?.startGroups?.find((item) => item.id === key);
}

export function startGroupLabel(
  code: string | null | undefined,
  unselected: boolean | undefined,
) {
  if (unselected) return "미선택(후미 배정)";
  const text = (code ?? "").trim();
  return text || "—";
}

/** 신청·일반 수정 요청용 그룹 필드 */
export function startGroupInputFromDraft(draft: StartGroupDraft): StartGroupInput {
  if (draft.startGroupUnselected) {
    return { startGroupId: null, startGroupUnselected: true };
  }
  return {
    startGroupId: draft.startGroupId.trim(),
    startGroupUnselected: false,
  };
}

/** 신규 신청·결제 — UI 꺼져 있으면 미선택(후미)으로 전송 */
export function startGroupInputForCreate(draft: StartGroupDraft): StartGroupInput {
  if (!hasStartGroupFeature) {
    return { startGroupId: null, startGroupUnselected: true };
  }
  return startGroupInputFromDraft(draft);
}

/** 조회 수정 — UI 꺼져 있으면 미선택(후미) */
export function startGroupInputForModify(
  draft: StartGroupDraft,
  _storedId?: string | null,
  _storedUnselected?: boolean,
): StartGroupInput {
  if (!hasStartGroupFeature) {
    return UNSELECTED_START_GROUP_INPUT;
  }
  if (!draft.startGroupUnselected && !draft.startGroupId.trim()) {
    return UNSELECTED_START_GROUP_INPUT;
  }
  return startGroupInputFromDraft(draft);
}

/** 단체 조회 수정 registrations[] */
export function startGroupInputForOrganizationLookupModify(row: {
  startGroupId?: string | null;
  startGroupUnselected?: boolean;
}): StartGroupInput {
  if (!hasStartGroupFeature) {
    return UNSELECTED_START_GROUP_INPUT;
  }
  if (row.startGroupUnselected === true) {
    return UNSELECTED_START_GROUP_INPUT;
  }
  const id = (row.startGroupId ?? "").trim();
  if (!id) {
    return UNSELECTED_START_GROUP_INPUT;
  }
  return { startGroupId: id, startGroupUnselected: false };
}

/** lookup·수정 요청에 조회값 그대로 실을 때 */
export function startGroupInputFromStored(
  startGroupId?: string | null,
  startGroupUnselected?: boolean,
): StartGroupInput {
  return startGroupInputFromDraft(
    startGroupDraftFromStored(startGroupId, startGroupUnselected),
  );
}

export function startGroupDraftFromStored(
  startGroupId: string | null | undefined,
  startGroupUnselected: boolean | undefined,
): StartGroupDraft {
  if (startGroupUnselected === true) {
    return { startGroupId: "", startGroupUnselected: true };
  }
  return {
    startGroupId: (startGroupId ?? "").trim(),
    startGroupUnselected: false,
  };
}

export function startGroupDraftError(
  draft: StartGroupDraft,
  category: RegistrationCategory | undefined,
): string | null {
  if (!hasStartGroupFeature) return null;
  const groups = sortedStartGroups(category);
  if (!groups.length) {
    return "출발 그룹 선택지를 불러오지 못했습니다.";
  }
  if (draft.startGroupUnselected) return null;
  const id = draft.startGroupId.trim();
  if (!id) return "출발 그룹을 선택하세요.";
  if (!findStartGroup(category, id)) {
    return "선택한 출발 그룹을 다시 확인해 주세요.";
  }
  return null;
}

export function storedStartGroupMissingFromOptions(
  startGroupId: string | null | undefined,
  category: RegistrationCategory | undefined,
) {
  const id = (startGroupId ?? "").trim();
  if (!id) return false;
  return !findStartGroup(category, id);
}

export function startGroupSummary(
  draft: StartGroupDraft,
  category: RegistrationCategory | undefined,
) {
  if (draft.startGroupUnselected) {
    return startGroupLabel(null, true);
  }
  const group = findStartGroup(category, draft.startGroupId);
  if (group) return group.code;
  const id = draft.startGroupId.trim();
  return id || "—";
}

export function startGroupDisplayFromLookup(
  startGroupCode?: string | null,
  startGroupUnselected?: boolean,
) {
  if (startGroupUnselected === true) return startGroupLabel(null, true);
  const code = (startGroupCode ?? "").trim();
  return code || "—";
}

export function startGroupSelectionChanged(
  stored: StartGroupInput,
  draft: StartGroupDraft,
) {
  const next = startGroupInputFromDraft(draft);
  return (
    stored.startGroupUnselected !== next.startGroupUnselected ||
    (stored.startGroupId ?? "") !== (next.startGroupId ?? "")
  );
}

/** API description — 「예상 완주 …」 구간과 나머지(페이스) 분리 */
export function startGroupDescriptionParts(description: string) {
  const text = description.trim();
  if (!text) return { finish: "", pace: "" };
  const parts = text.split(/\s*·\s*/);
  const finish = parts[0]?.trim() ?? "";
  const pace = parts.slice(1).join(" · ").trim();
  if (/^예상\s+완주/i.test(finish)) {
    return { finish, pace };
  }
  return { finish: text, pace: "" };
}
