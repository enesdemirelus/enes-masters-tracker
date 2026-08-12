"use client";

import type { ReactNode } from "react";
import { ActionIcon, Group, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { cardStyle, ui } from "@/app/theme";

/**
 * Sends a partial update to `/api/schools/[id]`, stores the returned school
 * (relations included) and reports whether it stuck. `message` is the body of
 * the "Saved" toast.
 */
export type PatchSchool = (
  body: Record<string, unknown>,
  message: string
) => Promise<boolean>;

/**
 * Refetches the school from the server and republishes it to the page.
 *
 * Cards call this when an optimistic write fails: rolling back to a snapshot
 * taken before the request would also undo any sibling mutation that landed
 * while it was in flight, so the server gets the last word instead.
 */
export type RefreshSchool = () => Promise<void>;

/** White panel with a 14px title row; every detail card is built on this. */
export function DetailCard({
  title,
  right,
  children,
}: {
  title: string;
  /** Optional node pinned to the right of the title (counter, button, …). */
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section style={{ ...cardStyle, padding: 16 }}>
      <Group justify="space-between" align="center" wrap="nowrap" mb={12}>
        <Text fw={600} c={ui.ink} style={{ fontSize: 14 }}>
          {title}
        </Text>
        {right}
      </Group>
      {children}
    </section>
  );
}

/** Label on the left, value (text or control) on the right. */
export function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        minHeight: 30,
      }}
    >
      <Text size="sm" c={ui.body} style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <div style={{ minWidth: 0, textAlign: "right" }}>
        {typeof value === "string" || typeof value === "number" ? (
          <Text size="sm" c={ui.ink}>
            {value}
          </Text>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

/** ✓ / ✗ for the boolean program flags. */
export function BoolMark({ value }: { value?: boolean | null }) {
  return (
    <Text component="span" size="sm" fw={600} c={value ? ui.success : ui.muted}>
      {value ? "✓" : "✗"}
    </Text>
  );
}

/**
 * Tiny gray ✕. Rows pass `visible={false}` to keep it in the layout but out of
 * sight until the row is hovered, so the list stays quiet at rest.
 */
export function ClearButton({
  label,
  onClick,
  visible = true,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  visible?: boolean;
  disabled?: boolean;
}) {
  return (
    <ActionIcon
      variant="subtle"
      color="gray"
      size="sm"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        visibility: visible ? "visible" : "hidden",
        color: ui.muted,
      }}
    >
      <IconX size={14} stroke={1.5} />
    </ActionIcon>
  );
}
