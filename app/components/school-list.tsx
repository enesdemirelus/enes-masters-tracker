"use client";

/**
 * Pieces shared by every list that renders schools: the table at `/schools`,
 * its mobile card mirror, and the `/deadlines` roll-up. Keeping them here is
 * what makes a deadline chip or a progress meter look identical in all three.
 */

import type { CSSProperties } from "react";
import { Badge, Tooltip } from "@mantine/core";
import { BoolMark } from "./detail/DetailCard";
import {
  APPLY_OPTION_LABELS,
  DEFAULT_CHECKLIST,
  deadlineColorHex,
  deadlineInfo,
  PRIORITY_LABELS,
  toDisplay,
  ui,
  type ApplyOption,
  type SchoolFull,
  type SchoolPriority,
} from "@/app/theme";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * What `/api/get-school` hands back: every scalar column plus the thin
 * checklist slice the progress meters are built from.
 */
export interface SchoolRow
  extends Pick<
    SchoolFull,
    | "id"
    | "name"
    | "location"
    | "status"
    | "priority"
    | "apply_option"
    | "apply_option_note"
    | "logo"
    | "removed"
    | "removal_reason"
    | "gre"
    | "recommendation_count"
    | "non_thesis_option"
    | "professional_masters"
    | "duration"
    | "sort_order"
    | "deadline"
    | "applied_date"
    | "decision_date"
  > {
  checklist: Array<{ done: boolean }>;
}

/* -------------------------------------------------------------------------- */
/* Checklist progress                                                         */
/* -------------------------------------------------------------------------- */

export interface ChecklistProgress {
  done: number;
  total: number;
  /** 0–1. */
  ratio: number;
  complete: boolean;
}

/**
 * A school only gets its checklist rows the first time its detail page is
 * opened, so an empty relation means "none of the default items are done"
 * rather than "nothing to do" — hence the fallback total.
 */
export function checklistProgress(school: {
  checklist?: Array<{ done: boolean }> | null;
}): ChecklistProgress {
  const items = school.checklist ?? [];
  const total = items.length || DEFAULT_CHECKLIST.length;
  const done = items.filter((item) => item.done).length;
  return {
    done,
    total,
    ratio: total === 0 ? 0 : done / total,
    complete: total > 0 && done >= total,
  };
}

/* -------------------------------------------------------------------------- */
/* Presentational bits                                                        */
/* -------------------------------------------------------------------------- */

const chipStyle: CSSProperties = {
  flexShrink: 0,
  fontSize: 11,
  fontWeight: 600,
  borderRadius: 4,
  padding: "1px 6px",
  whiteSpace: "nowrap",
};

/**
 * Countdown next to a deadline ("3d overdue", "due in 5d").
 *
 * Renders nothing when there is no deadline, and nothing once the school has
 * reached a terminal status — `deadlineInfo` degrades to the plain date there,
 * which every caller already prints next to the chip.
 */
export function DeadlineChip({
  deadline,
  status,
}: {
  deadline?: string | null;
  status: string;
}) {
  const info = deadlineInfo(deadline, status);
  if (!info.countdown || !info.label) {
    return null;
  }
  const color = deadlineColorHex(info.color);
  return (
    <span style={{ ...chipStyle, color, border: `1px solid ${color}` }}>
      {info.label}
    </span>
  );
}

/** Thin flat meter — dark while there is work left, green once it is finished. */
export function ProgressMeter({
  ratio,
  complete,
  width = 60,
}: {
  ratio: number;
  complete?: boolean;
  width?: number | string;
}) {
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  return (
    <div
      style={{
        width,
        height: 4,
        borderRadius: 2,
        background: ui.border,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: complete ? ui.success : ui.ink,
        }}
      />
    </div>
  );
}

/**
 * Mantine ships badges as bold uppercase, which fights the flat/calm type scale
 * and would double-shout labels that `toDisplay` has already title-cased.
 * Every badge in the app goes through these two components, so overriding the
 * label here is what keeps a status looking the same on every page.
 */
const badgeLabelStyles = {
  label: { fontWeight: 500, textTransform: "none" as const },
};

/** Every badge is flat gray except the two allowed status exceptions. */
export function StatusBadge({ status }: { status: string }) {
  if (status === "ACCEPTED") {
    return (
      <Badge
        variant="filled"
        color="dark"
        size="sm"
        radius={4}
        styles={badgeLabelStyles}
        // The one solid badge in the app, so it has to stay the loudest chip on
        // the row in both schemes. Mantine's own `dark` fill only gets darker in
        // dark mode and would sink into the card; `emphasis` inverts instead.
        style={
          {
            "--badge-bg": ui.emphasis,
            "--badge-color": ui.onEmphasis,
          } as CSSProperties
        }
      >
        {toDisplay(status)}
      </Badge>
    );
  }
  if (status === "REJECTED") {
    return (
      <Badge
        variant="outline"
        color="red"
        size="sm"
        radius={4}
        styles={badgeLabelStyles}
        style={
          {
            "--badge-bg": "transparent",
            "--badge-color": ui.danger,
            "--badge-bd": `1px solid ${ui.danger}`,
          } as CSSProperties
        }
      >
        {toDisplay(status)}
      </Badge>
    );
  }
  return (
    <Badge
      variant="light"
      color="gray"
      size="sm"
      radius={4}
      styles={badgeLabelStyles}
    >
      {toDisplay(status)}
    </Badge>
  );
}

