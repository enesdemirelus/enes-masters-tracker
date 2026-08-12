"use client";

import { useEffect, useState } from "react";
import { Group, Stack, Text } from "@mantine/core";
import { DeadlineChip } from "@/app/components/school-list";
import {
  dateInputStyle,
  deadlineInfo,
  fromDateInputValue,
  toDateInputValue,
  ui,
  type SchoolFull,
} from "@/app/theme";
import { ClearButton, DetailCard, DetailRow, type PatchSchool } from "./DetailCard";

/**
 * A native date input fires `change` on every keystroke, so a half-typed year
 * arrives as "0002-01-15". Only committing complete, plausible dates keeps
 * those intermediate values out of the database.
 */
function isCommittable(value: string): boolean {
  if (!value) {
    return true;
  }
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number(value.slice(0, 4)) >= 1000;
}

function EditableDate({
  value,
  ariaLabel,
  onCommit,
}: {
  value: string;
  ariaLabel: string;
  onCommit: (next: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  // The saved value wins whenever the school is refetched or patched.
  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleChange = (next: string) => {
    setDraft(next);
    if (isCommittable(next)) {
      onCommit(next);
    }
  };

  return (
    <Group gap={2} wrap="nowrap" justify="flex-end">
      <input
        type="date"
        aria-label={ariaLabel}
        value={draft}
        onChange={(event) => handleChange(event.currentTarget.value)}
        style={{ ...dateInputStyle, width: 156 }}
      />
      <ClearButton
        label={`Clear ${ariaLabel}`}
        visible={draft !== ""}
        onClick={() => handleChange("")}
      />
    </Group>
  );
}

export default function KeyDatesCard({
  school,
  onPatch,
}: {
  school: SchoolFull;
  onPatch: PatchSchool;
}) {
  const countdown = deadlineInfo(school.deadline, school.status);

  const commit = (
    field: "deadline" | "applied_date" | "decision_date",
    label: string,
    next: string
  ) => {
    const parsed = fromDateInputValue(next);
    onPatch({ [field]: parsed }, parsed ? `${label} updated.` : `${label} cleared.`);
  };

  return (
    <DetailCard title="Key dates">
      <Stack gap={6}>
        <DetailRow
          label="Deadline"
          value={
            <EditableDate
              ariaLabel="Deadline"
              value={toDateInputValue(school.deadline)}
              onCommit={(next) => commit("deadline", "Deadline", next)}
            />
          }
        />
        {/* The date itself is already in the input above, so only a real
            countdown earns a chip here. */}
        {countdown.countdown ? (
          <Group justify="flex-end" mt={-4} mb={2}>
            <DeadlineChip deadline={school.deadline} status={school.status} />
          </Group>
        ) : null}
        <DetailRow
          label="Applied on"
          value={
            <EditableDate
              ariaLabel="Applied on"
              value={toDateInputValue(school.applied_date)}
              onCommit={(next) => commit("applied_date", "Applied date", next)}
            />
          }
        />
        <DetailRow
          label="Decision on"
          value={
            <EditableDate
              ariaLabel="Decision on"
              value={toDateInputValue(school.decision_date)}
              onCommit={(next) => commit("decision_date", "Decision date", next)}
            />
          }
        />
      </Stack>
      {!school.deadline ? (
        <Text size="xs" c={ui.muted} mt={8}>
          No deadline set yet.
        </Text>
      ) : null}
    </DetailCard>
  );
}
