type DaumPostcodeData = {
  zonecode: string;
  address: string;
  roadAddress: string;
  jibunAddress: string;
  buildingName?: string;
  apartment?: string;
};

type DaumPostcodeConstructor = new (options: {
  oncomplete: (data: DaumPostcodeData) => void;
  width?: string | number;
  height?: string | number;
}) => { open: () => void };

declare global {
  interface Window {
    daum?: {
      Postcode: DaumPostcodeConstructor;
    };
  }
}

const SCRIPT_ID = "daum-postcode-script";
const SCRIPT_SRC =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

let loading: Promise<void> | null = null;

export function loadDaumPostcode() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("브라우저에서만 사용할 수 있습니다."));
  }
  if (window.daum?.Postcode) return Promise.resolve();
  if (loading) return loading;

  loading = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("주소 검색 스크립트를 불러오지 못했습니다.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      reject(new Error("주소 검색 스크립트를 불러오지 못했습니다."));
    };
    document.body.appendChild(script);
  });

  return loading;
}

export function formatDaumBaseAddress(data: DaumPostcodeData) {
  const base = data.roadAddress || data.jibunAddress || data.address;
  const building =
    data.buildingName && data.apartment === "Y"
      ? ` (${data.buildingName})`
      : data.buildingName
        ? ` ${data.buildingName}`
        : "";
  return `${base}${building}`.trim();
}

export function formatAddressForApi(zonecode: string, address: string) {
  const zip = zonecode.trim();
  const base = address.trim();
  if (!zip) return base;
  return `[${zip}] ${base}`;
}

export async function openDaumPostcode(
  onComplete: (data: DaumPostcodeData) => void,
) {
  await loadDaumPostcode();
  if (!window.daum?.Postcode) {
    throw new Error("주소 검색을 시작할 수 없습니다.");
  }
  new window.daum.Postcode({ oncomplete: onComplete }).open();
}
