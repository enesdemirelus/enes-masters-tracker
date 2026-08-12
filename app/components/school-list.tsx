"use client";

/**
 * Pieces shared by every list that renders schools: the table at `/schools`,
 * its mobile card mirror, and the `/deadlines` roll-up. Keeping them here is
 * what makes a deadline chip or a progress meter look identical in all three.
 */

import type { CSSProperties } from "react";
import { Badge } from "@mantine/core";
import {
  DEFAULT_CHECKLIST,
  deadlineColorHex,
  deadlineInfo,
  toDisplay,
  ui,
  type SchoolFull,
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
    | "tiers"
    | "category"
    | "status"
    | "priority"
    | "ms_status"
    | "logo"
    | "removed"
    | "removal_reason"
    | "gre"
    | "recommendation_count"
    | "non_thesis_option"
    | "professional_masters"
    | "duration"
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

/** Monochrome badge used for tier / category / priority / track labels. */
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

/* -------------------------------------------------------------------------- */
/* Sorting                                                                    */
/* -------------------------------------------------------------------------- */

export type SortKey = "priority" | "deadline" | "name";

const PRIORITY_ORDER: Record<string, number> = { HIGH: 1, MEDIUM: 2, LOW: 3 };

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
