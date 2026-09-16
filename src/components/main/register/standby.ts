export type StandbySlots = {
  d: string;
  h: string;
  m: string;
  s: string;
};

export type StandbyPanelProps = {
  dday: string;
  slots: StandbySlots;
  onClose: () => void;
};
