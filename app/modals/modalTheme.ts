"use client";

import type { CSSProperties } from "react";
import { notifications } from "@mantine/notifications";

/**
 * Flat, monochrome design tokens shared by every modal.
 * No gradients, no glow shadows, no backdrop blur.
 */
export const ui = {
  surface: "#ffffff",
  border: "#e5e5e5",
  inputBorder: "#d4d4d4",
  ink: "#171717",
  inkHover: "#404040",
  body: "#525252",
  muted: "#a3a3a3",
  subtle: "#f5f5f5",
  danger: "#dc2626",
  dangerHover: "#b91c1c",
  positive: "#16a34a",
  shadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
} as const;

/** Card / panel surface. */
export const cardStyle: CSSProperties = {
  background: ui.surface,
  border: `1px solid ${ui.border}`,
  borderRadius: 8,
  boxShadow: ui.shadow,
};

/** Modal shell: white surface, hairline border, no blur. */
export const modalStyles = {
  content: {
    background: ui.surface,
    border: `1px solid ${ui.border}`,
    borderRadius: 8,
    boxShadow: ui.shadow,
  } as CSSProperties,
  header: {
    background: ui.surface,
    borderBottom: `1px solid ${ui.border}`,
    padding: "16px 20px",
  } as CSSProperties,
  title: {
    color: ui.ink,
    fontWeight: 600,
    fontSize: "1.05rem",
    width: "100%",
  } as CSSProperties,
  body: {
    padding: "20px",
  } as CSSProperties,
};

export const overlayProps = { backgroundOpacity: 0.4, blur: 0 };

/**
 * Mantine v8 styles the input through CSS variables declared on the input
 * wrapper, so overriding them there keeps the `:focus` transition working
 * (a hard-coded `borderColor` would win over the focus rule and freeze it).
 */
export const inputStyles = {
  wrapper: {
    "--input-bd": ui.inputBorder,
    "--input-bd-focus": ui.ink,
    "--input-placeholder-color": ui.muted,
    "--input-bg": ui.surface,
    "--input-color": ui.ink,
  } as CSSProperties,
  label: {
    color: ui.ink,
    fontWeight: 600,
    marginBottom: 4,
  } as CSSProperties,
};

const buttonBase: CSSProperties = {
  boxShadow: "none",
  fontWeight: 600,
};

/**
 * Button colors are passed through the `style` prop rather than `styles`
 * because Mantine applies its own variant vars *after* `styles` but *before*
 * `style`, so only `style` reliably wins.
 */
export const primaryButtonStyle = {
  ...buttonBase,
  "--button-bg": ui.ink,
  "--button-hover": ui.inkHover,
  "--button-color": "#ffffff",
  "--button-bd": `1px solid ${ui.ink}`,
  "--button-radius": "6px",
} as CSSProperties;

export const secondaryButtonStyle = {
  ...buttonBase,
  "--button-bg": ui.surface,
  "--button-hover": ui.subtle,
  "--button-color": ui.ink,
  "--button-bd": `1px solid ${ui.inputBorder}`,
  "--button-radius": "6px",
} as CSSProperties;

export const dangerButtonStyle = {
  ...buttonBase,
  "--button-bg": ui.danger,
  "--button-hover": ui.dangerHover,
  "--button-color": "#ffffff",
  "--button-bd": `1px solid ${ui.danger}`,
  "--button-radius": "6px",
} as CSSProperties;

const notificationStyles = {
  root: {
    background: ui.surface,
    border: `1px solid ${ui.border}`,
    borderRadius: 8,
    boxShadow: ui.shadow,
  } as CSSProperties,
  title: { color: ui.ink, fontWeight: 600 } as CSSProperties,
  description: { color: ui.body } as CSSProperties,
};

export function notifySuccess(title: string, message: string) {
  notifications.show({
    title,
    message,
    color: "dark",
    autoClose: 4000,
    styles: notificationStyles,
  });
}

export function notifyError(title: string, message: string) {
  notifications.show({
    title,
    message,
    color: "red",
    autoClose: 6000,
    styles: notificationStyles,
  });
}

/** "NOT_REQUIRED" -> "Not Required". Empty values become an em dash. */
export function toDisplay(value?: string | null): string {
  if (!value) {
    return "—";
  }
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Builds the `recommendation_count` slice of a request body.
 *
 * Mantine's NumberInput yields `""` when the field is cleared and
 * `Number("") === 0`, so sending the parsed value blindly would persist 0
 * instead of respecting the stored value / schema default of 3. Returning an
 * empty object omits the key entirely: add-school then falls back to the schema
 * default, and edit-school leaves the existing value untouched because it only
 * writes fields that are present.
 */
export function recommendationCountBody(
  value: number | string
): { recommendation_count?: number } {
  if (typeof value === "string" && value.trim() === "") {
    return {};
  }
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return {};
  }
  return { recommendation_count: parsed };
}

/** Pulls the useful message out of an axios error, a fetch payload or an Error. */
export function errorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const candidate = error as {
      response?: { data?: { error?: unknown } };
      message?: unknown;
    };
    const apiError = candidate.response?.data?.error;
    if (typeof apiError === "string" && apiError) {
      return apiError;
    }
    if (typeof candidate.message === "string" && candidate.message) {
      return candidate.message;
    }
  }
  return fallback;
}
