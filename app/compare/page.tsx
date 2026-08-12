"use client";

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Center, Loader, MultiSelect, Table, Title } from "@mantine/core";
import {
  checklistProgress,
  DeadlineChip,
  ProgressMeter,
  StatusBadge,
} from "@/app/components/school-list";
import {
  APPLY_OPTION_LABELS,
  cardStyle,
  formatDate,
  getWhichLabel,
  inputStyles,
  notifyError,
  pageTitleStyle,
  PRIORITY_LABELS,
  toDisplay,
  ui,
  type SchoolFull,
} from "@/app/theme";

/* -------------------------------------------------------------------------- */
/* Types & constants                                                          */
/* -------------------------------------------------------------------------- */

/** The `/api/get-school` row shape, plus the thin checklist slice it includes. */
interface CompareSchool
  extends Pick<
    SchoolFull,
    | "id"
    | "name"
    | "location"
    | "status"
    | "priority"
    | "apply_option"
    | "apply_option_note"
    | "gre"
    | "recommendation_count"
    | "non_thesis_option"
    | "professional_masters"
    | "duration"
    | "deadline"
    | "application_fee"
    | "more_info_notes"
    | "removed"
  > {
  checklist: Array<{ done: boolean }>;
}

const MAX_COMPARED = 4;
const STORAGE_KEY = "masters-tracker:compare-selection";
const NOTES_PREVIEW = 120;

const cardPadStyle: CSSProperties = { ...cardStyle, padding: 20 };

const labelCellStyle: CSSProperties = {
  position: "sticky",
  left: 0,
  zIndex: 1,
  background: ui.surface,
  color: ui.body,
  fontSize: 13,
  fontWeight: 500,
  whiteSpace: "nowrap",
  borderRight: `1px solid ${ui.border}`,
  minWidth: 150,
};

const valueCellStyle: CSSProperties = {
  color: ui.ink,
  fontSize: 13,
  verticalAlign: "top",
  minWidth: 190,
};

const headerCellStyle: CSSProperties = {
  verticalAlign: "top",
  minWidth: 190,
};

/* -------------------------------------------------------------------------- */
/* Cell renderers                                                             */
/* -------------------------------------------------------------------------- */

function Muted({ children }: { children: ReactNode }) {
  return <span style={{ color: ui.muted }}>{children}</span>;
}

/** ✓ green when true, ✗ muted when false — no red, a missing option is not an error. */
function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <span style={{ color: ui.success, fontWeight: 600 }}>✓</span>
  ) : (
    <Muted>✗</Muted>
  );
}

/** Which option Enes applies to, with his note printed underneath when set. */
function ApplyOptionCell({ school }: { school: CompareSchool }) {
  const note = school.apply_option_note?.trim();
  const label =
    APPLY_OPTION_LABELS[school.apply_option] ?? toDisplay(school.apply_option);

  if (!note) {
    return <span>{label}</span>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span>{label}</span>
      <span style={{ color: ui.muted, fontSize: 12, lineHeight: 1.35 }}>
        {note}
      </span>
    </div>
  );
}

function DeadlineCell({ school }: { school: CompareSchool }) {
  if (!school.deadline) {
    return <Muted>—</Muted>;
  }

  // `alignItems` keeps the chip at its natural width — a column flex would
  // otherwise stretch it across the whole cell.
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 4,
      }}
    >
      <span>{formatDate(school.deadline)}</span>
      <DeadlineChip deadline={school.deadline} status={school.status} />
    </div>
  );
}

function ChecklistCell({ school }: { school: CompareSchool }) {
  // A school whose checklist has not been seeded yet still compares against the
  // default template length, so the columns stay on the same scale.
  const { done, total, ratio, complete } = checklistProgress(school);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontWeight: 600, color: complete ? ui.success : ui.ink }}>
        {done}/{total}
      </span>
      <ProgressMeter ratio={ratio} complete={complete} width={140} />
    </div>
  );
}

