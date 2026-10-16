import type { RegistrationPolicyReason } from "@/services/main/types";

export function RegistrationPolicyNotice({
  reason,
}: {
  reason: RegistrationPolicyReason | null | undefined;
}) {
  const message = reason?.message?.trim();
  if (!message) {
    return (
      <div className="register-policy-notice" role="status">
        <p className="register-policy-notice__title">신규 접수가 마감되었습니다</p>
        <p className="register-policy-notice__body">
          접수 기간이 아니거나 정원이 마감되었습니다. 공지사항을 확인해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="register-policy-notice" role="status">
      <p className="register-policy-notice__title">신규 접수가 마감되었습니다</p>
      <p className="register-policy-notice__body">{message}</p>
    </div>
  );
}
