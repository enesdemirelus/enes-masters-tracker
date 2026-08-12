"use client";

import React, { useEffect, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { IconDeviceFloppy, IconEdit, IconX } from "@tabler/icons-react";
import Image from "next/image";
import {
  cardStyle,
  errorMessage,
  inputStyles,
  modalStyles,
  notifyError,
  notifySuccess,
  overlayProps,
  primaryButtonStyle,
  secondaryButtonStyle,
  toDisplay,
  ui,
} from "./modalTheme";

/** Only the school fields the info modals actually read. */
export interface SchoolInfo {
  id: string;
  name: string;
  location: string;
  logo?: string | null;
  ms_status?: string | null;
  more_info_notes?: string | null;
  gre?: string | null;
  recommendation_count?: number | null;
  non_thesis_option?: boolean | null;
  professional_masters?: boolean | null;
  duration?: string | null;
}

export interface MoreInfoModalProps {
  opened: boolean;
  onClose: () => void;
  school: SchoolInfo | null;
  /** Refetch callback from the parent; falls back to a full reload when absent. */
  onSaved?: () => void | Promise<void>;
}

/** Flat gray square with the school's initial, used when no logo is stored. */
export function SchoolLogo({
  school,
  size,
}: {
  school: SchoolInfo;
  size: number;
}) {
  const shell: React.CSSProperties = {
    width: size,
    height: size,
    flexShrink: 0,
    borderRadius: 8,
    border: `1px solid ${ui.border}`,
    background: ui.subtle,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };

  if (!school.logo) {
    return (
      <div style={shell}>
        <Text fw={600} c={ui.body} style={{ fontSize: size * 0.4 }}>
          {school.name?.charAt(0).toUpperCase() || "?"}
        </Text>
      </div>
    );
  }

  return (
    <div style={{ ...shell, background: ui.surface }}>
      <Image
        src={school.logo}
        alt={school.name}
        width={size}
        height={size}
        style={{ objectFit: "contain", padding: 6 }}
      />
    </div>
  );
}

export function SchoolHeader({
  school,
  compact = false,
}: {
  school: SchoolInfo;
  compact?: boolean;
}) {
  return (
    <Group gap="md" wrap="nowrap" align="center">
      <SchoolLogo school={school} size={compact ? 40 : 52} />
      <div style={{ minWidth: 0 }}>
        <Text
          fw={600}
          c={ui.ink}
          style={{ fontSize: compact ? "1rem" : "1.15rem", lineHeight: 1.3 }}
        >
          {school.name}
        </Text>
        <Text size="sm" c={ui.body}>
          {school.location}
        </Text>
        <Badge
          variant="light"
          color="gray"
          radius={4}
          size="sm"
          mt={6}
          styles={{ label: { fontWeight: 500, textTransform: "none" } }}
        >
          {toDisplay(school.ms_status)}
        </Badge>
      </div>
    </Group>
  );
}

function trackLabel(school: SchoolInfo): string {
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

function BoolMark({ value }: { value?: boolean | null }) {
  return (
    <Text
      component="span"
      size="sm"
      fw={600}
      c={value ? ui.positive : ui.danger}
    >
      {value ? "✓" : "✗"}
    </Text>
  );
}

export function ProgramDetails({ school }: { school: SchoolInfo }) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "GRE", value: toDisplay(school.gre) },
    {
      label: "Recommendation letters",
      value:
        typeof school.recommendation_count === "number"
          ? String(school.recommendation_count)
          : "—",
    },
    {
      label: "Non-thesis option",
      value: <BoolMark value={school.non_thesis_option} />,
    },
    {
      label: "Professional masters",
      value: <BoolMark value={school.professional_masters} />,
    },
    { label: "Which?", value: trackLabel(school) },
    { label: "Duration", value: school.duration?.trim() || "—" },
  ];

  return (
    <div style={{ ...cardStyle, padding: 16 }}>
      <Text fw={600} c={ui.ink} size="sm" mb={8}>
        Program details
      </Text>
      <div>
        {rows.map((row, index) => (
          <Group
            key={row.label}
            justify="space-between"
            align="center"
            wrap="nowrap"
            gap="md"
            style={{
              padding: "9px 0",
              borderBottom:
                index === rows.length - 1 ? "none" : `1px solid ${ui.border}`,
            }}
          >
            <Text size="sm" c={ui.body}>
              {row.label}
            </Text>
            <Text
              size="sm"
              c={ui.ink}
              fw={500}
              style={{ textAlign: "right" }}
              component="div"
            >
              {row.value}
            </Text>
          </Group>
        ))}
      </div>
    </div>
  );
}

export function NotesSection({
  school,
  onSaved,
}: {
  school: SchoolInfo;
  onSaved?: () => void | Promise<void>;
}) {
  // `notes` is the persisted value shown when not editing, `draft` is the
  // textarea buffer. Both resync whenever a different school is opened.
  const [notes, setNotes] = useState(school.more_info_notes ?? "");
  const [draft, setDraft] = useState(school.more_info_notes ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNotes(school.more_info_notes ?? "");
    setDraft(school.more_info_notes ?? "");
    setIsEditing(false);
  }, [school.id, school.more_info_notes]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/add-more-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // An empty string is allowed — that is how notes get cleared.
        body: JSON.stringify({ id: school.id, more_info_notes: draft }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : `Request failed with status ${response.status}`
        );
      }

      setNotes(draft);
      setIsEditing(false);
      notifySuccess("Notes saved", `Notes for ${school.name} were updated.`);

      if (onSaved) {
        await onSaved();
      } else {
        window.location.reload();
      }
    } catch (error) {
      notifyError(
        "Could not save notes",
        errorMessage(error, "Something went wrong while saving your notes.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(notes);
    setIsEditing(false);
  };

  return (
    <div style={{ ...cardStyle, padding: 16 }}>
      <Group justify="space-between" align="center" mb={10}>
        <Text fw={600} c={ui.ink} size="sm">
          Notes
        </Text>
        {!isEditing && (
          <ActionIcon
            variant="default"
            radius={6}
            aria-label="Edit notes"
            onClick={() => setIsEditing(true)}
            style={{ borderColor: ui.inputBorder, color: ui.ink }}
          >
            <IconEdit size={16} />
          </ActionIcon>
        )}
      </Group>

      {isEditing ? (
        <Stack gap="sm">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            placeholder="Add your notes here..."
            minRows={5}
            autosize
            radius="md"
            styles={inputStyles}
          />
          <Group justify="flex-end" gap="sm">
            <Button
              size="sm"
              variant="default"
              style={secondaryButtonStyle}
              leftSection={<IconX size={15} />}
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              style={primaryButtonStyle}
              leftSection={<IconDeviceFloppy size={15} />}
              onClick={handleSave}
              loading={isSaving}
            >
              Save
            </Button>
          </Group>
        </Stack>
      ) : (
        <Text
          size="sm"
          c={notes ? ui.body : ui.muted}
          style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}
        >
          {notes || "No notes yet."}
        </Text>
      )}
    </div>
  );
}

function MoreInfoModal({
  opened,
  onClose,
  school,
  onSaved,
}: MoreInfoModalProps) {
  if (!school) {
    return null;
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="lg"
      radius={8}
      overlayProps={overlayProps}
      styles={modalStyles}
      title={<SchoolHeader school={school} />}
    >
      <Stack gap="md">
        <ProgramDetails school={school} />
        <NotesSection school={school} onSaved={onSaved} />
        <Group justify="flex-end">
          <Button
            size="sm"
            variant="default"
            style={secondaryButtonStyle}
            onClick={onClose}
          >
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default MoreInfoModal;
