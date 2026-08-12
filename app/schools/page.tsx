"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
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
import { IconEdit, IconSearch } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useIsMobile } from "@/lib/use-mobile";
import MobileSchoolsView from "../components/MobileSchoolsView";
import {
  checklistProgress,
  compareSchools,
  DeadlineChip,
  GrayBadge,
  ProgressMeter,
  StatusBadge,
  type SchoolRow,
  type SortKey,
} from "../components/school-list";
import AddSchoolDesktopModal from "../modals/AddSchoolDesktopModal";
import EditSchoolDesktopModal from "../modals/EditSchoolDesktopModal";
import {
  cardStyle,
  formatDate,
  getWhichLabel,
  inputStyles,
  notifyError,
  pageTitleStyle,
  primaryButtonStyle,
  toDisplay,
  ui,
} from "../theme";

const SORT_OPTIONS = [
  { label: "Priority", value: "priority" },
  { label: "Deadline", value: "deadline" },
  { label: "Name", value: "name" },
];

const COLUMN_COUNT = 10;

const headerCellStyle: CSSProperties = {
  textAlign: "center",
  color: ui.body,
  fontSize: "0.72rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  padding: "12px 16px",
  whiteSpace: "nowrap",
};

const centerCellStyle: CSSProperties = { textAlign: "center" };

export default function SchoolsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("priority");
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [editTarget, setEditTarget] = useState<SchoolRow | null>(null);

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

  const query = searchQuery.trim().toLowerCase();
  const matches = (school: SchoolRow) => {
    if (!query) {
      return true;
    }
    return [
      school.name,
      school.location,
      school.tiers,
      school.category,
      school.status,
      school.ms_status,
      school.priority,
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

  const startEdit = (school: SchoolRow) => {
    setEditTarget(school);
    openEdit();
  };

  const openDetail = (school: SchoolRow) => {
    router.push(`/schools/${school.id}`);
  };

  const renderRow = (school: SchoolRow, isRemoved: boolean) => {
    const progress = checklistProgress(school);
    const which = getWhichLabel(school);

    return (
      <Table.Tr
        key={school.id}
        onClick={() => openDetail(school)}
        style={{
          cursor: "pointer",
          opacity: isRemoved ? 0.6 : 1,
          backgroundColor: isRemoved ? ui.subtle : undefined,
        }}
      >
        <Table.Td style={centerCellStyle}>
          <ActionIcon
            variant="subtle"
            size="md"
            radius={6}
            aria-label={`Edit ${school.name}`}
            style={{ color: ui.body }}
            onClick={(event) => {
              event.stopPropagation();
              startEdit(school);
            }}
          >
            <IconEdit size={16} />
          </ActionIcon>
        </Table.Td>

        <Table.Td>
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
        </Table.Td>

        <Table.Td style={centerCellStyle}>
          <GrayBadge>{toDisplay(school.tiers)}</GrayBadge>
        </Table.Td>

        <Table.Td style={centerCellStyle}>
          <GrayBadge>{toDisplay(school.category)}</GrayBadge>
        </Table.Td>

        <Table.Td style={centerCellStyle}>
          <StatusBadge status={school.status} />
        </Table.Td>

        <Table.Td style={centerCellStyle}>
          <GrayBadge>{toDisplay(school.priority)}</GrayBadge>
        </Table.Td>

        <Table.Td style={centerCellStyle}>
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

        <Table.Td style={centerCellStyle}>
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

        <Table.Td style={{ ...centerCellStyle, color: ui.body }}>
          {school.duration || "—"}
        </Table.Td>

        <Table.Td style={centerCellStyle}>
          {which === "—" ? (
            <span style={{ color: ui.muted }}>—</span>
          ) : (
            <GrayBadge>{which}</GrayBadge>
          )}
        </Table.Td>
      </Table.Tr>
    );
  };

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
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: ui.muted }}>Sort</span>
        <SegmentedControl
          size="xs"
          radius={6}
          value={sort}
          onChange={(value) => setSort(value as SortKey)}
          data={SORT_OPTIONS}
          styles={{
            root: {
              background: ui.subtle,
              border: `1px solid ${ui.border}`,
              padding: 2,
            },
            indicator: {
              background: ui.surface,
              border: `1px solid ${ui.border}`,
              boxShadow: "none",
            },
            label: { fontSize: 12, fontWeight: 500, padding: "4px 10px" },
          }}
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
          schoolTierProp={editTarget.tiers}
          schoolCategoryProp={editTarget.category}
          schoolStatusProp={editTarget.status}
          schoolMsStatusProp={editTarget.ms_status}
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
            <div style={{ color: ui.muted, fontSize: 13, marginTop: 4 }}>
              {loading
                ? "Loading…"
                : `${activeSchools.length} active · ${removedSchools.length} removed`}
            </div>
          </div>
          {controls}
        </div>

        {loading || isMobile === undefined ? (
          <Center style={{ minHeight: "40vh" }}>
            <Loader color="dark" size="sm" />
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
        ) : (
          <div style={{ ...cardStyle, overflow: "hidden" }}>
            <Table.ScrollContainer minWidth={1040}>
              <Table
                highlightOnHover
                highlightOnHoverColor={ui.canvas}
                withRowBorders
                borderColor="#f0f0f0"
                verticalSpacing="sm"
                horizontalSpacing="md"
                style={{ backgroundColor: ui.surface }}
              >
                <Table.Thead style={{ backgroundColor: ui.canvas }}>
                  <Table.Tr>
                    <Table.Th style={{ ...headerCellStyle, width: 56 }}>
                      Edit
                    </Table.Th>
                    <Table.Th style={{ ...headerCellStyle, textAlign: "left" }}>
                      School
                    </Table.Th>
                    <Table.Th style={headerCellStyle}>Tier</Table.Th>
                    <Table.Th style={headerCellStyle}>Category</Table.Th>
                    <Table.Th style={headerCellStyle}>Status</Table.Th>
                    <Table.Th style={headerCellStyle}>Priority</Table.Th>
                    <Table.Th style={headerCellStyle}>Deadline</Table.Th>
                    <Table.Th style={headerCellStyle}>Progress</Table.Th>
                    <Table.Th style={headerCellStyle}>Duration</Table.Th>
                    <Table.Th style={headerCellStyle}>Which?</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {activeSchools.map((school) => renderRow(school, false))}

                  {activeSchools.length === 0 &&
                    removedSchools.length === 0 && (
                      <Table.Tr>
                        <Table.Td
                          colSpan={COLUMN_COUNT}
                          style={{
                            textAlign: "center",
                            color: ui.muted,
                            fontSize: 13,
                            padding: "28px 16px",
                          }}
                        >
                          {schools.length === 0
                            ? "No schools yet"
                            : "No schools match your search"}
                        </Table.Td>
                      </Table.Tr>
                    )}

                  {removedSchools.length > 0 && (
                    <Table.Tr>
                      <Table.Td
                        colSpan={COLUMN_COUNT}
                        style={{
                          backgroundColor: ui.canvas,
                          borderTop: `1px solid ${ui.border}`,
                          borderBottom: `1px solid ${ui.border}`,
                          textAlign: "center",
                          padding: "10px",
                          fontWeight: 600,
                          color: ui.muted,
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Removed Schools
                      </Table.Td>
                    </Table.Tr>
                  )}
                  {removedSchools.map((school) => renderRow(school, true))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </div>
        )}
      </div>
    </>
  );
}
