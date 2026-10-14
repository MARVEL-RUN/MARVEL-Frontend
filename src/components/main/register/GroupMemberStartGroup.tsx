import { sortedStartGroups, type StartGroupDraft } from "@/lib/start-group";
import type { RegistrationCategory } from "@/services/main/types";

const DEFER_VALUE = "__defer";

type Props = {
  category: RegistrationCategory | undefined;
  categoryId: string;
  value: StartGroupDraft;
  onChange: (next: StartGroupDraft) => void;
  disabled?: boolean;
  namePrefix: string;
};

export function GroupMemberStartGroup({
  category,
  categoryId,
  value,
  onChange,
  disabled,
  namePrefix,
}: Props) {
  const groups = categoryId ? sortedStartGroups(category) : [];
  const selectId = `${namePrefix}-start-group`;
  const placeholder = !categoryId
    ? "참가종목을 먼저 선택하세요"
    : groups.length
      ? "출발 그룹"
      : "선택 가능한 출발 그룹이 없습니다";

  return (
    <div className="party-start-group">
      <label className="party-start-group__label" htmlFor={selectId}>
        출발 그룹
      </label>
      <select
        id={selectId}
        value={value.startGroupUnselected ? DEFER_VALUE : value.startGroupId}
        disabled={disabled || !groups.length}
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
    </div>
  );
}
