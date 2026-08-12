"use client";

import { Stack, Text } from "@mantine/core";
import {
  APPLY_OPTION_LABELS,
  getWhichLabel,
  PRIORITY_LABELS,
  toDisplay,
  ui,
  type SchoolFull,
} from "@/app/theme";
import { BoolMark, DetailCard, DetailRow } from "./DetailCard";

/**
 * The apply-option label with its note underneath.
 *
 * Lists show the note as a hover tooltip to stay compact; this card is the
 * place you land to read the details, so it prints inline instead.
 */
function ApplyOptionValue({ school }: { school: SchoolFull }) {
  const note = school.apply_option_note?.trim();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 2,
      }}
    >
      <Text size="sm" c={ui.ink}>
        {APPLY_OPTION_LABELS[school.apply_option] ??
          toDisplay(school.apply_option)}
      </Text>
      {note ? (
        <Text size="xs" c={ui.muted} style={{ lineHeight: 1.35 }}>
          {note}
        </Text>
      ) : null}
    </div>
  );
}

/** Read-only mirror of the fields the Edit modal owns. */
export default function ProgramDetailsCard({ school }: { school: SchoolFull }) {
  return (
    <DetailCard title="Program details">
      <Stack gap={2}>
        <DetailRow
          label="Priority"
          value={PRIORITY_LABELS[school.priority] ?? toDisplay(school.priority)}
        />
        <DetailRow
          label="Applying as"
          value={<ApplyOptionValue school={school} />}
        />
        <DetailRow label="GRE" value={toDisplay(school.gre)} />
        <DetailRow
          label="Recommendation letters"
          value={
            typeof school.recommendation_count === "number"
              ? String(school.recommendation_count)
              : "—"
          }
        />
        <DetailRow
          label="Non-thesis option"
          value={<BoolMark value={school.non_thesis_option} />}
        />
        <DetailRow
          label="Professional masters"
          value={<BoolMark value={school.professional_masters} />}
        />
        <DetailRow label="Which?" value={getWhichLabel(school)} />
        <DetailRow label="Duration" value={school.duration?.trim() || "—"} />
      </Stack>
    </DetailCard>
  );
}
