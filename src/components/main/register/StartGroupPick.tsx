import type { RegistrationStartGroup } from "@/services/main/types";
import type { StartGroupDraft, StartGroupPreviewSection } from "@/lib/start-group";

type Props = {
  /** 단일 종목(조회·수정 등) */
  groups?: RegistrationStartGroup[];
  /** 신청 화면 — 종목별 미리보기 */
  sections?: StartGroupPreviewSection[];
  activeSectionKey?: string;
  value: StartGroupDraft;
  onChange: (next: StartGroupDraft) => void;
  disabled?: boolean;
  namePrefix?: string;
  hintWhenInactive?: string;
};

function GroupList({
  groups,
  value,
  onChange,
  disabled,
  radioName,
}: {
  groups: RegistrationStartGroup[];
  value: StartGroupDraft;
  onChange: (next: StartGroupDraft) => void;
  disabled?: boolean;
  radioName: string;
}) {
  return (
    <ul className="start-group-pick__list" role="radiogroup" aria-label="출발 그룹">
      {groups.map((group) => {
        const checked = !value.startGroupUnselected && value.startGroupId === group.id;
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
  );
}

export function StartGroupPick({
  groups,
  sections,
  activeSectionKey,
  value,
  onChange,
  disabled,
  namePrefix = "start-group",
  hintWhenInactive,
}: Props) {
  const sectionList = sections?.length
    ? sections
    : groups?.length
      ? [{ key: "single", title: "", groups }]
      : [];

  if (!sectionList.length) {
    return (
      <p className="start-group-pick start-group-pick--empty">
        출발 그룹 선택지를 불러오지 못했습니다.
      </p>
    );
  }

  const preview = !activeSectionKey;
  const visibleSections = preview
    ? sectionList
    : sectionList.filter((section) => section.key === activeSectionKey);

  if (!visibleSections.length) {
    return (
      <p className="start-group-pick start-group-pick--empty">
        선택한 종목의 출발 그룹을 불러오지 못했습니다.
      </p>
    );
  }

  const multiSection = visibleSections.length > 1 || Boolean(visibleSections[0]?.title);
  const inputsDisabled = preview || Boolean(disabled);
  const showSectionTitle = preview || visibleSections.length > 1;

  return (
    <div
      className={`start-group-pick${preview ? " is-preview" : ""}${
        disabled && !preview ? " is-disabled" : ""
      }`}
    >
      {visibleSections.map((section) => {
        const radioName = multiSection
          ? `${namePrefix}-${section.key}`
          : `${namePrefix}-choice`;

        return (
          <div key={section.key} className="start-group-pick__section">
            {section.title && showSectionTitle ? (
              <p className="start-group-pick__section-title">{section.title}</p>
            ) : null}
            <GroupList
              groups={section.groups}
              value={value}
              onChange={onChange}
              disabled={inputsDisabled}
              radioName={radioName}
            />
          </div>
        );
      })}
      <label className="start-group-pick__defer">
        <input
          type="checkbox"
          checked={value.startGroupUnselected}
          disabled={inputsDisabled}
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
      {hintWhenInactive && preview ? (
        <p className="form-row__hint start-group-pick__hint">{hintWhenInactive}</p>
      ) : null}
    </div>
  );
}
