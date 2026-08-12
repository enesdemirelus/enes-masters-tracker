"use client";

import Link from "next/link";
import { Button, Group, Text } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { SchoolLogo } from "@/app/components/SchoolLogo";
import { GrayBadge, StatusBadge } from "@/app/components/school-list";
import { secondaryButtonStyle, toDisplay, ui, type SchoolFull } from "@/app/theme";

export default function SchoolDetailHeader({
  school,
  onEdit,
}: {
  school: SchoolFull;
  onEdit: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Link
        href="/schools"
        style={{
          color: ui.body,
          fontSize: 13,
          textDecoration: "none",
          width: "fit-content",
        }}
      >
        ← Schools
      </Link>

      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <Group gap="md" wrap="nowrap" align="flex-start" style={{ minWidth: 0 }}>
          <SchoolLogo school={school} size={40} />
          <div style={{ minWidth: 0 }}>
            <Text fw={700} c={ui.ink} style={{ fontSize: 24, lineHeight: 1.2 }}>
              {school.name}
            </Text>
            <Text size="sm" c={ui.body} mt={2}>
              {school.location}
            </Text>
            <Group gap={6} mt={8}>
              <GrayBadge>{toDisplay(school.tiers)}</GrayBadge>
              <GrayBadge>{toDisplay(school.category)}</GrayBadge>
              <StatusBadge status={school.status} />
              <GrayBadge>{toDisplay(school.priority)} priority</GrayBadge>
            </Group>
          </div>
        </Group>

        <Button
          size="sm"
          variant="default"
          style={secondaryButtonStyle}
          leftSection={<IconEdit size={15} stroke={1.5} />}
          onClick={onEdit}
        >
          Edit
        </Button>
      </Group>

      {school.removed ? (
        <div
          style={{
            background: ui.surface,
            border: `1px solid ${ui.warning}`,
            borderRadius: 8,
            padding: "10px 12px",
          }}
        >
          <Text size="sm" c={ui.warning} fw={600} component="span">
            This school was removed
          </Text>
          <Text size="sm" c={ui.body} component="span">
            {school.removal_reason?.trim()
              ? ` — reason: ${school.removal_reason.trim()}`
              : " — no reason recorded."}
          </Text>
        </div>
      ) : null}
    </div>
  );
}
