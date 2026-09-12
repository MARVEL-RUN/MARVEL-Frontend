import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string;
  alt?: string;
  poster?: string;
  loading?: "auto" | "lazy" | "eager";
  "camera-controls"?: boolean;
  "camera-orbit"?: string;
  "field-of-view"?: string;
  "min-field-of-view"?: string;
  "max-field-of-view"?: string;
  "touch-action"?: string;
  "disable-zoom"?: boolean;
  "disable-tap"?: boolean;
  "shadow-intensity"?: number | string;
  exposure?: number | string;
  "auto-rotate"?: boolean;
  "interaction-prompt"?: "auto" | "none" | "when-focused";
  "environment-image"?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerProps;
    }
  }
}
