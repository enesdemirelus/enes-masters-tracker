"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  ActionIcon,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import axios from "axios";
import {
  cardStyle,
  dangerButtonStyle,
  errorMessage,
  inputStyles,
  LETTER_STATUS_OPTIONS,
  LETTER_STATUSES,
  letterStatusColor,
  modalStyles,
  notifyError,
  notifySuccess,
  overlayProps,
  pageTitleStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  ui,
  type LetterStatusValue,
  type RecommenderWithLetters,
  type SchoolStatus,
} from "@/app/theme";

/* -------------------------------------------------------------------------- */
/* Types & constants                                                          */
/* -------------------------------------------------------------------------- */

/** The slice of `/api/get-school` the "request a letter" picker needs. */
interface PickerSchool {
  id: string;
  name: string;
  status: SchoolStatus;
  removed: boolean;
}

const cardPadStyle: CSSProperties = { ...cardStyle, padding: 20 };

const chipStyle = (color: string): CSSProperties => ({
  flexShrink: 0,
  fontSize: 11,
  fontWeight: 600,
  color,
  border: `1px solid ${color}`,
  borderRadius: 4,
  padding: "1px 6px",
  whiteSpace: "nowrap",
});

function isLetterStatus(value: string): value is LetterStatusValue {
  return (LETTER_STATUSES as string[]).includes(value);
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function RecommendersPage() {
  const [recommenders, setRecommenders] = useState<RecommenderWithLetters[]>([]);
  const [schools, setSchools] = useState<PickerSchool[]>([]);
  const [loading, setLoading] = useState(true);

  /* Add / edit form. `editing` is null while adding. */
  const [formOpened, setFormOpened] = useState(false);
  const [editing, setEditing] = useState<RecommenderWithLetters | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  /* Destructive confirm. */
  const [deleteTarget, setDeleteTarget] = useState<RecommenderWithLetters | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  /* Which recommender is waiting on a POST /api/letters. */
  const [linking, setLinking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);

    // The two lists are independent: a failing school fetch should still leave
    // the recommender cards usable (only the picker goes empty).
    const [recommenderResult, schoolResult] = await Promise.allSettled([
      fetch("/api/recommenders").then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch recommenders: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Unexpected response shape from /api/recommenders");
        }
        return data as RecommenderWithLetters[];
      }),
      fetch("/api/get-school").then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch schools: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Unexpected response shape from /api/get-school");
        }
        return data as PickerSchool[];
      }),
    ]);

    if (recommenderResult.status === "fulfilled") {
      setRecommenders(recommenderResult.value);
    } else {
      console.error("Error fetching recommenders:", recommenderResult.reason);
      setRecommenders([]);
      notifyError(
        "Could not load recommenders",
        "The recommender list is unavailable."
      );
    }

    if (schoolResult.status === "fulfilled") {
      setSchools(schoolResult.value);
    } else {
      console.error("Error fetching schools:", schoolResult.reason);
      setSchools([]);
      notifyError("Could not load schools", "The school picker is unavailable.");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeSchools = schools.filter(
    (school) => !school.removed && school.status !== "REMOVED"
  );

  /* ---------------------------------------------------------------------- */
  /* Add / edit                                                             */
  /* ---------------------------------------------------------------------- */

  const openAdd = () => {
    setEditing(null);
    setName("");
    setEmail("");
    setNotes("");
    setFormOpened(true);
  };

  const openEdit = (recommender: RecommenderWithLetters) => {
    setEditing(recommender);
    setName(recommender.name);
    setEmail(recommender.email ?? "");
    setNotes(recommender.notes ?? "");
    setFormOpened(true);
  };

  const closeForm = () => {
    if (!saving) {
      setFormOpened(false);
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      notifyError("Missing name", "A recommender needs a name.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: trimmedName,
        email: email.trim(),
        notes: notes.trim(),
      };

      if (editing) {
        await axios.patch("/api/recommenders", { id: editing.id, ...body });
        notifySuccess("Recommender updated", `${trimmedName} has been saved.`);
      } else {
        await axios.post("/api/recommenders", body);
        notifySuccess("Recommender added", `${trimmedName} is on the list.`);
      }

      setFormOpened(false);
      await load();
    } catch (error) {
      // Leave the form open so nothing typed is lost.
      notifyError(
        editing ? "Could not update recommender" : "Could not add recommender",
        errorMessage(error, "Something went wrong while saving.")
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Delete                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    try {
      await axios.delete("/api/recommenders", {
        data: { id: deleteTarget.id },
      });
      notifySuccess(
        "Recommender deleted",
        `${deleteTarget.name} has been removed.`
      );
      setDeleteTarget(null);
      await load();
    } catch (error) {
      notifyError(
        "Could not delete recommender",
        errorMessage(error, "Something went wrong while deleting.")
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Letter requests                                                        */
  /* ---------------------------------------------------------------------- */

  /** Optimistic: the select/row updates instantly and rolls back on failure. */
  const handleStatusChange = async (
    letterId: string,
    status: LetterStatusValue
  ) => {
    const snapshot = recommenders;
    setRecommenders((current) =>
      current.map((recommender) => ({
        ...recommender,
        letters: recommender.letters.map((letter) =>
          letter.id === letterId ? { ...letter, status } : letter
        ),
      }))
    );

    try {
      await axios.patch("/api/letters", { id: letterId, status });
    } catch (error) {
      setRecommenders(snapshot);
      notifyError(
        "Could not update letter",
        errorMessage(error, "The status was not saved.")
      );
    }
  };

  const handleRemoveLetter = async (letterId: string) => {
    const snapshot = recommenders;
    setRecommenders((current) =>
      current.map((recommender) => ({
        ...recommender,
        letters: recommender.letters.filter((letter) => letter.id !== letterId),
      }))
    );

    try {
      await axios.delete("/api/letters", { data: { id: letterId } });
    } catch (error) {
      setRecommenders(snapshot);
      notifyError(
        "Could not remove request",
        errorMessage(error, "The letter request is still there.")
      );
    }
  };

  const handleAddLetter = async (recommenderId: string, schoolId: string) => {
    setLinking(recommenderId);
    try {
      await axios.post("/api/letters", {
        school_id: schoolId,
        recommender_id: recommenderId,
      });
      await load();
    } catch (error) {
      // 409 = this pair already exists; the API message says so.
      notifyError(
        "Could not add request",
        errorMessage(error, "The letter request was not created.")
      );
    } finally {
      setLinking(null);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <>
      {/* Add / edit ------------------------------------------------------ */}
      <Modal
        opened={formOpened}
        onClose={closeForm}
        title={editing ? "Edit recommender" : "Add a recommender"}
        overlayProps={overlayProps}
        styles={modalStyles}
        radius={8}
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="Dr. Jane Doe"
            size="md"
            radius="md"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            styles={inputStyles}
          />
          <TextInput
            label="Email"
            placeholder="jane.doe@university.edu"
            size="md"
            radius="md"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            styles={inputStyles}
          />
          <Textarea
            label="Notes"
            placeholder="Advisor for the senior project — prefers two weeks' notice."
            autosize
            minRows={2}
            size="md"
            radius="md"
            value={notes}
            onChange={(event) => setNotes(event.currentTarget.value)}
            styles={inputStyles}
          />

          <Group justify="flex-end" gap="sm" mt="xs">
            <Button
              size="md"
              variant="default"
              style={secondaryButtonStyle}
              onClick={closeForm}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              size="md"
              style={primaryButtonStyle}
              onClick={handleSave}
              loading={saving}
            >
              {editing ? "Save changes" : "Add recommender"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete confirm -------------------------------------------------- */}
      <Modal
        opened={deleteTarget !== null}
        onClose={() => {
          if (!deleting) {
            setDeleteTarget(null);
          }
        }}
        title="Delete recommender?"
        overlayProps={overlayProps}
        styles={modalStyles}
        radius={8}
        size="sm"
      >
        <div style={{ fontSize: 14, color: ui.body }}>
          {deleteTarget?.name} will be deleted. Their letter requests will be
          removed.
        </div>
        <Group justify="flex-end" gap="sm" mt="lg">
          <Button
            size="md"
            variant="default"
            style={secondaryButtonStyle}
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            size="md"
            style={dangerButtonStyle}
            onClick={handleDelete}
            loading={deleting}
          >
            Delete
          </Button>
        </Group>
      </Modal>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Header -------------------------------------------------------- */}
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
              Recommenders
            </Title>
            <div style={{ color: ui.muted, fontSize: 13, marginTop: 4 }}>
              Track who writes your letters
            </div>
          </div>
          <Button size="sm" radius={6} style={primaryButtonStyle} onClick={openAdd}>
            Add recommender
          </Button>
        </div>

        {loading ? (
          <Center style={{ minHeight: "40vh" }}>
            <Loader color="dark" size="sm" />
          </Center>
        ) : recommenders.length === 0 ? (
          <div style={{ ...cardPadStyle, color: ui.muted, fontSize: 13 }}>
            No recommenders yet — add your professors and managers here.
          </div>
        ) : (
          recommenders.map((recommender) => (
            <RecommenderCard
              key={recommender.id}
              recommender={recommender}
              schools={activeSchools}
              linking={linking === recommender.id}
              onEdit={() => openEdit(recommender)}
              onDelete={() => setDeleteTarget(recommender)}
              onStatusChange={handleStatusChange}
              onRemoveLetter={handleRemoveLetter}
              onAddLetter={handleAddLetter}
            />
          ))
        )}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Card                                                                       */
/* -------------------------------------------------------------------------- */

function RecommenderCard({
  recommender,
  schools,
  linking,
  onEdit,
  onDelete,
  onStatusChange,
  onRemoveLetter,
  onAddLetter,
}: {
  recommender: RecommenderWithLetters;
  schools: PickerSchool[];
  linking: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (letterId: string, status: LetterStatusValue) => void;
  onRemoveLetter: (letterId: string) => void;
  onAddLetter: (recommenderId: string, schoolId: string) => void;
}) {
  const letters = recommender.letters;
  const submitted = letters.filter(
    (letter) => letter.status === "SUBMITTED"
  ).length;
  const allSubmitted = letters.length > 0 && submitted === letters.length;

  const linkedIds = new Set(letters.map((letter) => letter.school_id));
  const options = schools
    .filter((school) => !linkedIds.has(school.id))
    .map((school) => ({ value: school.id, label: school.name }));

  return (
    <div style={cardPadStyle}>
      {/* Header row ------------------------------------------------------ */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: ui.ink }}>
            {recommender.name}
          </div>
          {recommender.email && (
            <a
              href={`mailto:${recommender.email}`}
              style={{
                display: "inline-block",
                marginTop: 2,
                fontSize: 13,
                color: ui.muted,
                textDecoration: "none",
                wordBreak: "break-all",
              }}
            >
              {recommender.email}
            </a>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {letters.length > 0 && (
            <span style={chipStyle(allSubmitted ? ui.success : ui.body)}>
              {submitted}/{letters.length} submitted
            </span>
          )}
          <ActionIcon
            variant="subtle"
            size="md"
            radius={6}
            aria-label={`Edit ${recommender.name}`}
            style={{ color: ui.body }}
            onClick={onEdit}
          >
            <IconEdit size={17} stroke={1.5} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            size="md"
            radius={6}
            aria-label={`Delete ${recommender.name}`}
            style={{ color: ui.danger }}
            onClick={onDelete}
          >
            <IconTrash size={17} stroke={1.5} />
          </ActionIcon>
        </div>
      </div>

      {recommender.notes && (
        <div style={{ marginTop: 8, fontSize: 13, color: ui.body }}>
          {recommender.notes}
        </div>
      )}

      {/* Letters --------------------------------------------------------- */}
      <div style={{ marginTop: 14 }}>
        {letters.length === 0 ? (
          <div style={{ fontSize: 13, color: ui.muted }}>
            No letter requests yet
          </div>
        ) : (
          letters.map((letter, index) => (
            <div
              key={letter.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 0",
                borderTop: index === 0 ? "none" : `1px solid ${ui.border}`,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link
                  href={`/schools/${letter.school.id}`}
                  style={{
                    color: ui.ink,
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  {letter.school.name}
                </Link>
              </div>

              <Select
                data={LETTER_STATUS_OPTIONS}
                value={letter.status}
                onChange={(value) => {
                  if (value && isLetterStatus(value)) {
                    onStatusChange(letter.id, value);
                  }
                }}
                allowDeselect={false}
                size="xs"
                radius={6}
                w={132}
                styles={{
                  ...inputStyles,
                  input: {
                    color: letterStatusColor(letter.status),
                    fontWeight: 600,
                  },
                }}
              />

              <ActionIcon
                variant="subtle"
                size="sm"
                radius={6}
                aria-label={`Remove request for ${letter.school.name}`}
                style={{ color: ui.muted }}
                onClick={() => onRemoveLetter(letter.id)}
              >
                ✕
              </ActionIcon>
            </div>
          ))
        )}
      </div>

      {/* Add a request --------------------------------------------------- */}
      <div style={{ marginTop: 10 }}>
        <Select
          data={options}
          value={null}
          onChange={(value) => {
            if (value) {
              onAddLetter(recommender.id, value);
            }
          }}
          placeholder={
            options.length === 0
              ? "Every school is already requested"
              : "+ Request for school…"
          }
          disabled={options.length === 0 || linking}
          searchable
          nothingFoundMessage="No schools"
          size="xs"
          radius={6}
          w={260}
          maw="100%"
          styles={inputStyles}
        />
      </div>
    </div>
  );
}