/** Monochrome badge used for duration / track / misc labels. */
export function GrayBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="light"
      color="gray"
      size="sm"
      radius={4}
      styles={badgeLabelStyles}
    >
      {children}
    </Badge>
  );
}

/**
 * Main vs Others.
 *
 * "Main" is the only thing on a school row that should pull the eye before the
 * name does, so it gets an ink outline; "Others" stays in the same quiet gray
 * as every other metadata badge and reads as background noise.
 */
export function PriorityBadge({ priority }: { priority: string }) {
  const label =
    PRIORITY_LABELS[priority as SchoolPriority] ?? toDisplay(priority);

  if (priority === "MAIN") {
    return (
      <Badge
        variant="outline"
        color="dark"
        size="sm"
        radius={4}
        styles={{ label: { fontWeight: 600, textTransform: "none" } }}
        style={
          {
            "--badge-bg": "transparent",
            "--badge-color": ui.ink,
            "--badge-bd": `1px solid ${ui.ink}`,
          } as CSSProperties
        }
      >
        {label}
      </Badge>
    );
  }

  return (
    <Badge
      variant="light"
      color="gray"
      size="sm"
      radius={4}
      styles={badgeLabelStyles}
      style={{ "--badge-color": ui.muted } as CSSProperties}
    >
      {label}
    </Badge>
  );
}

/**
 * Which program option Enes will apply to here — distinct from the booleans
 * describing what the school *offers* (`getWhichLabel`).
 *
 * An undecided pick is a hole in the plan rather than a fact, so it recedes to
 * muted. A note is surfaced on hover; the dotted label is the only affordance
 * telling you there is one, so it is applied exactly when a note exists.
 */
export function ApplyOptionBadge({
  option,
  note,
}: {
  option: string;
  note?: string;
}) {
  const label = APPLY_OPTION_LABELS[option as ApplyOption] ?? toDisplay(option);
  const hasNote = Boolean(note && note.trim());
  const color = option === "UNDECIDED" ? ui.muted : ui.body;

  const badge = (
    <Badge
      variant="light"
      color="gray"
      size="sm"
      radius={4}
      styles={{
        label: {
          fontWeight: 500,
          textTransform: "none",
          borderBottom: hasNote ? `1px dotted ${color}` : undefined,
        },
        root: hasNote ? { cursor: "help" } : undefined,
      }}
      style={{ "--badge-color": color } as CSSProperties}
    >
      {label}
    </Badge>
  );

  if (!hasNote) {
    return badge;
  }

  return (
    <Tooltip
      label={note}
      withArrow
      multiline
      w={220}
      radius={6}
      // A tooltip has to contrast with the surface it floats over, so it takes
      // the inverted `emphasis` pair rather than a fixed dark fill. The arrow
      // inherits the background from the bubble.
      styles={{
        tooltip: {
          fontSize: 12,
          fontWeight: 400,
          lineHeight: 1.4,
          background: ui.emphasis,
          color: ui.onEmphasis,
        },
      }}
    >
      {/* Tooltip needs a DOM node it can attach a ref + listeners to. */}
      <span style={{ display: "inline-flex" }}>{badge}</span>
    </Tooltip>
  );
}

/**
 * The two program flags on one line — "NT ✓ · PRO ✗" — for the layouts that
 * have no room for a column each (cards, mobile).
 *
 * These describe what the *school* offers, which is a different question from
 * the one {@link ApplyOptionBadge} answers, so the marks stay quiet: the label
 * is muted and only the tick carries colour.
 */
export function ProgramMarks({
  school,
}: {
  school: Pick<SchoolRow, "non_thesis_option" | "professional_masters">;
}) {
  const markLabel: CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.4px",
    color: ui.muted,
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
        <span style={markLabel}>NT</span>
        <BoolMark value={school.non_thesis_option} />
      </span>
      <span style={{ color: ui.border }}>·</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
        <span style={markLabel}>PRO</span>
        <BoolMark value={school.professional_masters} />
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sorting                                                                    */
/* -------------------------------------------------------------------------- */

/** "custom" is Enes's own drag-set ranking (`sort_order`), and the default. */
export type SortKey = "custom" | "priority" | "deadline" | "name";

const PRIORITY_ORDER: Record<string, number> = { MAIN: 1, OTHERS: 2 };

/**
 * Comparator for the school lists. Deadlines are ISO strings, so a plain
 * string compare is already chronological; schools without one sink to the
 * bottom instead of pretending to be due at the epoch.
 */
export function compareSchools(
  a: SchoolRow,
  b: SchoolRow,
  sort: SortKey
): number {
  if (sort === "custom") {
    // Rows that predate the feature all sit at 0; they keep a stable
    // alphabetical order among themselves instead of shuffling per render.
    const byOrder = (a.sort_order ?? 0) - (b.sort_order ?? 0);
    return byOrder !== 0 ? byOrder : a.name.localeCompare(b.name);
  }

  if (sort === "name") {
    return a.name.localeCompare(b.name);
  }

  if (sort === "deadline") {
    if (!a.deadline && !b.deadline) {
      return a.name.localeCompare(b.name);
    }
    if (!a.deadline) {
      return 1;
    }
    if (!b.deadline) {
      return -1;
    }
    const byDate = a.deadline.localeCompare(b.deadline);
    return byDate !== 0 ? byDate : a.name.localeCompare(b.name);
  }

  const byPriority =
    (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
  return byPriority !== 0 ? byPriority : a.name.localeCompare(b.name);
}
