"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActionIcon, Group, Stack } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import EditSchoolDesktopModal from "../modals/EditSchoolDesktopModal";
import {
  checklistProgress,
  DeadlineChip,
  GrayBadge,
  ProgressMeter,
  StatusBadge,
  type SchoolRow,
} from "./school-list";
import { cardStyle, formatDate, getWhichLabel, toDisplay, ui } from "../theme";

interface MobileSchoolsViewProps {
  /** Already filtered and sorted by the page — this view only paints. */
  activeSchools: SchoolRow[];
  removedSchools: SchoolRow[];
  onSchoolChanged?: () => void;
  /** Wording depends on whether the list is empty or merely filtered out. */
  emptyLabel?: string;
}

export default function MobileSchoolsView({
  activeSchools,
  removedSchools,
  onSchoolChanged,
  emptyLabel = "No schools yet",
}: MobileSchoolsViewProps) {
  const router = useRouter();
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [editTarget, setEditTarget] = useState<SchoolRow | null>(null);

  const renderCard = (school: SchoolRow, isRemoved: boolean) => {
    const progress = checklistProgress(school);
    const which = getWhichLabel(school);

    return (
      <div
        key={school.id}
        role="link"
        tabIndex={0}
        onClick={() => router.push(`/schools/${school.id}`)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            router.push(`/schools/${school.id}`);
          }
        }}
        style={{
          ...cardStyle,
          padding: 16,
          cursor: "pointer",
          opacity: isRemoved ? 0.6 : 1,
        }}
      >
        <Stack gap={10}>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 15,
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
            <ActionIcon
              variant="subtle"
              size="lg"
              radius={6}
              aria-label={`Edit ${school.name}`}
              style={{ color: ui.body }}
              onClick={(event) => {
                event.stopPropagation();
                setEditTarget(school);
                openEdit();
              }}
            >
              <IconEdit size={18} />
            </ActionIcon>
          </Group>

          <Group gap={6}>
            <GrayBadge>{toDisplay(school.priority)}</GrayBadge>
            <GrayBadge>{toDisplay(school.tiers)}</GrayBadge>
            <GrayBadge>{toDisplay(school.category)}</GrayBadge>
            <StatusBadge status={school.status} />
            {school.duration && <GrayBadge>{school.duration}</GrayBadge>}
            {which !== "—" && <GrayBadge>{which}</GrayBadge>}
          </Group>

          {school.deadline && (
            <Group gap={8} wrap="nowrap">
              <span style={{ fontSize: 12, color: ui.body }}>
                {formatDate(school.deadline)}
              </span>
              <DeadlineChip
                deadline={school.deadline}
                status={school.status}
              />
            </Group>
          )}

          <Group gap={10} wrap="nowrap" align="center">
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
                fontSize: 12,
                fontWeight: 600,
                color: progress.complete ? ui.success : ui.body,
              }}
            >
              {progress.done}/{progress.total}
            </span>
          </Group>
        </Stack>
      </div>
    );
  };

  return (
    <>
      {editTarget && (
        <EditSchoolDesktopModal
          opened={editOpened}
          onClose={closeEdit}
          onSchoolEdited={onSchoolChanged}
          isMobile
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

      <Stack gap={12}>
        {activeSchools.map((school) => renderCard(school, false))}

        {activeSchools.length === 0 && removedSchools.length === 0 && (
          <div
            style={{
              ...cardStyle,
              padding: 20,
              textAlign: "center",
              color: ui.muted,
              fontSize: 13,
            }}
          >
            {emptyLabel}
          </div>
        )}

        {removedSchools.length > 0 && (
          <div
            style={{
              backgroundColor: ui.canvas,
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
              marginTop: 4,
            }}
          >
            Removed Schools
          </div>
        )}

        {removedSchools.map((school) => renderCard(school, true))}
      </Stack>
    </>
  );
}
