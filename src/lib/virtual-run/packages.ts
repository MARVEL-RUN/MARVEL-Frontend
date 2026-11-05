import { VIRTUAL_RUN_ASSETS } from "@/lib/virtual-run/assets";
import type { VirtualRunRoundId } from "@/lib/virtual-run/rounds";
import { VIRTUAL_RUN_ROUNDS } from "@/lib/virtual-run/rounds";
import type { VirtualRunTicketKind } from "@/lib/virtual-run/ticket-payment";

export const VR_SINGLE_PACKAGE_PRICE = 40_000;
export const VR_ASSEMBLE_PACKAGE_PRICE = 80_000;

export type VrPackageId = VirtualRunRoundId | "assemble";

export type VrPackage = {
  id: VrPackageId;
  name: string;
  price: number;
  image: string;
  accent: "gold" | "red" | "blue" | "cyan";
  roundIds: VirtualRunRoundId[];
};

export const VR_SINGLE_PACKAGES: VrPackage[] = [
  {
    id: "avengers",
    name: "어벤져스 패키지",
    price: VR_SINGLE_PACKAGE_PRICE,
    image: VIRTUAL_RUN_ASSETS.packages.avengers,
    accent: "gold",
    roundIds: ["avengers"],
  },
  {
    id: "x-men",
    name: "엑스맨 패키지",
    price: VR_SINGLE_PACKAGE_PRICE,
    image: VIRTUAL_RUN_ASSETS.packages["x-men"],
    accent: "red",
    roundIds: ["x-men"],
  },
  {
    id: "fantastic-four",
    name: "판타스틱4 패키지",
    price: VR_SINGLE_PACKAGE_PRICE,
    image: VIRTUAL_RUN_ASSETS.packages["fantastic-four"],
    accent: "blue",
    roundIds: ["fantastic-four"],
  },
];

export const VR_ASSEMBLE_PACKAGE: VrPackage = {
  id: "assemble",
  name: "어셈블 패키지",
  price: VR_ASSEMBLE_PACKAGE_PRICE,
  image: VIRTUAL_RUN_ASSETS.packages.assemble,
  accent: "cyan",
  roundIds: VIRTUAL_RUN_ROUNDS.map((round) => round.id),
};

export const VR_PACKAGES: VrPackage[] = [...VR_SINGLE_PACKAGES, VR_ASSEMBLE_PACKAGE];

export function vrPackageById(id: VrPackageId): VrPackage {
  const found = VR_PACKAGES.find((item) => item.id === id);
  if (!found) throw new Error(`unknown package: ${id}`);
  return found;
}

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

/** 서로 다른 싱글 2개는 어셈블과 금액이 같다. 그 조합은 상품으로 두지 않고 안내만 한다. */
export function vrSingleOverlapNote(lines: { packageId: VrPackageId }[]): string | null {
  if (lines.some((line) => line.packageId === "assemble")) return null;
  const singles = lines.filter((line) => line.packageId !== "assemble");
  const themes = new Set(singles.map((line) => line.packageId));
  if (themes.size < 2) return null;
  if (singles.length >= 3) {
    return `싱글패키지 ${singles.length}개는 ${won(singles.length * VR_SINGLE_PACKAGE_PRICE)}입니다. 세 테마는 어셈블 패키지 ${won(VR_ASSEMBLE_PACKAGE_PRICE)}에 포함됩니다.`;
  }
  return `서로 다른 싱글패키지 2개는 ${won(VR_ASSEMBLE_PACKAGE_PRICE)}으로 어셈블 패키지와 같습니다. 한 사람이 테마를 여러 개 받을 때는 어셈블 패키지를 담아 주세요.`;
}

export function vrPackageTotal(lines: { packageId: VrPackageId }[]) {
  return lines.reduce((sum, line) => sum + vrPackageById(line.packageId).price, 0);
}

export function vrPackageOrderName(lines: { packageId: VrPackageId }[]) {
  if (!lines.length) return "버추얼런 패키지";
  const counts = new Map<VrPackageId, number>();
  for (const line of lines) {
    counts.set(line.packageId, (counts.get(line.packageId) ?? 0) + 1);
  }
  const parts = VR_PACKAGES.flatMap((item) => {
    const count = counts.get(item.id) ?? 0;
    if (!count) return [];
    return [count > 1 ? `${item.name} ${count}개` : item.name];
  });
  const text = `버추얼런 ${parts.join(" · ")}`;
  if (text.length <= 80) return text;
  return `버추얼런 패키지 ${lines.length}개`;
}

export function vrPackageTicketKind(lines: { packageId: VrPackageId }[]): VirtualRunTicketKind {
  const hasAssemble = lines.some((line) => line.packageId === "assemble");
  const hasSingle = lines.some((line) => line.packageId !== "assemble");
  if (hasAssemble && hasSingle) return "mixed";
  if (hasAssemble) return "package";
  return "single";
}

export function vrPackageRoundIds(lines: { packageId: VrPackageId }[]): VirtualRunRoundId[] {
  const owned = new Set<VirtualRunRoundId>();
  for (const line of lines) {
    for (const id of vrPackageById(line.packageId).roundIds) owned.add(id);
  }
  return VIRTUAL_RUN_ROUNDS.map((round) => round.id).filter((id) => owned.has(id));
}
