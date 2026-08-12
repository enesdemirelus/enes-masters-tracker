"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Group, Loader, Select, Stack, Text } from "@mantine/core";
import {
  errorMessage,
  inputStyles,
  LETTER_STATUS_OPTIONS,
  LETTER_STATUSES,
  letterStatusColor,
  notifyError,
  ui,
  type LetterRequestRow,
  type LetterStatusValue,
  type RecommenderRow,
  type SchoolFull,
} from "@/app/theme";
import { ClearButton, DetailCard, type RefreshSchool } from "./DetailCard";

const JSON_HEADERS = { "Content-Type": "application/json" };

function isLetterStatus(value: string | null): value is LetterStatusValue {
  return value !== null && (LETTER_STATUSES as string[]).includes(value);
}

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    return typeof data?.error === "string" ? data.error : fallback;
  } catch {
    return fallback;
  }
}

export default function LettersCard({
  school,
  onSchoolChange,
  onRefresh,
}: {
  school: SchoolFull;
  onSchoolChange: (next: SchoolFull) => void;
  onRefresh: RefreshSchool;
}) {
  const letters = school.letters;

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  /** null until the recommender list has been fetched at least once. */
  const [recommenders, setRecommenders] = useState<RecommenderRow[] | null>(null);
  const [loadingRecommenders, setLoadingRecommenders] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const setLetters = (next: LetterRequestRow[]) =>
    onSchoolChange({ ...school, letters: next });

  // Status and delete paint first, then reconcile with the server on failure.
  // Restoring the snapshot captured before the request would also undo a
  // sibling mutation that landed while this one was in flight, so the refetch
  // decides instead.
  const changeStatus = async (letter: LetterRequestRow, status: LetterStatusValue) => {
    setLetters(
      letters.map((row) => (row.id === letter.id ? { ...row, status } : row))
    );

    try {
      const response = await fetch("/api/letters", {
        method: "PATCH",
        headers: JSON_HEADERS,
        body: JSON.stringify({ id: letter.id, status }),
      });
      if (!response.ok) {
        throw new Error(await readError(response, "Failed to update letter"));
      }
    } catch (error) {
      notifyError(
        "Could not update letter",
        errorMessage(error, "Something went wrong while saving this letter.")
      );
      await onRefresh();
    }
  };

  const remove = async (letter: LetterRequestRow) => {
    setLetters(letters.filter((row) => row.id !== letter.id));

    try {
      const response = await fetch("/api/letters", {
        method: "DELETE",
        headers: JSON_HEADERS,
        body: JSON.stringify({ id: letter.id }),
      });
      if (!response.ok) {
        throw new Error(await readError(response, "Failed to delete letter"));
      }
    } catch (error) {
      notifyError(
        "Could not delete letter",
        errorMessage(error, "Something went wrong while deleting this letter.")
      );
      await onRefresh();
    }
  };

  const openPicker = async () => {
    setPicking(true);
    if (recommenders !== null || loadingRecommenders) {
      return;
    }

    setLoadingRecommenders(true);
    try {
      const response = await fetch("/api/recommenders");
      if (!response.ok) {
        throw new Error(await readError(response, "Failed to load recommenders"));
      }
      const data = await response.json();
      setRecommenders(Array.isArray(data) ? (data as RecommenderRow[]) : []);
    } catch (error) {
      // `recommenders` stays null so the picker offers a retry instead of
      // passing an empty list off as "you have no recommenders".
      notifyError(
        "Could not load recommenders",
        errorMessage(error, "Something went wrong while loading recommenders.")
      );
    } finally {
      setLoadingRecommenders(false);
    }
  };

  const cancelPicker = () => {
    setPicking(false);
    setSelected(null);
  };

  const request = async () => {
    if (!selected || saving) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/letters", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ school_id: school.id, recommender_id: selected }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Failed to request letter"
        );
      }
      setLetters([...letters, data as LetterRequestRow]);
      setSelected(null);
      setPicking(false);
    } catch (error) {
      notifyError(
        "Could not request letter",
        errorMessage(error, "Something went wrong while requesting this letter.")
      );
    } finally {
      setSaving(false);
    }
  };

  const requested = new Set(letters.map((letter) => letter.recommender_id));
  const available = (recommenders ?? [])
    .filter((recommender) => !requested.has(recommender.id))
    .map((recommender) => ({ value: recommender.id, label: recommender.name }));

  const renderPickerBody = () => {
    // Null means the fetch never succeeded — offer another go at it.
    if (recommenders === null) {
      return (
        <Group gap={6} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" c={ui.muted}>
            Could not load recommenders.
          </Text>
          <Button
            size="compact-xs"
            variant="subtle"
            color="gray"
            c={ui.ink}
            onClick={openPicker}
          >
            Retry
          </Button>
        </Group>
      );
    }

    if (recommenders.length === 0) {
      return (
        <Text size="sm" c={ui.muted} style={{ flex: 1, minWidth: 0 }}>
          No recommenders yet — add them on the{" "}
          <Link href="/recommenders" style={{ color: ui.body }}>
            Recommenders page
          </Link>
          .
        </Text>
      );
    }

    if (available.length === 0) {
      return (
        <Text size="sm" c={ui.muted} style={{ flex: 1, minWidth: 0 }}>
          Every recommender is already requested for this school.
        </Text>
      );
    }

    return (
      <>
        <Select
          size="xs"
          radius="md"
          placeholder="Pick a recommender"
          data={available}
          value={selected}
          onChange={setSelected}
          styles={inputStyles}
          style={{ flex: 1, minWidth: 0 }}
        />
        <Button
          size="xs"
          variant="subtle"
          color="gray"
          c={ui.ink}
          onClick={request}
          loading={saving}
          disabled={!selected}
        >
          Add
        </Button>
      </>
    );
  };

  return (
    <DetailCard title="Recommendation letters">
      <Stack gap={0}>
        {letters.map((letter) => (
          <Group
            key={letter.id}
            gap={8}
            wrap="nowrap"
            align="center"
            onMouseEnter={() => setHoveredId(letter.id)}
            onMouseLeave={() =>
              setHoveredId((id) => (id === letter.id ? null : id))
            }
            style={{ minHeight: 42 }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" c={ui.ink} truncate>
                {letter.recommender?.name ?? "Unknown"}
              </Text>
              {letter.recommender?.email ? (
                <Text size="xs" c={ui.muted} truncate>
                  {letter.recommender.email}
                </Text>
              ) : null}
            </div>
            <Select
              size="xs"
              radius="md"
              w={126}
              data={LETTER_STATUS_OPTIONS}
              value={letter.status}
              allowDeselect={false}
              checkIconPosition="right"
              onChange={(value) => {
                if (isLetterStatus(value) && value !== letter.status) {
                  changeStatus(letter, value);
                }
              }}
              styles={{
                ...inputStyles,
                input: {
                  color: letterStatusColor(letter.status),
                  fontWeight: 600,
                },
              }}
            />
            <ClearButton
              label={`Remove ${letter.recommender?.name ?? "letter"}`}
              visible={hoveredId === letter.id}
              onClick={() => remove(letter)}
            />
          </Group>
        ))}

        {letters.length === 0 ? (
          <Text size="sm" c={ui.muted}>
            No letters requested yet.
          </Text>
        ) : null}
      </Stack>

      {picking ? (
        <div style={{ marginTop: 10 }}>
          {loadingRecommenders ? (
            <Loader color={ui.emphasis} size="xs" />
          ) : (
            <Group gap={8} wrap="nowrap" align="center">
              {renderPickerBody()}
              <ClearButton label="Cancel" onClick={cancelPicker} />
            </Group>
          )}
        </div>
      ) : (
        <Button
          mt={6}
          size="compact-xs"
          variant="subtle"
          color="gray"
          c={ui.body}
          px={4}
          onClick={openPicker}
        >
          + Request letter
        </Button>
      )}
    </DetailCard>
  );
}
