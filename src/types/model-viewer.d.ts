import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src: string;
  alt?: string;
  loading?: "auto" | "lazy" | "eager";
  "camera-controls"?: boolean;
  "camera-orbit"?: string;
  "field-of-view"?: string;
  "touch-action"?: string;
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
