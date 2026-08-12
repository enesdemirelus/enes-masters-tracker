"use client";
import {
  Table,
  Badge,
  ActionIcon,
  Title,
  Button,
  TextInput,
  Center,
  Loader,
} from "@mantine/core";
import { IconEdit, IconInfoCircle, IconSearch } from "@tabler/icons-react";
import { useState, useEffect, type CSSProperties } from "react";
import MobileSchoolsView from "./components/MobileSchoolsView";
import { useIsMobile } from "../lib/use-mobile";
import AddSchoolDesktopModal from "./modals/AddSchoolDesktopModal";
import EditSchoolDesktopModal from "./modals/EditSchoolDesktopModal";
import { useDisclosure } from "@mantine/hooks";
import MoreInfoModal from "./modals/MoreInfoModal";
import {
  cardStyle,
  inputStyles,
  primaryButtonStyle,
  toDisplay,
  ui,
} from "./modals/modalTheme";

type BadgeProps = {
  variant: "filled" | "light" | "outline";
  color: string;
  style?: CSSProperties;
};

/** Every badge is flat gray except the two allowed status exceptions. */
function getStatusBadgeProps(status: string): BadgeProps {
  if (status === "ACCEPTED") {
    return { variant: "filled", color: "dark" };
  }
  if (status === "REJECTED") {
    return {
      variant: "outline",
      color: "red",
      style: {
        "--badge-bg": "transparent",
        "--badge-color": ui.danger,
        "--badge-bd": `1px solid ${ui.danger}`,
      } as CSSProperties,
    };
  }
  return { variant: "light", color: "gray" };
}

/** "Which?" — derived from the two boolean track flags. */
function getWhichLabel(school: {
  non_thesis_option?: boolean | null;
  professional_masters?: boolean | null;
}): string {
  const nonThesis = school.non_thesis_option === true;
  const professional = school.professional_masters === true;
  if (nonThesis && professional) {
    return "Both";
  }
  if (nonThesis) {
    return "Non-Thesis";
  }
  if (professional) {
    return "Professional";
  }
  return "—";
}

