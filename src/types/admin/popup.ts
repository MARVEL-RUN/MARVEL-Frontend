export type PopupDevice = "BOTH" | "PC" | "MOBILE";

export type AdminPopup = {
  id: string;
  url: string;
  startAt: string;
  endAt: string;
  device: PopupDevice;
  orderNo: number;
  imageUrl?: string;
  imageName?: string;
  draft?: boolean;
};
