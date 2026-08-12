"use client";

import type { CSSProperties } from "react";
import { notifications } from "@mantine/notifications";

export { DEFAULT_CHECKLIST } from "@/lib/defaults";

/* -------------------------------------------------------------------------- */
/* Tokens                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Flat, monochrome design tokens — the single source of truth for every colour
 * in the app. No gradients, no glow shadows, no backdrop blur.
 *
 * Each token is a reference to a CSS custom property declared in
 * `app/globals.css`, which carries a light and a dark value keyed off the
 * `data-mantine-color-scheme` attribute Mantine puts on `<html>`. That is what
 * makes the theme switch instantly and without a re-render: the values change
 * under the same strings, so nothing here (or in any component) is
 * scheme-aware. Adding a colour means adding a token *and* both palette
 * entries — never a raw hex in a component.
 */
export const ui = {
  /** Page background behind the cards. */
  canvas: "var(--app-canvas)",
  surface: "var(--app-surface)",
  border: "var(--app-border)",
  inputBorder: "var(--app-input-border)",
  ink: "var(--app-ink)",
  /** Hover tone for a surface filled with `ink` (i.e. the primary button). */
  inkHover: "var(--app-ink-hover)",
  /** Label/icon colour on top of an `ink` fill. */
  onInk: "var(--app-on-ink)",
  body: "var(--app-body)",
  muted: "var(--app-muted)",
  subtle: "var(--app-subtle)",
  /** Recessed groove (SegmentedControl track) — sits *under* the surface. */
  track: "var(--app-track)",
  /**
   * Strongest available fill: the ACCEPTED badge, tooltips, loaders. Inverts
   * with the scheme, so it stays the loudest thing on the page in both.
   */
  emphasis: "var(--app-emphasis)",
  onEmphasis: "var(--app-on-emphasis)",
  /* Semantic accents — flat fills only. */
  success: "var(--app-success)",
  danger: "var(--app-danger)",
  /**
   * Destructive *button* fill. Deliberately not `danger`: that one brightens in
   * dark mode to stay readable as text, which would leave white button labels
   * short of contrast.
   */
  dangerBg: "var(--app-danger-bg)",
  dangerHover: "var(--app-danger-hover)",
  onDanger: "var(--app-on-danger)",
  warning: "var(--app-warning)",
  /** @deprecated alias of `success`, kept for the original modal code. */
  positive: "var(--app-success)",
  shadow: "var(--app-shadow)",
  /** Scrim behind modals and the mobile drawer. */
  overlay: "var(--app-overlay)",
  /** Plate behind a remote logo image; stays light in both schemes. */
  logoPlate: "var(--app-logo-plate)",
} as const;

/** Card / panel surface. */
export const cardStyle: CSSProperties = {
  background: ui.surface,
  border: `1px solid ${ui.border}`,
  borderRadius: 8,
  boxShadow: ui.shadow,
};

/** Small uppercase label that heads a group of fields. */
export const sectionLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: ui.muted,
};

/** Page-level heading. */
export const pageTitleStyle: CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: ui.ink,
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

/**
 * Modal / drawer scrim. The tint is handed over as `--overlay-bg` instead of
 * Mantine's `backgroundOpacity` so it can carry a different alpha per scheme:
 * 40% black reads as a clear dimming over the light canvas but barely registers
 * over the dark one, where the page is already almost that colour.
 */
export const overlayProps = {
  blur: 0,
  style: { "--overlay-bg": ui.overlay } as CSSProperties,
};

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

/** Flat styling for a native `<input type="date">` (we deliberately ship no date picker lib). */
export const dateInputStyle: CSSProperties = {
  width: "100%",
  height: 36,
  padding: "0 10px",
  background: ui.surface,
  border: `1px solid ${ui.inputBorder}`,
  borderRadius: 6,
  color: ui.ink,
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
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
  "--button-color": ui.onInk,
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
  "--button-bg": ui.dangerBg,
  "--button-hover": ui.dangerHover,
  "--button-color": ui.onDanger,
  "--button-bd": `1px solid ${ui.dangerBg}`,
  "--button-radius": "6px",
} as CSSProperties;

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

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

/**
 * `color` paints the accent bar down the side of the toast. It goes through the
 * tokens rather than a Mantine palette name (`"dark"` / `"red"`) because those
 * resolve to near-black and a washed red respectively once the color scheme
 * flips, either of which disappears against the toast's own dark surface.
 */
