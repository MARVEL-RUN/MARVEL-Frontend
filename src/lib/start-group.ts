import type {
  RegistrationCategory,
  RegistrationStartGroup,
  StartGroupInput,
} from "@/services/main/types";

export type StartGroupDraft = {
  startGroupId: string;
  startGroupUnselected: boolean;
};

export const EMPTY_START_GROUP_DRAFT: StartGroupDraft = {
  startGroupId: "",
  startGroupUnselected: false,
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
