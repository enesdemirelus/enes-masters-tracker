"use client";
import {
  Badge,
  ActionIcon,
  Title,
  Card,
  Group,
  Stack,
  Text,
  Button,
} from "@mantine/core";
import { IconEdit, IconInfoCircle } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useState, type CSSProperties } from "react";
import AddSchoolDesktopModal from "../modals/AddSchoolDesktopModal";
import EditSchoolDesktopModal from "../modals/EditSchoolDesktopModal";
import MoreInfoModalMobile from "../modals/MoreInfoModalMobile";
import { cardStyle, primaryButtonStyle, toDisplay, ui } from "../modals/modalTheme";

interface School {
  id: string;
  name: string;
  location: string;
  priority: string;
  tiers: string;
  category: string;
  status: string;
  ms_status: string;
  logo: string;
  removed?: boolean;
  removal_reason?: string;
  more_info_notes?: string;
  gre?: string;
  recommendation_count?: number;
  non_thesis_option?: boolean;
  professional_masters?: boolean;
  duration?: string | null;
}

interface MobileSchoolsViewProps {
  activeSchools: School[];
  removedSchools: School[];
  onSchoolAdded?: () => void;
}

type StatusBadgeProps = {
  variant: "filled" | "light" | "outline";
  color: string;
  style?: CSSProperties;
};

/** Every badge is flat gray except the two allowed status exceptions. */
function getStatusBadgeProps(status: string): StatusBadgeProps {
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

/** "Which?" — derived from the two boolean track flags, mirrors the desktop table. */
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

export default function MobileSchoolsView({
  activeSchools,
  removedSchools,
  onSchoolAdded,
}: MobileSchoolsViewProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [moreInfoOpened, { open: openMoreInfo, close: closeMoreInfo }] =
    useDisclosure(false);

  const createSchoolCard = (element: School, isRemoved: boolean = false) => {
    const statusBadge = getStatusBadgeProps(element.status);
    const which = getWhichLabel(element);

    return (
      <Card
        key={element.id}
        padding="lg"
        style={{
          ...cardStyle,
          opacity: isRemoved ? 0.6 : 1,
        }}
      >
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text
                fw={700}
                size="lg"
                style={{
                  color: isRemoved ? ui.muted : ui.ink,
                  marginBottom: "2px",
                }}
              >
                {element.name}
              </Text>
              <Text size="sm" c={ui.body}>
                {element.location}
              </Text>
              {isRemoved && element.removal_reason && (
                <Text size="xs" c={ui.muted} mt={4}>
                  {element.removal_reason}
                </Text>
              )}
            </div>
            <Group gap="xs" wrap="nowrap">
              <ActionIcon
                variant="subtle"
                size="lg"
                radius={6}
                style={{ color: ui.body }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSchool(element);
                  openEdit();
                }}
              >
                <IconEdit size={18} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                size="lg"
                radius={6}
                style={{ color: ui.body }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSchool(element);
                  openMoreInfo();
                }}
              >
                <IconInfoCircle size={18} />
              </ActionIcon>
            </Group>
          </Group>

          <Group gap="xs">
            <Badge variant="light" color="gray" size="sm" radius={4}>
              {toDisplay(element.priority)}
            </Badge>
            <Badge variant="light" color="gray" size="sm" radius={4}>
              {toDisplay(element.tiers)}
            </Badge>
            <Badge variant="light" color="gray" size="sm" radius={4}>
              {toDisplay(element.category)}
            </Badge>
            <Badge
              variant={statusBadge.variant}
              color={statusBadge.color}
              style={statusBadge.style}
              size="sm"
              radius={4}
            >
              {toDisplay(element.status)}
            </Badge>
            {element.duration && (
              <Badge variant="light" color="gray" size="sm" radius={4}>
                {element.duration}
              </Badge>
            )}
            {which !== "—" && (
              <Badge variant="light" color="gray" size="sm" radius={4}>
                {which}
              </Badge>
            )}
          </Group>
        </Stack>
      </Card>
    );
  };

  return (
    <>
      <MoreInfoModalMobile
        opened={moreInfoOpened}
        onClose={closeMoreInfo}
        school={selectedSchool}
        onSaved={onSchoolAdded}
      />
      <AddSchoolDesktopModal
        opened={opened}
        onClose={close}
        onSchoolAdded={onSchoolAdded}
        isMobile={true}
      />
      {selectedSchool && (
        <EditSchoolDesktopModal
          opened={editOpened}
          onClose={closeEdit}
          onSchoolEdited={onSchoolAdded}
          isMobile={true}
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
          padding: "20px 16px",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              gap: "12px",
            }}
          >
            <Title
              order={1}
              style={{
                color: ui.ink,
                fontSize: "1.35rem",
                fontWeight: 700,
                flex: 1,
              }}
            >
              Enes&apos; Master&apos;s Tracker
            </Title>
            <Button
              size="sm"
              radius={6}
              style={{
                ...primaryButtonStyle,
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
              }}
              onClick={open}
            >
              Add School
            </Button>
          </div>

          <Stack gap="md">
            {/* Active Schools */}
            {activeSchools.map((element) => createSchoolCard(element, false))}

            {/* Separator for Removed Schools */}
            {removedSchools.length > 0 && (
              <div
                style={{
                  backgroundColor: "#fafafa",
                  borderTop: `1px solid ${ui.border}`,
                  borderBottom: `1px solid ${ui.border}`,
                  textAlign: "center",
                  padding: "10px 12px",
                  fontWeight: 600,
                  color: ui.muted,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderRadius: 6,
                  margin: "8px 0",
                }}
              >
                Removed Schools
              </div>
            )}

            {/* Removed Schools */}
            {removedSchools.map((element) => createSchoolCard(element, true))}
          </Stack>
        </div>
      </div>
    </>
  );
}