const ROWS: Array<{ label: string; render: (school: CompareSchool) => ReactNode }> =
  [
    {
      label: "Status",
      render: (school) => <StatusBadge status={school.status} />,
    },
    {
      label: "Priority",
      render: (school) =>
        PRIORITY_LABELS[school.priority] ?? toDisplay(school.priority),
    },
    {
      label: "Applying as",
      render: (school) => <ApplyOptionCell school={school} />,
    },
    { label: "GRE", render: (school) => toDisplay(school.gre) },
    {
      label: "Recommendation letters",
      render: (school) => school.recommendation_count,
    },
    {
      label: "Non-thesis",
      render: (school) => <BoolCell value={school.non_thesis_option === true} />,
    },
    {
      label: "Professional masters",
      render: (school) => (
        <BoolCell value={school.professional_masters === true} />
      ),
    },
    { label: "Which?", render: (school) => getWhichLabel(school) },
    {
      label: "Duration",
      render: (school) =>
        school.duration?.trim() ? school.duration : <Muted>—</Muted>,
    },
    { label: "Deadline", render: (school) => <DeadlineCell school={school} /> },
    {
      label: "Application fee",
      render: (school) =>
        school.application_fee == null ? (
          <Muted>—</Muted>
        ) : (
          `$${school.application_fee.toLocaleString("en-US")}`
        ),
    },
    {
      label: "Checklist progress",
      render: (school) => <ChecklistCell school={school} />,
    },
    {
      label: "Notes",
      render: (school) => {
        const notes = school.more_info_notes?.trim();
        if (!notes) {
          return <Muted>—</Muted>;
        }
        const preview =
          notes.length > NOTES_PREVIEW
            ? `${notes.slice(0, NOTES_PREVIEW).trimEnd()}…`
            : notes;
        return <span style={{ color: ui.body }}>{preview}</span>;
      },
    },
  ];

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ComparePage() {
  const [schools, setSchools] = useState<CompareSchool[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/get-school");
      if (!response.ok) {
        throw new Error(`Failed to fetch schools: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Unexpected response shape from /api/get-school");
      }
      setSchools(data as CompareSchool[]);
    } catch (error) {
      console.error("Error fetching schools:", error);
      setSchools([]);
      notifyError("Could not load schools", "The comparison is unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Restore after mount only: reading localStorage during render would not
  // match the server-rendered markup.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSelected(
          parsed
            .filter((id): id is string => typeof id === "string")
            .slice(0, MAX_COMPARED)
        );
      }
    } catch (error) {
      console.error("Error reading the saved comparison:", error);
    }
  }, []);

  const activeSchools = schools.filter(
    (school) => !school.removed && school.status !== "REMOVED"
  );
  const options = activeSchools.map((school) => ({
    value: school.id,
    label: school.name,
  }));

  /**
   * The stored ids can outlive their schools, so the select is fed the pruned
   * list; its next onChange writes that pruned list back to state and storage.
   */
  const available = new Set(options.map((option) => option.value));
  const visible = selected.filter((id) => available.has(id));

  const handleChange = (value: string[]) => {
    if (value.length > MAX_COMPARED) {
      notifyError(
        "Too many schools",
        `Compare up to ${MAX_COMPARED} schools at a time.`
      );
      return;
    }

    setSelected(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving the comparison:", error);
    }
  };

  const columns = visible
    .map((id) => activeSchools.find((school) => school.id === id))
    .filter((school): school is CompareSchool => school !== undefined);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header ----------------------------------------------------------- */}
      <div>
        <Title order={1} style={pageTitleStyle}>
          Compare
        </Title>
        <div style={{ color: ui.muted, fontSize: 13, marginTop: 4 }}>
          Side-by-side program comparison
        </div>
      </div>

      {/* Picker ----------------------------------------------------------- */}
      <div style={cardPadStyle}>
        <MultiSelect
          label="Schools"
          placeholder={
            visible.length === 0 ? "Pick 2–4 schools…" : undefined
          }
          data={options}
          value={visible}
          onChange={handleChange}
          // The pruned `visible` list is only trustworthy once the schools are
          // in: editing mid-load would persist an empty selection.
          disabled={loading}
          searchable
          clearable
          nothingFoundMessage="No schools"
          size="md"
          radius="md"
          styles={inputStyles}
        />
        <div style={{ marginTop: 8, fontSize: 12, color: ui.muted }}>
          {visible.length}/{MAX_COMPARED} selected
        </div>
      </div>

      {/* Table ------------------------------------------------------------ */}
      {loading ? (
        <Center style={{ minHeight: "40vh" }}>
          <Loader color={ui.emphasis} size="sm" />
        </Center>
      ) : columns.length < 2 ? (
        <div style={{ ...cardPadStyle, color: ui.muted, fontSize: 13 }}>
          Pick at least two schools to compare.
        </div>
      ) : (
        <div style={{ ...cardStyle, overflowX: "auto" }}>
          <Table
            verticalSpacing="sm"
            horizontalSpacing="md"
            withRowBorders
            styles={{
              table: { "--table-border-color": ui.border } as CSSProperties,
            }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={labelCellStyle} />
                {columns.map((school) => (
                  <Table.Th key={school.id} style={headerCellStyle}>
                    <Link
                      href={`/schools/${school.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        style={{ fontSize: 14, fontWeight: 600, color: ui.ink }}
                      >
                        {school.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 400,
                          color: ui.muted,
                          marginTop: 2,
                        }}
                      >
                        {school.location}
                      </div>
                    </Link>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {ROWS.map((row) => (
                <Table.Tr key={row.label}>
                  <Table.Td style={labelCellStyle}>{row.label}</Table.Td>
                  {columns.map((school) => (
                    <Table.Td key={school.id} style={valueCellStyle}>
                      {row.render(school)}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