export default function Page() {
  const [elements, setElements] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const [opened, { open, close }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [moreInfoOpened, { open: openMoreInfo, close: closeMoreInfo }] =
    useDisclosure(false);

  const fetchSchools = async () => {
    try {
      const response = await fetch("/api/get-school");
      if (!response.ok) {
        throw new Error(`Failed to fetch schools: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Unexpected response shape from /api/get-school");
      }
      setElements(data);
    } catch (error) {
      console.error("Error fetching schools:", error);
      setElements([]);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const filteredElements = elements.filter((element) => {
    const query = searchQuery.toLowerCase();
    return (
      element.name.toLowerCase().includes(query) ||
      element.location.toLowerCase().includes(query) ||
      element.tiers.toLowerCase().includes(query) ||
      element.category.toLowerCase().includes(query) ||
      element.status.toLowerCase().includes(query) ||
      element.ms_status.toLowerCase().includes(query) ||
      element.priority.toLowerCase().includes(query)
    );
  });

  // Priority order for sorting
  const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };

  // Separate active and removed schools and sort by priority
  const activeSchools = filteredElements
    .filter((element) => !element.removed)
    .sort(
      (a, b) =>
        priorityOrder[a.priority as keyof typeof priorityOrder] -
        priorityOrder[b.priority as keyof typeof priorityOrder]
    );

  const removedSchools = filteredElements
    .filter((element) => element.removed)
    .sort(
      (a, b) =>
        priorityOrder[a.priority as keyof typeof priorityOrder] -
        priorityOrder[b.priority as keyof typeof priorityOrder]
    );

  // Mobile status is unknown on first render — avoid a desktop-table flash.
  if (isMobile === undefined) {
    return (
      <Center style={{ minHeight: "100vh", background: "#fafafa" }}>
        <Loader color="dark" size="sm" />
      </Center>
    );
  }

  if (isMobile) {
    return (
      <MobileSchoolsView
        activeSchools={activeSchools}
        removedSchools={removedSchools}
        onSchoolAdded={fetchSchools}
      />
    );
  }

  const headerCellStyle: CSSProperties = {
    textAlign: "center",
    color: ui.body,
    fontSize: "0.72rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    padding: "12px 16px",
  };

  const createSchoolRow = (element: any, isRemoved: boolean = false) => {
    const statusBadge = getStatusBadgeProps(element.status);
    const which = getWhichLabel(element);

    return (
      <Table.Tr
        key={element.id}
        style={{
          opacity: isRemoved ? 0.6 : 1,
          backgroundColor: isRemoved ? ui.subtle : undefined,
        }}
      >
        <Table.Td style={{ textAlign: "center" }}>
          <ActionIcon
            variant="subtle"
            size="md"
            radius={6}
            style={{ color: ui.body }}
            onClick={() => {
              setSelectedSchool(element);
              openEdit();
            }}
          >
            <IconEdit size={16} />
          </ActionIcon>
        </Table.Td>
        <Table.Td style={{ textAlign: "center" }}>
          <Badge variant="light" color="gray" size="sm" radius={4}>
            {toDisplay(element.priority)}
          </Badge>
        </Table.Td>
        <Table.Td style={{ textAlign: "center" }}>
          <Badge variant="light" color="gray" size="sm" radius={4}>
            {toDisplay(element.tiers)}
          </Badge>
        </Table.Td>
        <Table.Td style={{ fontWeight: 600, color: isRemoved ? ui.muted : ui.ink }}>
          {element.name}
          {isRemoved && element.removal_reason && (
            <span
              style={{ fontSize: "0.75rem", color: ui.muted, marginLeft: "8px" }}
            >
              ({element.removal_reason})
            </span>
          )}
        </Table.Td>
        <Table.Td style={{ color: isRemoved ? ui.muted : ui.body }}>
          {element.location}
        </Table.Td>
        <Table.Td style={{ textAlign: "center" }}>
          <Badge variant="light" color="gray" size="sm" radius={4}>
            {toDisplay(element.category)}
          </Badge>
        </Table.Td>
        <Table.Td style={{ textAlign: "center" }}>
          <Badge
            variant={statusBadge.variant}
            color={statusBadge.color}
            style={statusBadge.style}
            size="sm"
            radius={4}
          >
            {toDisplay(element.status)}
          </Badge>
        </Table.Td>
        <Table.Td style={{ textAlign: "center", color: isRemoved ? ui.muted : ui.body }}>
          {element.duration || "—"}
        </Table.Td>
        <Table.Td style={{ textAlign: "center" }}>
          {which === "—" ? (
            <span style={{ color: ui.muted }}>—</span>
          ) : (
            <Badge variant="light" color="gray" size="sm" radius={4}>
              {which}
            </Badge>
          )}
        </Table.Td>
        <Table.Td style={{ textAlign: "center" }}>
          <ActionIcon
            variant="subtle"
            size="md"
            radius={6}
            style={{ color: ui.body }}
            onClick={() => {
              setSelectedSchool(element);
              openMoreInfo();
            }}
          >
            <IconInfoCircle size={16} />
          </ActionIcon>
        </Table.Td>
      </Table.Tr>
    );
  };

  const COLUMN_COUNT = 10;

  // Create rows for active and removed schools
  const activeRows = activeSchools.map((element) =>
    createSchoolRow(element, false)
  );
  const removedRows = removedSchools.map((element) =>
    createSchoolRow(element, true)
  );

  return (
    <>
      <MoreInfoModal
        opened={moreInfoOpened}
        onClose={closeMoreInfo}
        school={selectedSchool}
        onSaved={fetchSchools}
      />
      <AddSchoolDesktopModal
        opened={opened}
        onClose={close}
        onSchoolAdded={fetchSchools}
      />
      {selectedSchool && (
        <EditSchoolDesktopModal
          opened={editOpened}
          onClose={closeEdit}
          onSchoolEdited={fetchSchools}
          schoolIdProp={selectedSchool.id}
          schoolNameProp={selectedSchool.name}
          schoolLocationProp={selectedSchool.location}
          schoolPriorityProp={selectedSchool.priority}
          schoolTierProp={selectedSchool.tiers}
          schoolCategoryProp={selectedSchool.category}
          schoolStatusProp={selectedSchool.status}
          schoolMsStatusProp={selectedSchool.ms_status}
          schoolRemovedProp={selectedSchool.removed}
          schoolGreProp={selectedSchool.gre}
          schoolRecommendationCountProp={selectedSchool.recommendation_count}
          schoolNonThesisOptionProp={selectedSchool.non_thesis_option}
          schoolProfessionalMastersProp={selectedSchool.professional_masters}
          schoolDurationProp={selectedSchool.duration}
        />
      )}
      <div
        style={{
          background: "#fafafa",
          minHeight: "100vh",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            ...cardStyle,
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "28px",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <Title
              order={1}
              style={{
                color: ui.ink,
                fontSize: "1.75rem",
                fontWeight: 700,
              }}
            >
              Enes&apos; Master&apos;s Application Tracker
            </Title>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <TextInput
                placeholder="Search schools..."
                size="md"
                radius={6}
                leftSection={<IconSearch size={16} color={ui.muted} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "300px" }}
                styles={inputStyles}
              />
              <Button
                size="md"
                radius={6}
                style={primaryButtonStyle}
                onClick={open}
              >
                Add School
              </Button>
            </div>
          </div>
          <Table.ScrollContainer minWidth={900}>
            <Table
              highlightOnHover
              highlightOnHoverColor="#fafafa"
              withRowBorders
              borderColor="#f0f0f0"
              verticalSpacing="md"
              horizontalSpacing="md"
              style={{ backgroundColor: ui.surface }}
            >
              <Table.Thead style={{ backgroundColor: "#fafafa" }}>
                <Table.Tr>
                  <Table.Th style={{ ...headerCellStyle, width: "50px" }}>
                    Edit
                  </Table.Th>
                  <Table.Th style={{ ...headerCellStyle, width: "100px" }}>
                    Priority
                  </Table.Th>
                  <Table.Th style={{ ...headerCellStyle, width: "100px" }}>
                    Tier
                  </Table.Th>
                  <Table.Th style={{ ...headerCellStyle, textAlign: "left" }}>
                    School Name
                  </Table.Th>
                  <Table.Th style={{ ...headerCellStyle, textAlign: "left" }}>
                    Location
                  </Table.Th>
                  <Table.Th style={{ ...headerCellStyle, minWidth: "130px" }}>
                    Category
                  </Table.Th>
                  <Table.Th style={{ ...headerCellStyle, minWidth: "110px" }}>
                    Status
                  </Table.Th>
                  <Table.Th style={{ ...headerCellStyle, minWidth: "100px" }}>
                    Duration
                  </Table.Th>
                  <Table.Th style={{ ...headerCellStyle, minWidth: "110px" }}>
                    Which?
                  </Table.Th>
                  <Table.Th style={{ ...headerCellStyle, width: "50px" }}>
                    Info
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {activeRows}
                {removedRows.length > 0 && (
                  <Table.Tr>
                    <Table.Td
                      colSpan={COLUMN_COUNT}
                      style={{
                        backgroundColor: "#fafafa",
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
                {removedRows}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </div>
      </div>
    </>
  );
}
