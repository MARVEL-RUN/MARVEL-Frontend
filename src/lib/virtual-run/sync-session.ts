import { readLoginSession, writeLoginSession } from "@/lib/virtual-run/login-session";
import { readParticipant, writeParticipant } from "@/lib/virtual-run/participant-client";
import {
  fetchParticipantEntries,
  participantProductLabel,
} from "@/services/main/participant-auth";

/** 결제 뒤 보유 티켓 이름을 받는 사람 조회로 다시 맞춘다 */
export async function syncVirtualRunSessionFromLookup() {
  const session = readLoginSession();
  if (!session?.tokens?.accessToken) return null;
  const entries = await fetchParticipantEntries();
  const categoryName = participantProductLabel(entries) || session.categoryName;
  const eventCategoryId =
    entries.find((row) => row.productId)?.productId || session.eventCategoryId;
  writeLoginSession({
    ...session,
    categoryName,
    eventCategoryId,
  });
  const current = readParticipant();
  const participant = current
    ? {
        ...current,
        name: session.access.name.trim() || current.name,
        categoryName,
      }
    : null;
  if (participant) writeParticipant(participant);
  return { participant };
}
