import { mainFetch } from "@/lib/main/fetch";
import type { PaymentConfirmRequest, PaymentConfirmResponse } from "./types";

export async function confirmPayment(body: PaymentConfirmRequest) {
  return mainFetch<PaymentConfirmResponse>("public/payments/confirm", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
