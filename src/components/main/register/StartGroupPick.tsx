import type { RegistrationStartGroup } from "@/services/main/types";
import type { StartGroupDraft } from "@/lib/start-group";

type Props = {
  groups: RegistrationStartGroup[];
  value: StartGroupDraft;
  onChange: (next: StartGroupDraft) => void;
  disabled?: boolean;
  namePrefix?: string;
};

export function StartGroupPick({
  groups,
  value,
  onChange,
  disabled,
  namePrefix = "start-group",
}: Props) {
  if (!groups.length) {
    return (
      <p className="start-group-pick start-group-pick--empty">
        출발 그룹 선택지를 불러오지 못했습니다.
      </p>
    );
  }

  const radioName = `${namePrefix}-choice`;

  return (
    <div className={`start-group-pick${disabled ? " is-disabled" : ""}`}>
      <ul className="start-group-pick__list" role="radiogroup" aria-label="출발 그룹">
        {groups.map((group) => {
          const checked =
            !value.startGroupUnselected && value.startGroupId === group.id;
          return (
            <li key={group.id}>
              <label className={checked ? "is-on" : undefined}>
                <input
                  type="radio"
                  name={radioName}
                  checked={checked}
                  disabled={disabled}
                  onChange={() =>
                    onChange({
                      startGroupId: group.id,
                      startGroupUnselected: false,
                    })
                  }
                />
                <span className="start-group-pick__code">{group.code}</span>
                <span className="start-group-pick__desc">{group.description}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <label className="start-group-pick__defer">
        <input
          type="checkbox"
          checked={value.startGroupUnselected}
          disabled={disabled}
          onChange={(e) =>
            onChange({
              startGroupId: "",
              startGroupUnselected: e.target.checked,
            })
          }
        />
        <span>
          A, B 그룹을 잘 모르겠어요
          <small>후미 출발 그룹으로 배정됩니다</small>
        </span>
      </label>
    </div>
  );
}
