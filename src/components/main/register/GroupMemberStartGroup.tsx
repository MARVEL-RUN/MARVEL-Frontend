import { findStartGroup, sortedStartGroups, type StartGroupDraft } from "@/lib/start-group";
import type { RegistrationCategory } from "@/services/main/types";

const DEFER_VALUE = "__defer";

type Props = {
  category: RegistrationCategory | undefined;
  categoryId: string;
  value: StartGroupDraft;
  onChange: (next: StartGroupDraft) => void;
  disabled?: boolean;
  namePrefix: string;
  storedCode?: string | null;
};

export function GroupMemberStartGroup({
  category,
  categoryId,
  value,
  onChange,
  disabled,
  namePrefix,
  storedCode,
}: Props) {
  const groups = categoryId ? sortedStartGroups(category) : [];
  const selectId = `${namePrefix}-start-group`;
  const hintId = `${namePrefix}-start-group-hint`;
  // 종목을 바꾸면 그룹이 비워지므로, 선택지에 없는 ID는 비활성된 저장값뿐
  const storedMissing =
    groups.length > 0 &&
    !value.startGroupUnselected &&
    Boolean(value.startGroupId) &&
    !findStartGroup(category, value.startGroupId);
  const placeholder = !categoryId
    ? "참가종목을 먼저 선택하세요"
    : groups.length
      ? "출발 그룹"
      : "선택 가능한 출발 그룹이 없습니다";
  const code = storedCode?.trim();

  return (
    <div className="party-start-group">
      <label className="party-start-group__label" htmlFor={selectId}>
        출발 그룹
      </label>
      <select
        id={selectId}
        value={
          value.startGroupUnselected ? DEFER_VALUE : storedMissing ? "" : value.startGroupId
        }
        disabled={disabled || !groups.length}
        aria-invalid={storedMissing || undefined}
        aria-describedby={storedMissing ? hintId : undefined}
        onChange={(e) => {
          const next = e.target.value;
          if (next === DEFER_VALUE) {
            onChange({ startGroupId: "", startGroupUnselected: true });
            return;
          }
          onChange({ startGroupId: next, startGroupUnselected: false });
        }}
      >
        <option value="">{placeholder}</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.code}그룹 · {group.description}
          </option>
        ))}
        {groups.length ? (
          <option value={DEFER_VALUE}>
            A, B 그룹을 잘 모르겠어요 (후미 출발 그룹으로 배정)
          </option>
        ) : null}
      </select>
      {storedMissing ? (
        <p id={hintId} className="party-start-group__hint" role="status">
          기존 {code ? `${code}그룹` : "출발 그룹"}은 지금 선택할 수 없습니다. 다시 선택해
          주세요.
        </p>
      ) : null}
    </div>
  );
}
