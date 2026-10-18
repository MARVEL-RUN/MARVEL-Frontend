import { EVENT } from "@/lib/event";
import { lookupApplyPercentDiscounts } from "@/lib/discount-link/lookup-fee";
import type { AppliedDiscount } from "@/lib/discount-link/types";
import { feeAmount, feeDigits, formatFee } from "@/lib/register";
import { CourseFeeTable } from "../register/ApplyUi";

function CourseFeeHead({
  long,
  short,
}: {
  long: string;
  short: string;
}) {
  return (
    <span className="course-pick__fees-h" aria-label={long}>
      <span className="course-pick__fees-label course-pick__fees-label--long" aria-hidden="true">
        {long}
      </span>
      <span className="course-pick__fees-label course-pick__fees-label--short" aria-hidden="true">
        {short}
      </span>
    </span>
  );
}

export function hasLookupPercentDiscount(appliedDiscounts: AppliedDiscount[]) {
  return appliedDiscounts.some(
    (item) => item.method === "PERCENT" && item.ratePercent != null,
  );
}

function LookupDiscountFeeSide({
  appliedDiscounts,
}: {
  appliedDiscounts: AppliedDiscount[];
}) {
  return (
    <div className="course-pick__fees lookup-discount-fees">
      <div className="course-pick__fees-table">
        <div className="course-pick__fees-head">
          <CourseFeeHead long="일반 참가비" short="참가비" />
          <CourseFeeHead long="만 12세 이하 참가비" short="만 12세 이하" />
        </div>
        <div className="course-pick__fees-body">
          {EVENT.courses.map((course) => {
            const adultFee = lookupApplyPercentDiscounts(
              feeAmount(course.fee),
              appliedDiscounts,
            );
            const childBase =
              "childFee" in course ? feeAmount(course.childFee) : null;
            const childFee =
              childBase == null
                ? null
                : lookupApplyPercentDiscounts(childBase, appliedDiscounts);
            return (
              <div key={course.id} className="course-pick__fees-row">
                <span>{feeDigits(formatFee(adultFee))}</span>
                <span className={childFee != null ? "is-fee-child" : undefined}>
                  {childFee != null ? feeDigits(formatFee(childFee)) : "참가 불가"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function LookupApplyHintFeeGuide({
  appliedDiscounts,
}: {
  appliedDiscounts: AppliedDiscount[] | null;
}) {
  const showDiscount =
    appliedDiscounts != null && hasLookupPercentDiscount(appliedDiscounts);

  return (
    <div className="lookup-fee-guide">
      <CourseFeeTable />
      {showDiscount ? (
        <>
          <span className="lookup-fee-guide__sep" aria-hidden="true">
            {">>"}
          </span>
          <LookupDiscountFeeSide appliedDiscounts={appliedDiscounts} />
        </>
      ) : null}
    </div>
  );
}

export function lookupDiscountGuideFromMembers(
  members: { hasPriceCalculation?: boolean; priceCalculation?: { appliedDiscounts: AppliedDiscount[] } }[],
): AppliedDiscount[] | null {
  for (const member of members) {
    if (!member.hasPriceCalculation || !member.priceCalculation) continue;
    if (hasLookupPercentDiscount(member.priceCalculation.appliedDiscounts)) {
      return member.priceCalculation.appliedDiscounts;
    }
  }
  return null;
}
