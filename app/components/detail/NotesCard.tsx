"use client";

import { useEffect, useState } from "react";
import { Button, Group, Text, Textarea } from "@mantine/core";
import {
  inputStyles,
  primaryButtonStyle,
  secondaryButtonStyle,
  ui,
  type SchoolFull,
} from "@/app/theme";
import { DetailCard, type PatchSchool } from "./DetailCard";

export default function NotesCard({
  school,
  onPatch,
}: {
  school: SchoolFull;
  onPatch: PatchSchool;
}) {
  const notes = school.more_info_notes ?? "";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(notes);
  const [saving, setSaving] = useState(false);

  // A refetch (or an edit elsewhere) resets the draft while not editing.
  useEffect(() => {
    if (!editing) {
      setDraft(notes);
    }
  }, [notes, editing]);

  const save = async () => {
    setSaving(true);
    // An empty string is a legitimate value here: it clears the notes.
    const ok = await onPatch(
      { more_info_notes: draft },
      draft.trim() ? "Notes updated." : "Notes cleared."
    );
    setSaving(false);
    if (ok) {
      setEditing(false);
    }
  };

  return (
    <DetailCard
      title="Notes"
      right={
        editing ? null : (
          <Button
            size="compact-xs"
            variant="default"
            style={secondaryButtonStyle}
            onClick={() => {
              setDraft(notes);
              setEditing(true);
            }}
          >
            Edit
          </Button>
        )
      }
    >
      {editing ? (
        <>
          <Textarea
            autosize
            minRows={4}
            size="sm"
            radius="md"
            placeholder="Anything worth remembering about this program…"
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            styles={inputStyles}
          />
          <Group justify="flex-end" gap="sm" mt={10}>
            <Button
              size="xs"
              variant="default"
              style={secondaryButtonStyle}
              onClick={() => {
                setDraft(notes);
                setEditing(false);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              size="xs"
              style={primaryButtonStyle}
              onClick={save}
              loading={saving}
            >
              Save
            </Button>
          </Group>
        </>
      ) : notes.trim() ? (
        <Text size="sm" c={ui.body} style={{ whiteSpace: "pre-wrap" }}>
          {notes}
        </Text>
      ) : (
        <Text size="sm" c={ui.muted}>
          No notes yet.
        </Text>
      )}
    </DetailCard>
  );
}
