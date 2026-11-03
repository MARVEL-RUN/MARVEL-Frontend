"use client";

import {
  VR_PARTICIPANT_STORAGE_KEY,
  defaultParticipant,
  type VirtualRunParticipant,
} from "./participant";

export function readParticipant(): VirtualRunParticipant | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(VR_PARTICIPANT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VirtualRunParticipant;
  } catch {
    return null;
  }
}

export function writeParticipant(p: VirtualRunParticipant): void {
  localStorage.setItem(VR_PARTICIPANT_STORAGE_KEY, JSON.stringify(p));
}

export function clearParticipant(): void {
  localStorage.removeItem(VR_PARTICIPANT_STORAGE_KEY);
}

export function ensureDemoParticipant(): VirtualRunParticipant {
  const existing = readParticipant();
  if (existing) return existing;
  const seeded = defaultParticipant();
  writeParticipant(seeded);
  return seeded;
}
