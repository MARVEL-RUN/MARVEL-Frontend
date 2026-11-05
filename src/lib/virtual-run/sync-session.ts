import { VIRTUAL_RUN_EVENT_ID } from "@/lib/main/config";
import { readLoginSession, writeLoginSession } from "@/lib/virtual-run/login-session";
import { readParticipant, writeParticipant } from "@/lib/virtual-run/participant-client";
import { lookupIndividualRegistrations } from "@/services/main/registrations";
import type { RegistrationReceipt } from "@/services/main/types";

function pickReceipt(rows: RegistrationReceipt[]) {
  return rows.find((row) => row.registrationId?.trim()) ?? rows[0] ?? null;
}

/** 결제 뒤 종목·상향 대기를 신청 조회로 다시 맞춘다 */
export async function syncVirtualRunSessionFromLookup() {
  const session = readLoginSession();
  if (!session || !VIRTUAL_RUN_EVENT_ID) return null;
  const receipt = pickReceipt(
    await lookupIndividualRegistrations(VIRTUAL_RUN_EVENT_ID, session.access),
  );
  if (!receipt) return null;
  writeLoginSession({
    ...session,
    registrationId: receipt.registrationId?.trim() || session.registrationId,
    categoryName: receipt.eventCategoryName?.trim() || session.categoryName,
    eventCategoryId: receipt.eventCategoryId?.trim() || session.eventCategoryId,
  });
  const current = readParticipant();
  const participant = current
    ? {
        ...current,
        name: receipt.name?.trim() || current.name,
        categoryName: receipt.eventCategoryName?.trim() || current.categoryName,
        ownedRoundIds: [] as typeof current.ownedRoundIds,
      }
    : null;
  if (participant) writeParticipant(participant);
  return { receipt, participant };
}
