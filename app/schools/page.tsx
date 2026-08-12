"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  Button,
  Center,
  Loader,
  SegmentedControl,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconEdit,
  IconGripVertical,
  IconLayoutGrid,
  IconLayoutList,
  IconSearch,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useIsMobile } from "@/lib/use-mobile";
import MobileSchoolsView from "../components/MobileSchoolsView";
import SchoolLogo from "../components/SchoolLogo";
import { BoolMark } from "../components/detail/DetailCard";
import {
  ApplyOptionBadge,
  checklistProgress,
  compareSchools,
  DeadlineChip,
  PriorityBadge,
  ProgramMarks,
  ProgressMeter,
  StatusBadge,
  type SchoolRow,
  type SortKey,
} from "../components/school-list";
import AddSchoolDesktopModal from "../modals/AddSchoolDesktopModal";
import EditSchoolDesktopModal from "../modals/EditSchoolDesktopModal";
import {
  APPLY_OPTION_LABELS,
  cardStyle,
  errorMessage,
  formatDate,
  inputStyles,
  notifyError,
  pageTitleStyle,
  PRIORITY_LABELS,
  primaryButtonStyle,
  toDisplay,
  ui,
  type SchoolStatus,
} from "../theme";

/** "custom" first and default: it is Enes's own ranking from the spreadsheet. */
const SORT_OPTIONS = [
  { label: "Custom", value: "custom" },
  { label: "Priority", value: "priority" },
  { label: "Deadline", value: "deadline" },
  { label: "Name", value: "name" },
];

const SORT_KEYS = new Set(SORT_OPTIONS.map((option) => option.value));

/** How the desktop page paints the schools. Mobile always uses its own cards. */
type SchoolsView = "list" | "cards";

const VIEW_KEYS = new Set<string>(["list", "cards"]);

const VIEW_STORAGE_KEY = "masters-tracker:schools-view";
const SORT_STORAGE_KEY = "masters-tracker:schools-sort";

/** Order the status tallies read in, roughly the life cycle of an application. */
const STATUS_SUMMARY_ORDER: SchoolStatus[] = [
  "APPLYING",
  "APPLIED",
  "ACCEPTED",
  "REJECTED",
];

/** Section-label type, reused by the header cells and the "Removed" dividers. */
const labelType: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: ui.muted,
};

const headerCellStyle: CSSProperties = {
  ...labelType,
  textAlign: "center",
  padding: "10px 8px",
  whiteSpace: "nowrap",
};

const leftHeaderCellStyle: CSSProperties = {
  ...headerCellStyle,
  textAlign: "left",
};

const centerCellStyle: CSSProperties = { textAlign: "center" };