export function notifySuccess(title: string, message: string) {
  notifications.show({
    title,
    message,
    color: ui.emphasis,
    autoClose: 4000,
    styles: notificationStyles,
  });
}

export function notifyError(title: string, message: string) {
  notifications.show({
    title,
    message,
    color: ui.danger,
    autoClose: 6000,
    styles: notificationStyles,
  });
}

/* -------------------------------------------------------------------------- */
/* Formatting helpers                                                         */
/* -------------------------------------------------------------------------- */

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

/** "Which?" — derived from the two boolean track flags. */
export function getWhichLabel(school: {
  non_thesis_option?: boolean | null;
  professional_masters?: boolean | null;
}): string {
  const nonThesis = school.non_thesis_option === true;
  const professional = school.professional_masters === true;
  if (nonThesis && professional) {
    return "Both";
  }
  if (nonThesis) {
    return "Non-Thesis";
  }
  if (professional) {
    return "Professional";
  }
  return "—";
}

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MS_PER_DAY = 86_400_000;

/**
 * Deadlines are conceptually dates, not instants: they are stored at UTC
 * midnight, so every reader has to look at the UTC parts or a browser west of
 * Greenwich renders "Jan 14" for a January 15 deadline.
 */
function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "Jan 15, 2026" — empty string when there is no date. */
export function formatDate(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) {
    return "";
  }
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

