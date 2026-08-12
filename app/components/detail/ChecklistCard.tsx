"use client";

import { useState } from "react";
import { Button, Checkbox, Group, Stack, Text, TextInput } from "@mantine/core";
import {
  errorMessage,
  inputStyles,
  notifyError,
  ui,
  type ChecklistItemRow,
  type SchoolFull,
} from "@/app/theme";
import { ClearButton, DetailCard, type RefreshSchool } from "./DetailCard";

const JSON_HEADERS = { "Content-Type": "application/json" };

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    return typeof data?.error === "string" ? data.error : fallback;
  } catch {
    return fallback;
  }
}

export default function ChecklistCard({
  school,
  onSchoolChange,
  onRefresh,
}: {
  school: SchoolFull;
  onSchoolChange: (next: SchoolFull) => void;
  onRefresh: RefreshSchool;
}) {
  const items = school.checklist;
  const doneCount = items.filter((item) => item.done).length;
  const complete = items.length > 0 && doneCount === items.length;
  const percent = items.length ? (doneCount / items.length) * 100 : 0;

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const setItems = (next: ChecklistItemRow[]) =>
    onSchoolChange({ ...school, checklist: next });

  // Both mutations below paint first: a checkbox that waits for the network
  // feels broken even when it works. Recovery is a refetch rather than a
  // rollback to the pre-request snapshot, because that snapshot predates any
  // sibling mutation that landed while this one was in flight.
  const toggle = async (item: ChecklistItemRow) => {
    setItems(
      items.map((row) =>
        row.id === item.id ? { ...row, done: !row.done } : row
      )
    );

    try {
      const response = await fetch("/api/checklist", {
        method: "PATCH",
        headers: JSON_HEADERS,
        body: JSON.stringify({ id: item.id, done: !item.done }),
      });
      if (!response.ok) {
        throw new Error(await readError(response, "Failed to update item"));
      }
    } catch (error) {
      notifyError(
        "Could not update item",
        errorMessage(error, "Something went wrong while saving this item.")
      );
      await onRefresh();
    }
  };

  const remove = async (item: ChecklistItemRow) => {
    setItems(items.filter((row) => row.id !== item.id));

    try {
      const response = await fetch("/api/checklist", {
        method: "DELETE",
        headers: JSON_HEADERS,
        body: JSON.stringify({ id: item.id }),
      });
      if (!response.ok) {
        throw new Error(await readError(response, "Failed to delete item"));
      }
    } catch (error) {
      notifyError(
        "Could not delete item",
        errorMessage(error, "Something went wrong while deleting this item.")
      );
      await onRefresh();
    }
  };

  const add = async () => {
    const title = draft.trim();
    if (!title || saving) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/checklist", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ school_id: school.id, title }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Failed to add item"
        );
      }
      setItems([...items, data as ChecklistItemRow]);
      setDraft("");
    } catch (error) {
      notifyError(
        "Could not add item",
        errorMessage(error, "Something went wrong while adding this item.")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DetailCard
      title="Checklist"
      right={
        <Text size="xs" c={ui.muted} fw={600}>
          {doneCount}/{items.length}
        </Text>
      }
    >
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: ui.subtle,
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: complete ? ui.success : ui.ink,
          }}
        />
      </div>

      <Stack gap={0}>
        {items.map((item) => (
          <Group
            key={item.id}
            gap={8}
            wrap="nowrap"
            align="center"
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId((id) => (id === item.id ? null : id))}
            style={{ minHeight: 32 }}
          >
            <Checkbox
              size="sm"
              radius={4}
              color={ui.ink}
              iconColor={ui.onInk}
              checked={item.done}
              onChange={() => toggle(item)}
              aria-label={item.title}
            />
            <Text
              size="sm"
              c={item.done ? ui.muted : ui.ink}
              style={{
                flex: 1,
                minWidth: 0,
                textDecoration: item.done ? "line-through" : "none",
              }}
            >
              {item.title}
            </Text>
            <ClearButton
              label={`Delete ${item.title}`}
              visible={hoveredId === item.id}
              onClick={() => remove(item)}
            />
          </Group>
        ))}

        {items.length === 0 ? (
          <Text size="sm" c={ui.muted}>
            No checklist items.
          </Text>
        ) : null}
      </Stack>

      {adding ? (
        <TextInput
          mt={8}
          size="sm"
          radius="md"
          autoFocus
          placeholder="New item, then Enter"
          value={draft}
          disabled={saving}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
            if (event.key === "Escape") {
              setDraft("");
              setAdding(false);
            }
          }}
          onBlur={() => {
            if (!draft.trim()) {
              setAdding(false);
            }
          }}
          styles={inputStyles}
        />
      ) : (
        <Button
          mt={6}
          size="compact-xs"
          variant="subtle"
          color="gray"
          c={ui.body}
          px={4}
          onClick={() => setAdding(true)}
        >
          + Add item
        </Button>
      )}
    </DetailCard>
  );
}
