"use client";

/**
 * Legacy entry point kept so the existing modals keep compiling unchanged.
 * Everything now lives in `app/theme.ts` — new code should import from there.
 */
export {
  ui,
  cardStyle,
  modalStyles,
  overlayProps,
  inputStyles,
  primaryButtonStyle,
  secondaryButtonStyle,
  dangerButtonStyle,
  notifySuccess,
  notifyError,
  toDisplay,
  recommendationCountBody,
  errorMessage,
} from "@/app/theme";
