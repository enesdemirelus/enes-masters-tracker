"use client";

import { Stack } from "@mantine/core";
import { getWhichLabel, toDisplay, type SchoolFull } from "@/app/theme";
import { BoolMark, DetailCard, DetailRow } from "./DetailCard";

/** Read-only mirror of the fields the Edit modal owns. */
export default function ProgramDetailsCard({ school }: { school: SchoolFull }) {
  return (
    <DetailCard title="Program details">
      <Stack gap={2}>
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
        <DetailRow label="MS status" value={toDisplay(school.ms_status)} />
      </Stack>
    </DetailCard>
  );
}
