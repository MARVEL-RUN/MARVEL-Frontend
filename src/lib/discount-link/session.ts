import type { DiscountLinkEntry } from "./config";
import type { DiscountOptions } from "./types";

export type DiscountRegisterSession = {
  entry: DiscountLinkEntry;
  linkCode: string;
  options: DiscountOptions | null;
  optionsLoading: boolean;
  optionsError: string;
  optionsErrorCode?: string;
  optionsDown: boolean;
  retryOptions: () => void;
};
