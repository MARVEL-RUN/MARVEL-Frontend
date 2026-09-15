import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { TOSS_CLIENT_KEY } from "@/lib/main/config";

export { ANONYMOUS };

export async function createPaymentWidgets() {
  if (!TOSS_CLIENT_KEY) {
    throw new Error("토스 클라이언트 키가 설정되지 않았습니다.");
  }
  const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
  return tossPayments.widgets({ customerKey: ANONYMOUS });
}
