import type { CourseId } from "@/lib/register";
import { KitFixed } from "./ApplyUi";

export type ConfirmMemberListItem = {
  key: string;
  name: string;
  categoryName: string;
  courseId: CourseId | "";
  feeLabel?: string;
  size: string;
  birthLabel: string;
  genderLabel: string;
  phoneLabel: string;
  startGroupLabel?: string;
};

export function ConfirmMemberList({ items }: { items: ConfirmMemberListItem[] }) {
  if (!items.length) return null;

  return (
    <div className="lookup-members-block">
      <p className="lookup-members-block__title">참가자 {items.length}명</p>
      <ul className="lookup-members lookup-members--confirm">
        {items.map((item, i) => {
          const sub = [
            item.size && item.size !== "—" ? `사이즈 ${item.size}` : "",
            item.startGroupLabel && item.startGroupLabel !== "—"
              ? `출발 ${item.startGroupLabel}`
              : "",
          ]
            .filter(Boolean)
            .join(" · ");

          const detail = [
            item.birthLabel && item.birthLabel !== "—" ? item.birthLabel : "",
            item.genderLabel && item.genderLabel !== "—" ? item.genderLabel : "",
            item.phoneLabel && item.phoneLabel !== "—" ? item.phoneLabel : "",
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <li key={item.key}>
              <span className="lookup-members__no">{String(i + 1).padStart(2, "0")}</span>
              <div className="lookup-members__main">
                <p className="lookup-members__head">
                  <strong>{item.name.trim() || "—"}</strong>
                  {item.categoryName && item.categoryName !== "—" ? (
                    <span className="lookup-members__course">{item.categoryName}</span>
                  ) : null}
                </p>
                {sub ? <p className="lookup-members__sub">{sub}</p> : null}
                {detail ? <p className="lookup-members__detail">{detail}</p> : null}
                {item.courseId ? (
                  <div className="lookup-members__kit">
                    <KitFixed courseId={item.courseId} />
                  </div>
                ) : null}
              </div>
              {item.feeLabel ? (
                <span className="lookup-members__fee">{item.feeLabel}</span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
