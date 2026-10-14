import { sortedStartGroups, type StartGroupDraft } from "@/lib/start-group";
import type { RegistrationCategory } from "@/services/main/types";
import { StartGroupPick } from "./StartGroupPick";

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
  if (!categoryId) {
    return (
      <div className="party-start-group party-start-group--wait">
        참가종목을 선택하면 출발 그룹을 고를 수 있습니다.
      </div>
    );
  }

  const groups = sortedStartGroups(category);
  if (!groups.length) {
    return (
      <div className="party-start-group party-start-group--wait">
        선택한 종목의 출발 그룹을 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <div className="party-start-group">
      <StartGroupPick
        groups={groups}
        value={value}
        onChange={onChange}
        disabled={disabled}
        namePrefix={namePrefix}
      />
    </div>
  );
}