/** "2026-01-15" — the value shape a native `<input type="date">` expects. */
export function toDateInputValue(
  value: string | Date | null | undefined
): string {
  const date = toDate(value);
  if (!date) {
    return "";
  }
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

/**
 * Inverse of {@link toDateInputValue}: turns the `<input type="date">` value
 * into the UTC-midnight ISO string the API stores. Empty input -> null (clear).
 */
export function fromDateInputValue(value: string): string | null {
  if (!value) {
    return null;
  }
  return `${value}T00:00:00.000Z`;
}

/** Statuses where a deadline is history, not a thing to chase. */
const TERMINAL_STATUSES = new Set(["ACCEPTED", "REJECTED", "REMOVED"]);

export interface DeadlineInfo {
  /** Chip text, or null when the school has no deadline set. */
  label: string | null;
  /** Chip tone; null alongside a null label. */
  color: "red" | "amber" | "gray" | null;
  /** Whole days until the deadline — negative once it has passed. */
  days: number | null;
  /**
   * True when `label` is an urgency countdown rather than a plain date.
   * Callers that already print the date use this to avoid showing it twice.
   */
  countdown: boolean;
}

/**
 * Countdown chip data for a deadline.
 *
 * Days are measured between calendar dates (deadline in UTC, today in the
 * viewer's zone) so "due in 1d" flips at local midnight rather than at some
 * arbitrary hour. Schools already accepted/rejected/removed are past caring, so
 * they get the plain date in gray instead of an urgency countdown.
 */
export function deadlineInfo(
  deadline: string | Date | null | undefined,
  status: string
): DeadlineInfo {
  const date = toDate(deadline);
  if (!date) {
    return { label: null, color: null, days: null, countdown: false };
  }

  const target = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((target - today) / MS_PER_DAY);

  if (TERMINAL_STATUSES.has(status)) {
    return { label: formatDate(date), color: "gray", days, countdown: false };
  }

  if (days < 0) {
    const overdue = Math.abs(days);
    return { label: `${overdue}d overdue`, color: "red", days, countdown: true };
  }
  if (days === 0) {
    return { label: "due today", color: "amber", days, countdown: true };
  }
  if (days <= 7) {
    return { label: `due in ${days}d`, color: "amber", days, countdown: true };
  }
  return { label: `due in ${days}d`, color: "gray", days, countdown: true };
}

/** Maps a {@link DeadlineInfo} tone onto a colour token. */
export function deadlineColorHex(color: DeadlineInfo["color"]): string {
  if (color === "red") return ui.danger;
  if (color === "amber") return ui.warning;
  return ui.muted;
}

/* -------------------------------------------------------------------------- */
/* Shared row types (shapes returned by the JSON API)                         */
/* -------------------------------------------------------------------------- */

export type SchoolStatus =
  | "APPLYING"
  | "APPLIED"
  | "REJECTED"
  | "ACCEPTED"
  | "REMOVED";
/** MAIN = a flagship choice; OTHERS = everything still on the list. */
export type SchoolPriority = "MAIN" | "OTHERS";
/** Which program option Enes will apply to at this school. */
export type ApplyOption =
  | "NON_THESIS"
  | "PROFESSIONAL"
  | "BOTH"
  | "UNDECIDED";
export type GreRequirement = "REQUIRED" | "OPTIONAL" | "NOT_REQUIRED";
export type LetterStatusValue = "NOT_ASKED" | "ASKED" | "AGREED" | "SUBMITTED";

export const PRIORITIES: SchoolPriority[] = ["MAIN", "OTHERS"];

export const PRIORITY_LABELS: Record<SchoolPriority, string> = {
  MAIN: "Main",
  OTHERS: "Others",
};

/** Dropdown data for every priority picker. */
export const PRIORITY_OPTIONS = PRIORITIES.map((priority) => ({
  value: priority,
  label: PRIORITY_LABELS[priority],
}));

export const APPLY_OPTIONS: ApplyOption[] = [
  "NON_THESIS",
  "PROFESSIONAL",
  "BOTH",
  "UNDECIDED",
];

export const APPLY_OPTION_LABELS: Record<ApplyOption, string> = {
  NON_THESIS: "Non-Thesis",
  PROFESSIONAL: "Professional",
  BOTH: "Both",
  UNDECIDED: "Undecided",
};

/** Dropdown data for every apply-option picker. */
export const APPLY_OPTION_OPTIONS = APPLY_OPTIONS.map((option) => ({
  value: option,
  label: APPLY_OPTION_LABELS[option],
}));

export const LETTER_STATUSES: LetterStatusValue[] = [
  "NOT_ASKED",
  "ASKED",
  "AGREED",
  "SUBMITTED",
];

export const LETTER_STATUS_LABELS: Record<LetterStatusValue, string> = {
  NOT_ASKED: "Not asked",
  ASKED: "Asked",
  AGREED: "Agreed",
  SUBMITTED: "Submitted",
};

/** Dropdown data for every letter-status picker. */
export const LETTER_STATUS_OPTIONS = LETTER_STATUSES.map((status) => ({
  value: status,
  label: LETTER_STATUS_LABELS[status],
}));

/**
 * Only a submitted letter (green) and an outstanding ask (amber) earn an
 * accent; "agreed" is neutral and "not asked" recedes, so the eye lands on the
 * requests that still need chasing.
 */
const LETTER_STATUS_COLORS: Record<LetterStatusValue, string> = {
  NOT_ASKED: ui.muted,
  ASKED: ui.warning,
  AGREED: ui.body,
  SUBMITTED: ui.success,
};

export function letterStatusColor(status: LetterStatusValue): string {
  return LETTER_STATUS_COLORS[status] ?? ui.muted;
}

export interface ChecklistItemRow {
  id: string;
  school_id: string;
  title: string;
  done: boolean;
  order: number;
}

export interface RecommenderRow {
  id: string;
  name: string;
  email: string;
  notes: string;
}

export interface LetterRequestRow {
  id: string;
  school_id: string;
  recommender_id: string;
  status: LetterStatusValue;
  recommender: RecommenderRow;
}

/** A `Schools` row plus its relations, as `/api/schools/[id]` returns it. */
export interface SchoolFull {
  id: string;
  name: string;
  location: string;
  status: SchoolStatus;
  priority: SchoolPriority;
  logo: string;
  removal_reason: string | null;
  removed: boolean;
  more_info_notes: string | null;
  gre: GreRequirement;
  recommendation_count: number;
  non_thesis_option: boolean;
  professional_masters: boolean;
  duration: string | null;
  /** Manual list position; 1-based, assigned by /api/schools/reorder. */
  sort_order: number;
  apply_option: ApplyOption;
  apply_option_note: string;
  deadline: string | null;
  application_fee: number | null;
  program_url: string | null;
  portal_url: string | null;
  applied_date: string | null;
  decision_date: string | null;
  checklist: ChecklistItemRow[];
  letters: LetterRequestRow[];
}

/** A recommender plus the letter requests attached to it. */
export interface RecommenderWithLetters extends RecommenderRow {
  letters: Array<{
    id: string;
    school_id: string;
    recommender_id: string;
    status: LetterStatusValue;
    school: { id: string; name: string; status: SchoolStatus };
  }>;
}