export default function SchoolsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("custom");
  const [view, setView] = useState<SchoolsView>("list");
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [editTarget, setEditTarget] = useState<SchoolRow | null>(null);

  /* Drag-to-reorder state. `armedId` exists because the whole row is the drag
     source but only the handle may start a drag: it is set on mousedown over
     the handle and is what flips `draggable` on. */
  const [armedId, setArmedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);

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
      notifyError("Could not load schools", "The school list is unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* Preferences are read after mount rather than in a lazy initialiser: this
     component is server-rendered first, and seeding state from localStorage
     would make the first client render disagree with that markup. */
  useEffect(() => {
    const storedView = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (storedView && VIEW_KEYS.has(storedView)) {
      setView(storedView as SchoolsView);
    }
    const storedSort = window.localStorage.getItem(SORT_STORAGE_KEY);
    if (storedSort && SORT_KEYS.has(storedSort)) {
      setSort(storedSort as SortKey);
    }
  }, []);

  const chooseView = (next: SchoolsView) => {
    setView(next);
    window.localStorage.setItem(VIEW_STORAGE_KEY, next);
  };

  const chooseSort = (next: SortKey) => {
    setSort(next);
    window.localStorage.setItem(SORT_STORAGE_KEY, next);
  };

  const query = searchQuery.trim().toLowerCase();
  const matches = (school: SchoolRow) => {
    if (!query) {
      return true;
    }
    // Both the stored enum value and its display label are searchable, so
    // "non-thesis" finds a NON_THESIS school and "main" finds a MAIN one.
    return [
      school.name,
      school.location,
      school.status,
      school.priority,
      PRIORITY_LABELS[school.priority],
      school.apply_option,
      APPLY_OPTION_LABELS[school.apply_option],
      school.apply_option_note,
      school.duration,
    ].some((field) => (field ?? "").toLowerCase().includes(query));
  };

  const visible = schools.filter(matches);
  // Removed schools keep their own block at the bottom whatever the sort is.
  const activeSchools = visible
    .filter((school) => !school.removed)
    .sort((a, b) => compareSchools(a, b, sort));
  const removedSchools = visible
    .filter((school) => school.removed)
    .sort((a, b) => compareSchools(a, b, sort));

  /*
   * Dragging is only offered where the drop actually means something: the list
   * has to be showing the manual order, and it has to be showing *all* of it —
   * moving a row two places down a filtered list says nothing about where it
   * belongs among the rows the filter is hiding. Touch has no drag affordance
   * here at all, so the mobile card list stays read-only.
   */
  const canReorder =
    isMobile === false && view === "list" && sort === "custom" && !query;

  const mainCount = activeSchools.filter(
    (school) => school.priority === "MAIN"
  ).length;
  const statusCounts = STATUS_SUMMARY_ORDER.map((status) => ({
    status,
    count: activeSchools.filter((school) => school.status === status).length,
  })).filter((entry) => entry.count > 0);

  const startEdit = (school: SchoolRow) => {
    setEditTarget(school);
    openEdit();
  };

  const openDetail = (school: SchoolRow) => {
    router.push(`/schools/${school.id}`);
  };

  /* ---------------------------------------------------------------------- */
  /* Reordering                                                             */
  /* ---------------------------------------------------------------------- */

  const clearDrag = () => {
    setArmedId(null);
    setDragId(null);
    setDropIndex(null);
  };

  // Escape aborts the drag natively in most browsers, but only after a dragend
  // that some of them still pair with a drop; dropping the target index makes
  // the cancel unambiguous either way.
  useEffect(() => {
    if (!dragId) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDropIndex(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dragId]);

  /**
   * Moves `id` to `targetIndex` in the active list and persists the whole
   * ranking.
   *
   * The request carries every school — active rows in their new order, then the
   * removed ones — because the endpoint rewrites `sort_order` to the index of
   * each id it receives. Sending only the active rows would hand the removed
   * ones' numbers out twice.
   */
  const commitReorder = async (id: string, targetIndex: number) => {
    const from = activeSchools.findIndex((school) => school.id === id);
    if (from < 0) {
      return;
    }
    // The target index is expressed against the list *before* the row is
    // lifted out, so a downward move loses one slot to its own removal.
    const to = targetIndex > from ? targetIndex - 1 : targetIndex;
    if (to === from || to < 0) {
      return;
    }

    const nextActive = [...activeSchools];
    const [moved] = nextActive.splice(from, 1);
    nextActive.splice(to, 0, moved);

    const orderedIds = [
      ...nextActive.map((school) => school.id),
      ...removedSchools.map((school) => school.id),
    ];
    const ranks = new Map(orderedIds.map((schoolId, index) => [schoolId, index + 1]));

    // Optimistic: the list is sorted by `sort_order`, so restamping it in state
    // is what makes the row appear in its new place immediately.
    setSchools((previous) =>
      previous.map((school) =>
        ranks.has(school.id)
          ? { ...school, sort_order: ranks.get(school.id) as number }
          : school
      )
    );

    setReordering(true);
    try {
      const response = await fetch("/api/schools/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? `Reorder failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Error reordering schools:", error);
      notifyError(
        "Could not save the new order",
        errorMessage(error, "The list has been put back the way it was.")
      );
      // The server never took the write, so it — not a local snapshot — is the
      // thing that knows the real order.
      await load();
    } finally {
      setReordering(false);
    }
  };

  const handleDragStart = (event: DragEvent<HTMLTableRowElement>, id: string) => {
    if (armedId !== id) {
      // A drag that did not start on the handle (text selection, a stray
      // gesture on the row) is not a reorder.
      event.preventDefault();
      return;
    }
    setDragId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (
    event: DragEvent<HTMLTableRowElement>,
    index: number
  ) => {
    if (!dragId) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const bounds = event.currentTarget.getBoundingClientRect();
    const after = event.clientY - bounds.top > bounds.height / 2;
    setDropIndex(after ? index + 1 : index);
  };

  const handleDrop = (event: DragEvent<HTMLTableRowElement>) => {
    event.preventDefault();
    const id = dragId;
    const target = dropIndex;
    clearDrag();
    if (id && target !== null) {
      commitReorder(id, target);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* List view                                                              */
  /* ---------------------------------------------------------------------- */

  const columnCount = canReorder ? 11 : 10;

  const renderRow = (school: SchoolRow, index: number, isRemoved: boolean) => {
    const progress = checklistProgress(school);
    // The accent survives every sort order, so a flagship school stays findable
    // even when the list is ordered by deadline or name.
    const isMain = !isRemoved && school.priority === "MAIN";
    const draggable = canReorder && !isRemoved && !reordering;
    const isDragging = dragId === school.id;
    // The insertion line is drawn on the row it would push down, and on the
    // bottom edge of the last row when the drop lands past the end.
    const lineAbove = draggable && dropIndex === index;
    const lineBelow =
      draggable &&
      dropIndex === activeSchools.length &&
      index === activeSchools.length - 1;

    const rowAccent = (first: boolean): CSSProperties | undefined => {
      const shadows: string[] = [];
      if (first && isMain) {
        // `box-shadow` rather than `border-left`: the table collapses its
        // borders, so a real border would shift the cell's content.
        shadows.push(`inset 3px 0 0 0 ${ui.ink}`);
      }
      if (lineAbove) {
        shadows.push(`inset 0 2px 0 0 ${ui.ink}`);
      }
      if (lineBelow) {
        shadows.push(`inset 0 -2px 0 0 ${ui.ink}`);
      }
      return shadows.length ? { boxShadow: shadows.join(", ") } : undefined;
    };

    return (
      <Table.Tr
        key={school.id}
        draggable={armedId === school.id}
        onDragStart={(event) => handleDragStart(event, school.id)}
        onDragOver={
          draggable ? (event) => handleDragOver(event, index) : undefined
        }
        onDrop={draggable ? handleDrop : undefined}
        onDragEnd={clearDrag}
        onClick={() => openDetail(school)}
        style={{
          cursor: "pointer",
          opacity: isRemoved ? 0.6 : isDragging ? 0.4 : 1,
          backgroundColor: isRemoved ? ui.subtle : undefined,
        }}
      >
        {canReorder && (
          <Table.Td
            style={{
              ...centerCellStyle,
              padding: "0 4px",
              ...rowAccent(true),
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {!isRemoved && (
              <span
                aria-hidden
                onMouseDown={() => {
                  if (!reordering) {
                    setArmedId(school.id);
                  }
                }}
                onMouseUp={() => setArmedId(null)}
                style={{
                  display: "inline-flex",
                  color: ui.muted,
                  cursor: reordering ? "progress" : "grab",
                  padding: "4px 2px",
                }}
              >
                <IconGripVertical size={15} stroke={1.5} />
              </span>
            )}
          </Table.Td>
        )}

        <Table.Td style={rowAccent(!canReorder)}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 0,
            }}
          >
            <SchoolLogo school={school} size={28} />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isRemoved ? ui.body : ui.ink,
                }}
              >
                {school.name}
              </div>
              <div style={{ fontSize: 12, color: ui.muted, marginTop: 2 }}>
                {school.location}
                {isRemoved && school.removal_reason
                  ? ` · ${school.removal_reason}`
                  : ""}
              </div>
            </div>
          </div>
        </Table.Td>

        <Table.Td style={{ ...centerCellStyle, ...rowAccent(false) }}>
          <PriorityBadge priority={school.priority} />
        </Table.Td>

        <Table.Td style={{ ...centerCellStyle, ...rowAccent(false) }}>
          <ApplyOptionBadge
            option={school.apply_option}
            note={school.apply_option_note}
          />
        </Table.Td>

        <Table.Td style={{ ...centerCellStyle, ...rowAccent(false) }}>
          <StatusBadge status={school.status} />
        </Table.Td>

        <Table.Td style={{ ...centerCellStyle, ...rowAccent(false) }}>
          {school.deadline ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                style={{ fontSize: 13, color: ui.body, whiteSpace: "nowrap" }}
              >
                {formatDate(school.deadline)}
              </span>
              <DeadlineChip
                deadline={school.deadline}
                status={school.status}
              />
            </div>
          ) : (
            <span style={{ color: ui.muted }}>—</span>
          )}
        </Table.Td>

        {/* The two program flags get a column each, spreadsheet-style: they are
            facts about the school and are read down the column, not per row. */}
        <Table.Td style={{ ...centerCellStyle, ...rowAccent(false) }}>
          <BoolMark value={school.non_thesis_option} />
        </Table.Td>

        <Table.Td style={{ ...centerCellStyle, ...rowAccent(false) }}>
          <BoolMark value={school.professional_masters} />
        </Table.Td>

        <Table.Td
          style={{
            ...centerCellStyle,
            fontSize: 13,
            color: school.duration ? ui.body : ui.muted,
            ...rowAccent(false),
          }}
        >
          {school.duration || "—"}
        </Table.Td>

        <Table.Td style={{ ...centerCellStyle, ...rowAccent(false) }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: progress.complete ? ui.success : ui.body,
              }}
            >
              {progress.done}/{progress.total}
            </span>
            <ProgressMeter
              ratio={progress.ratio}
              complete={progress.complete}
            />
          </div>
        </Table.Td>

        <Table.Td style={{ ...centerCellStyle, ...rowAccent(false) }}>
          <ActionIcon
            variant="subtle"
            size="md"
            radius={6}
            aria-label={`Edit ${school.name}`}
            style={{ color: ui.muted }}
            onClick={(event) => {
              event.stopPropagation();
              startEdit(school);
            }}
          >
            <IconEdit size={16} />
          </ActionIcon>
        </Table.Td>
      </Table.Tr>
    );
  };

  const listView = (
    <div style={{ ...cardStyle, overflow: "hidden" }}>
      <Table.ScrollContainer minWidth={canReorder ? 1060 : 1032}>
        <Table
          highlightOnHover
          highlightOnHoverColor={ui.subtle}
          withRowBorders
          borderColor={ui.border}
          verticalSpacing="sm"
          horizontalSpacing="sm"
          style={{ backgroundColor: ui.surface }}
        >
          <Table.Thead style={{ backgroundColor: ui.canvas }}>
            <Table.Tr>
              {canReorder && <Table.Th style={{ width: 28 }} />}
              <Table.Th style={leftHeaderCellStyle}>School</Table.Th>
              <Table.Th style={{ ...headerCellStyle, width: 80 }}>
                Priority
              </Table.Th>
              <Table.Th style={{ ...headerCellStyle, width: 108 }}>
                Applying as
              </Table.Th>
              <Table.Th style={{ ...headerCellStyle, width: 92 }}>
                Status
              </Table.Th>
              <Table.Th style={{ ...headerCellStyle, width: 116 }}>
                Deadline
              </Table.Th>
              <Table.Th style={{ ...headerCellStyle, width: 78 }}>
                Non-Thesis
              </Table.Th>
              <Table.Th style={{ ...headerCellStyle, width: 88 }}>
                Professional
              </Table.Th>
              <Table.Th style={{ ...headerCellStyle, width: 108 }}>
                Duration
              </Table.Th>
              <Table.Th style={{ ...headerCellStyle, width: 82 }}>
                Progress
              </Table.Th>
              <Table.Th style={{ ...headerCellStyle, width: 46 }} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {activeSchools.map((school, index) =>
              renderRow(school, index, false)
            )}

            {activeSchools.length === 0 && removedSchools.length === 0 && (
              <Table.Tr>
                <Table.Td
                  colSpan={columnCount}
                  style={{
                    textAlign: "center",
                    color: ui.muted,
                    fontSize: 13,
                    padding: "36px 16px",
                  }}
                >
                  {schools.length === 0
                    ? "No schools yet — add the first one."
                    : `No schools match “${searchQuery.trim()}”.`}
                </Table.Td>
              </Table.Tr>
            )}

            {removedSchools.length > 0 && (
              <Table.Tr>
                <Table.Td
                  colSpan={columnCount}
                  style={{
                    ...labelType,
                    backgroundColor: ui.canvas,
                    borderTop: `1px solid ${ui.border}`,
                    padding: "8px 16px",
                  }}
                >
                  Removed · {removedSchools.length}
                </Table.Td>
              </Table.Tr>
            )}
            {removedSchools.map((school, index) =>
              renderRow(school, index, true)
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </div>
  );

  /* ---------------------------------------------------------------------- */
  /* Cards view                                                             */
  /* ---------------------------------------------------------------------- */

  const renderCard = (school: SchoolRow, isRemoved: boolean) => {
    const progress = checklistProgress(school);
    const isMain = !isRemoved && school.priority === "MAIN";

    return (
      <div
        key={school.id}
        role="link"
        tabIndex={0}
        onClick={() => openDetail(school)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            openDetail(school);
          }
        }}
        style={{
          ...cardStyle,
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          cursor: "pointer",
          opacity: isRemoved ? 0.6 : 1,
          // Spelled out rather than inherited from `cardStyle`: that object only
          // carries the `border` shorthand, so a longhand read off it would be
          // undefined and would wipe the left border on non-flagship cards.
          borderLeft: isMain
            ? `3px solid ${ui.ink}`
            : `1px solid ${ui.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            minWidth: 0,
          }}
        >
          <SchoolLogo school={school} size={30} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                lineHeight: 1.3,
                color: isRemoved ? ui.body : ui.ink,
              }}
            >
              {school.name}
            </div>
            <div style={{ fontSize: 11.5, color: ui.muted, marginTop: 2 }}>
              {school.location}
              {isRemoved && school.removal_reason
                ? ` · ${school.removal_reason}`
                : ""}
            </div>
          </div>
          <ActionIcon
            variant="subtle"
            size="sm"
            radius={6}
            aria-label={`Edit ${school.name}`}
            style={{ color: ui.muted, flexShrink: 0 }}
            onClick={(event) => {
              event.stopPropagation();
              startEdit(school);
            }}
          >
            <IconEdit size={14} />
          </ActionIcon>
        </div>

        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 6, rowGap: 6 }}
        >
          <PriorityBadge priority={school.priority} />
          <StatusBadge status={school.status} />
          <ApplyOptionBadge
            option={school.apply_option}
            note={school.apply_option_note}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            paddingTop: 8,
            borderTop: `1px solid ${ui.border}`,
          }}
        >
          <ProgramMarks school={school} />
          <span
            style={{
              fontSize: 12,
              color: school.duration ? ui.body : ui.muted,
              whiteSpace: "nowrap",
            }}
          >
            {school.duration || "—"}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            minHeight: 20,
          }}
        >
          {school.deadline ? (
            <>
              <span style={{ fontSize: 12, color: ui.body }}>
                {formatDate(school.deadline)}
              </span>
              <DeadlineChip
                deadline={school.deadline}
                status={school.status}
              />
            </>
          ) : (
            <span style={{ fontSize: 12, color: ui.muted }}>No deadline</span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: "auto",
          }}
        >
          <div style={{ flex: 1 }}>
            <ProgressMeter
              ratio={progress.ratio}
              complete={progress.complete}
              width="100%"
            />
          </div>
          <span
            style={{
              flexShrink: 0,
              fontSize: 11.5,
              fontWeight: 600,
              color: progress.complete ? ui.success : ui.body,
            }}
          >
            {progress.done}/{progress.total}
          </span>
        </div>
      </div>
    );
  };

  const cardGridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(272px, 1fr))",
    gap: 12,
    alignItems: "stretch",
  };

  const cardsView = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {activeSchools.length === 0 && removedSchools.length === 0 ? (
        <div
          style={{
            ...cardStyle,
            padding: 24,
            textAlign: "center",
            color: ui.muted,
            fontSize: 13,
          }}
        >
          {schools.length === 0
            ? "No schools yet — add the first one."
            : `No schools match “${searchQuery.trim()}”.`}
        </div>
      ) : (
        <div style={cardGridStyle}>
          {activeSchools.map((school) => renderCard(school, false))}
        </div>
      )}

      {removedSchools.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              ...labelType,
              borderTop: `1px solid ${ui.border}`,
              paddingTop: 12,
            }}
          >
            Removed · {removedSchools.length}
          </div>
          <div style={cardGridStyle}>
            {removedSchools.map((school) => renderCard(school, true))}
          </div>
        </div>
      )}
    </div>
  );

  /* ---------------------------------------------------------------------- */
  /* Chrome                                                                 */
  /* ---------------------------------------------------------------------- */

  const summary = loading ? (
    <span style={{ color: ui.muted, fontSize: 13 }}>Loading…</span>
  ) : (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        fontSize: 13,
      }}
    >
      <span style={{ color: ui.ink, fontWeight: 600 }}>
        {activeSchools.length} active
      </span>
      {mainCount > 0 && (
        <span style={{ color: ui.body }}>
          <strong style={{ color: ui.ink }}>{mainCount}</strong> main
        </span>
      )}
      {statusCounts.map((entry) => (
        <span
          key={entry.status}
          style={{
            color: ui.body,
            border: `1px solid ${ui.border}`,
            borderRadius: 4,
            padding: "1px 7px",
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          <strong style={{ color: ui.ink }}>{entry.count}</strong>{" "}
          {toDisplay(entry.status)}
        </span>
      ))}
      {removedSchools.length > 0 && (
        <span style={{ color: ui.muted, fontSize: 12 }}>
          {removedSchools.length} removed
        </span>
      )}
      {canReorder && activeSchools.length > 1 && (
        <span style={{ color: ui.muted, fontSize: 12 }}>
          drag the handles to rank
        </span>
      )}
    </div>
  );

  const viewOptions = [
    { value: "list", label: "List", Icon: IconLayoutList },
    { value: "cards", label: "Cards", Icon: IconLayoutGrid },
  ].map(({ value, label, Icon }) => ({
    value,
    label: (
      <Center style={{ gap: 6 }}>
        <Icon size={14} stroke={1.5} />
        {label}
      </Center>
    ),
  }));

  const controls = (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
        width: isMobile ? "100%" : undefined,
      }}
    >
      <TextInput
        placeholder="Search schools..."
        size="sm"
        radius={6}
        leftSection={<IconSearch size={15} color={ui.muted} />}
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
        style={{ width: isMobile ? "100%" : 240 }}
        styles={inputStyles}
      />
      {!isMobile && (
        <SegmentedControl
          size="xs"
          radius={6}
          className="app-segmented"
          aria-label="School list layout"
          value={view}
          onChange={(value) => chooseView(value as SchoolsView)}
          data={viewOptions}
        />
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: ui.muted }}>Sort</span>
        <SegmentedControl
          size="xs"
          radius={6}
          className="app-segmented"
          aria-label="Sort schools"
          value={sort}
          onChange={(value) => chooseSort(value as SortKey)}
          data={SORT_OPTIONS}
        />
      </div>
      <Button
        size="sm"
        radius={6}
        style={{ ...primaryButtonStyle, marginLeft: "auto" }}
        onClick={openAdd}
      >
        Add School
      </Button>
    </div>
  );

  return (
    <>
      <AddSchoolDesktopModal
        opened={addOpened}
        onClose={closeAdd}
        onSchoolAdded={load}
        isMobile={isMobile}
      />
      {editTarget && (
        <EditSchoolDesktopModal
          opened={editOpened}
          onClose={closeEdit}
          onSchoolEdited={load}
          isMobile={isMobile}
          schoolIdProp={editTarget.id}
          schoolNameProp={editTarget.name}
          schoolLocationProp={editTarget.location}
          schoolPriorityProp={editTarget.priority}
          schoolStatusProp={editTarget.status}
          schoolApplyOptionProp={editTarget.apply_option}
          schoolApplyOptionNoteProp={editTarget.apply_option_note}
          schoolRemovedProp={editTarget.removed}
          schoolGreProp={editTarget.gre}
          schoolRecommendationCountProp={editTarget.recommendation_count}
          schoolNonThesisOptionProp={editTarget.non_thesis_option}
          schoolProfessionalMastersProp={editTarget.professional_masters}
          schoolDurationProp={editTarget.duration}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <Title order={1} style={pageTitleStyle}>
              Schools
            </Title>
            <div style={{ marginTop: 6 }}>{summary}</div>
          </div>
          {controls}
        </div>

        {loading || isMobile === undefined ? (
          <Center style={{ minHeight: "40vh" }}>
            <Loader color={ui.emphasis} size="sm" />
          </Center>
        ) : isMobile ? (
          <MobileSchoolsView
            activeSchools={activeSchools}
            removedSchools={removedSchools}
            onSchoolChanged={load}
            emptyLabel={
              schools.length === 0
                ? "No schools yet"
                : "No schools match your search"
            }
          />
        ) : view === "cards" ? (
          cardsView
        ) : (
          listView
        )}
      </div>
    </>
  );
}
