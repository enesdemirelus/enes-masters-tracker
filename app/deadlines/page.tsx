"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { Center, Loader, Title } from "@mantine/core";
import {
  DeadlineChip,
  GrayBadge,
  StatusBadge,
  type SchoolRow,
} from "../components/school-list";
import {
  cardStyle,
  deadlineInfo,
  formatDate,
  notifyError,
  pageTitleStyle,
  sectionLabelStyle,
  toDisplay,
  ui,
} from "../theme";

/** Statuses where the deadline is history rather than something to chase. */
const FINISHED_STATUSES = new Set(["APPLIED", "ACCEPTED", "REJECTED"]);

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "10px 0",
  flexWrap: "wrap",
};

const nameLinkStyle: CSSProperties = {
  color: ui.ink,
  fontSize: 14,
  fontWeight: 500,
  textDecoration: "none",
};

const dateStyle: CSSProperties = {
  fontSize: 12,
  color: ui.body,
  whiteSpace: "nowrap",
};

function Section({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) {
    return null;
  }
  return (
    <div>
      <div style={{ ...sectionLabelStyle, marginBottom: 8 }}>
        {label} · {count}
      </div>
      <div style={{ ...cardStyle, padding: "6px 18px" }}>{children}</div>
    </div>
  );
}

/** Rows inside a section are separated by hairlines, not boxed individually. */
function Row({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <div
      style={{
        ...rowStyle,
        borderTop: index === 0 ? "none" : `1px solid ${ui.border}`,
      }}
    >
      {children}
    </div>
  );
}

/** "✓ applied Jan 3, 2026" / "✓ accepted Feb 2, 2026". */
function finishedNote(school: SchoolRow): string {
  if (school.status === "APPLIED") {
    const when = formatDate(school.applied_date);
    return when ? `✓ applied ${when}` : "✓ applied";
  }
  const when = formatDate(school.decision_date);
  const verb = toDisplay(school.status).toLowerCase();
  return when ? `✓ ${verb} ${when}` : `✓ ${verb}`;
}

export default function DeadlinesPage() {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/get-school");
      if (!response.ok) {
        throw new Error(`Failed to fetch schools: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Unexpected response shape from /api/get-school");
      }
      setSchools(data as SchoolRow[]);
    } catch (error) {
      console.error("Error fetching schools:", error);
      setSchools([]);
      notifyError("Could not load schools", "The deadline list is unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const active = schools.filter((school) => !school.removed);

  const overdue: SchoolRow[] = [];
  const thisWeek: SchoolRow[] = [];
  const later: SchoolRow[] = [];
  const noDeadline: SchoolRow[] = [];
  const finished: SchoolRow[] = [];

  for (const school of active) {
    if (FINISHED_STATUSES.has(school.status)) {
      finished.push(school);
      continue;
    }
    if (!school.deadline) {
      noDeadline.push(school);
      continue;
    }
    const days = deadlineInfo(school.deadline, school.status).days ?? 0;
    if (days < 0) {
      overdue.push(school);
    } else if (days <= 7) {
      thisWeek.push(school);
    } else {
      later.push(school);
    }
  }

  const byDeadline = (a: SchoolRow, b: SchoolRow) =>
    (a.deadline ?? "").localeCompare(b.deadline ?? "");
  overdue.sort(byDeadline);
  thisWeek.sort(byDeadline);
  later.sort(byDeadline);
  noDeadline.sort((a, b) => a.name.localeCompare(b.name));
  // Most recent outcome first — the newest news is the interesting one.
  finished.sort((a, b) => {
    const aDate = a.decision_date ?? a.applied_date ?? a.deadline ?? "";
    const bDate = b.decision_date ?? b.applied_date ?? b.deadline ?? "";
    return bDate.localeCompare(aDate);
  });

  const scheduledRow = (school: SchoolRow, index: number) => (
    <Row key={school.id} index={index}>
      <Link href={`/schools/${school.id}`} style={{ ...nameLinkStyle, flex: 1 }}>
        {school.name}
      </Link>
      <GrayBadge>{toDisplay(school.tiers)}</GrayBadge>
      <span style={dateStyle}>{formatDate(school.deadline)}</span>
      <DeadlineChip deadline={school.deadline} status={school.status} />
      <StatusBadge status={school.status} />
    </Row>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <Title order={1} style={pageTitleStyle}>
          Deadlines
        </Title>
        <div style={{ color: ui.muted, fontSize: 13, marginTop: 4 }}>
          {overdue.length} overdue · {thisWeek.length} due this week ·{" "}
          {later.length} later
        </div>
      </div>

      {loading ? (
        <Center style={{ minHeight: "40vh" }}>
          <Loader color="dark" size="sm" />
        </Center>
      ) : active.length === 0 ? (
        <div
          style={{
            ...cardStyle,
            padding: 20,
            color: ui.muted,
            fontSize: 13,
          }}
        >
          No schools yet
        </div>
      ) : (
        <>
          <Section label="Overdue" count={overdue.length}>
            {overdue.map(scheduledRow)}
          </Section>

          <Section label="Next 7 days" count={thisWeek.length}>
            {thisWeek.map(scheduledRow)}
          </Section>

          <Section label="Later" count={later.length}>
            {later.map(scheduledRow)}
          </Section>

          <Section label="No deadline set" count={noDeadline.length}>
            {noDeadline.map((school, index) => (
              <Row key={school.id} index={index}>
                <Link
                  href={`/schools/${school.id}`}
                  style={{ ...nameLinkStyle, color: ui.body, flex: 1 }}
                >
                  {school.name}
                </Link>
                <GrayBadge>{toDisplay(school.tiers)}</GrayBadge>
                <Link
                  href={`/schools/${school.id}`}
                  style={{ ...dateStyle, color: ui.muted, textDecoration: "none" }}
                >
                  set date →
                </Link>
              </Row>
            ))}
          </Section>

          <Section label="Done" count={finished.length}>
            {finished.map((school, index) => (
              <Row key={school.id} index={index}>
                <Link
                  href={`/schools/${school.id}`}
                  style={{ ...nameLinkStyle, color: ui.body, flex: 1 }}
                >
                  {school.name}
                </Link>
                <GrayBadge>{toDisplay(school.tiers)}</GrayBadge>
                <span style={{ ...dateStyle, color: ui.muted }}>
                  {finishedNote(school)}
                </span>
                <StatusBadge status={school.status} />
              </Row>
            ))}
          </Section>
        </>
      )}
    </div>
  );
}
