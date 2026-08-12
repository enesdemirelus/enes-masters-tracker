"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import axios from "axios";
import { useDisclosure } from "@mantine/hooks";
import {
  dangerButtonStyle,
  errorMessage,
  inputStyles,
  modalStyles,
  notifyError,
  notifySuccess,
  overlayProps,
  primaryButtonStyle,
  recommendationCountBody,
  secondaryButtonStyle,
  toDisplay,
  ui,
} from "./modalTheme";
import { APPLY_OPTION_OPTIONS, PRIORITY_OPTIONS } from "@/app/theme";

interface EditSchoolDesktopModalProps {
  opened: boolean;
  onClose: () => void;
  onSchoolEdited?: () => void | Promise<void>;
  isMobile?: boolean;
  schoolIdProp: string;
  schoolNameProp: string;
  schoolLocationProp: string;
  /** Raw enum value: "MAIN" | "OTHERS". */
  schoolPriorityProp: string;
  schoolStatusProp: string;
  /** Raw enum value: "NON_THESIS" | "PROFESSIONAL" | "UNDECIDED". */
  schoolApplyOptionProp: string;
  schoolApplyOptionNoteProp?: string;
  schoolRemovedProp?: boolean;
  schoolGreProp?: string;
  schoolRecommendationCountProp?: number;
  schoolNonThesisOptionProp?: boolean;
  schoolProfessionalMastersProp?: boolean;
  schoolDurationProp?: string | null;
}

const STATUS_OPTIONS = ["Applying", "Applied", "Rejected", "Accepted"];
// "Removed" is only offered for schools that are already removed, so that the
// value round-trips on save. Active schools must go through the Remove button,
// which collects the removal reason that /api/remove-school requires.
const REMOVED_STATUS_OPTIONS = [...STATUS_OPTIONS, "Removed"];
const GRE_OPTIONS = ["Not Required", "Optional", "Required"];

/** Enum value -> Select option label. Blank values stay blank (placeholder). */
function toOption(value?: string | null): string {
  return value ? toDisplay(value) : "";
}

function EditSchoolDesktopModal({
  opened,
  onClose,
  onSchoolEdited,
  isMobile,
  schoolIdProp,
  schoolNameProp,
  schoolLocationProp,
  schoolPriorityProp,
  schoolStatusProp,
  schoolApplyOptionProp,
  schoolApplyOptionNoteProp,
  schoolRemovedProp = false,
  schoolGreProp,
  schoolRecommendationCountProp,
  schoolNonThesisOptionProp,
  schoolProfessionalMastersProp,
  schoolDurationProp,
}: EditSchoolDesktopModalProps) {
  const [schoolName, setSchoolName] = useState(schoolNameProp);
  const [schoolLocation, setSchoolLocation] = useState(schoolLocationProp);
  // Priority and apply-option Selects are keyed on the raw enum value, so no
  // label round-trip is needed for them.
  const [schoolPriority, setSchoolPriority] = useState(
    schoolPriorityProp || "OTHERS"
  );
  const [schoolStatus, setSchoolStatus] = useState(toOption(schoolStatusProp));
  const [applyOption, setApplyOption] = useState(
    schoolApplyOptionProp || "UNDECIDED"
  );
  const [applyOptionNote, setApplyOptionNote] = useState(
    schoolApplyOptionNoteProp ?? ""
  );
  const [gre, setGre] = useState(toOption(schoolGreProp) || "Not Required");
  const [recommendationCount, setRecommendationCount] = useState<
    number | string
  >(schoolRecommendationCountProp ?? 3);
  const [nonThesisOption, setNonThesisOption] = useState(
    schoolNonThesisOptionProp ?? false
  );
  const [professionalMasters, setProfessionalMasters] = useState(
    schoolProfessionalMastersProp ?? false
  );
  const [duration, setDuration] = useState(schoolDurationProp ?? "");
  const [removalReason, setRemovalReason] = useState("");
  const [pendingAction, setPendingAction] = useState<
    "edit" | "remove" | "delete" | "add-back" | null
  >(null);

  const isRemoved =
    schoolRemovedProp || toOption(schoolStatusProp) === "Removed";

  const [
    removeConfirmOpened,
    { open: openRemoveConfirm, close: closeRemoveConfirm },
  ] = useDisclosure(false);

  const [
    deleteConfirmOpened,
    { open: openDeleteConfirm, close: closeDeleteConfirm },
  ] = useDisclosure(false);

  const [
    addBackConfirmOpened,
    { open: openAddBackConfirm, close: closeAddBackConfirm },
  ] = useDisclosure(false);

  // `opened` is a dependency on purpose: reopening the modal on the *same*
  // school changes none of the props, so without it the fields would still be
  // holding the edits that were abandoned when the modal was last closed.
  useEffect(() => {
    setSchoolName(schoolNameProp);
    setSchoolLocation(schoolLocationProp);
    setSchoolPriority(schoolPriorityProp || "OTHERS");
    setSchoolStatus(toOption(schoolStatusProp));
    setApplyOption(schoolApplyOptionProp || "UNDECIDED");
    setApplyOptionNote(schoolApplyOptionNoteProp ?? "");
    setGre(toOption(schoolGreProp) || "Not Required");
    setRecommendationCount(schoolRecommendationCountProp ?? 3);
    setNonThesisOption(schoolNonThesisOptionProp ?? false);
    setProfessionalMasters(schoolProfessionalMastersProp ?? false);
    setDuration(schoolDurationProp ?? "");
    setRemovalReason("");
  }, [
    opened,
    schoolIdProp,
    schoolNameProp,
    schoolLocationProp,
    schoolPriorityProp,
    schoolStatusProp,
    schoolApplyOptionProp,
    schoolApplyOptionNoteProp,
    schoolGreProp,
    schoolRecommendationCountProp,
    schoolNonThesisOptionProp,
    schoolProfessionalMastersProp,
    schoolDurationProp,
  ]);

  const handleEditSchool = async () => {
    if (!schoolName.trim() || !schoolLocation.trim() || !schoolStatus) {
      notifyError(
        "Missing information",
        "Name, location and status are required."
      );
      return;
    }

    setPendingAction("edit");
    try {
      await axios.post("/api/edit-school", {
        id: schoolIdProp,
        name: schoolName.trim(),
        location: schoolLocation.trim(),
        // Raw enum values; the API also accepts display labels.
        priority: schoolPriority,
        status: schoolStatus,
        apply_option: applyOption,
        apply_option_note: applyOptionNote.trim(),
        gre,
        // Omitted when the field is left blank: the edit API only writes the
        // fields it receives, so the stored value stays untouched.
        ...recommendationCountBody(recommendationCount),
        non_thesis_option: nonThesisOption,
        professional_masters: professionalMasters,
        duration: duration.trim(),
      });

      notifySuccess("School updated", `${schoolName.trim()} has been saved.`);

      if (onSchoolEdited) {
        await onSchoolEdited();
      }

      onClose();
    } catch (error) {
      notifyError(
        "Could not update school",
        errorMessage(error, "Something went wrong while saving this school.")
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleRemoveSchool = async () => {
    setPendingAction("remove");
    try {
      await axios.post("/api/remove-school", {
        id: schoolIdProp,
        removal_reason: removalReason,
      });

      notifySuccess(
        "School removed",
        `${schoolName} has been moved to your removed schools.`
      );

      if (onSchoolEdited) {
        await onSchoolEdited();
      }

      closeRemoveConfirm();
      onClose();
    } catch (error) {
      notifyError(
        "Could not remove school",
        errorMessage(error, "Something went wrong while removing this school.")
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleAddSchoolBack = async () => {
    setPendingAction("add-back");
    try {
      await axios.post("/api/add-school-back", { id: schoolIdProp });

      notifySuccess(
        "School restored",
        `${schoolName} is back in your active schools.`
      );

      if (onSchoolEdited) {
        await onSchoolEdited();
      }

      closeAddBackConfirm();
      onClose();
    } catch (error) {
      notifyError(
        "Could not restore school",
        errorMessage(error, "Something went wrong while restoring this school.")
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleDeleteForever = async () => {
    setPendingAction("delete");
    try {
      await axios.post("/api/delete-school", { id: schoolIdProp });

      notifySuccess(
        "School deleted",
        `${schoolName} has been permanently deleted.`
      );

      if (onSchoolEdited) {
        await onSchoolEdited();
      }

      closeDeleteConfirm();
      onClose();
    } catch (error) {
      notifyError(
        "Could not delete school",
        errorMessage(error, "Something went wrong while deleting this school.")
      );
    } finally {
      setPendingAction(null);
    }
  };

  const busy = pendingAction !== null;

  return (
    <>
      <Modal
        centered={isMobile}
        opened={opened}
        onClose={onClose}
        title="Edit school"
        overlayProps={overlayProps}
        styles={modalStyles}
        radius={8}
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="School name"
            placeholder="School name"
            size="md"
            radius="md"
            value={schoolName}
            onChange={(event) => setSchoolName(event.currentTarget.value)}
            styles={inputStyles}
          />
          <TextInput
            label="Location"
            placeholder="Location"
            size="md"
            radius="md"
            value={schoolLocation}
            onChange={(event) => setSchoolLocation(event.currentTarget.value)}
            styles={inputStyles}
          />
          <Select
            label="Priority"
            placeholder="Select a priority"
            data={PRIORITY_OPTIONS}
            size="md"
            radius="md"
            value={schoolPriority}
            onChange={(value) => setSchoolPriority(value ?? "OTHERS")}
            styles={inputStyles}
          />
          <Select
            label="Status"
            placeholder="Select a status"
            data={isRemoved ? REMOVED_STATUS_OPTIONS : STATUS_OPTIONS}
            size="md"
            radius="md"
            value={schoolStatus}
            onChange={(value) => setSchoolStatus(value ?? "Applying")}
            styles={inputStyles}
          />
          <Select
            label="Applying as"
            placeholder="Select a program option"
            data={APPLY_OPTION_OPTIONS}
            size="md"
            radius="md"
            value={applyOption}
            onChange={(value) => setApplyOption(value ?? "UNDECIDED")}
            styles={inputStyles}
          />
          <TextInput
            label="Apply option note"
            placeholder="Why this option? (shown on hover)"
            size="md"
            radius="md"
            value={applyOptionNote}
            onChange={(event) => setApplyOptionNote(event.currentTarget.value)}
            styles={inputStyles}
          />
          <Select
            label="GRE"
            placeholder="Select GRE requirement"
            data={GRE_OPTIONS}
            size="md"
            radius="md"
            value={gre}
            onChange={(value) => setGre(value ?? "Not Required")}
            styles={inputStyles}
          />
          <NumberInput
            label="Recommendation letters"
            placeholder="3"
            min={0}
            max={10}
            clampBehavior="strict"
            allowDecimal={false}
            allowNegative={false}
            size="md"
            radius="md"
            value={recommendationCount}
            onChange={setRecommendationCount}
            styles={inputStyles}
          />
          <TextInput
            label="Duration"
            placeholder='e.g. "1.5 years", "2 years", "4Q + Internship"'
            size="md"
            radius="md"
            value={duration}
            onChange={(event) => setDuration(event.currentTarget.value)}
            styles={inputStyles}
          />
          <Checkbox
            label="Non-thesis option"
            color={ui.ink}
            iconColor={ui.onInk}
            checked={nonThesisOption}
            onChange={(event) => setNonThesisOption(event.currentTarget.checked)}
            styles={{ label: { color: ui.body } }}
          />
          <Checkbox
            label="Professional masters"
            color={ui.ink}
            iconColor={ui.onInk}
            checked={professionalMasters}
            onChange={(event) =>
              setProfessionalMasters(event.currentTarget.checked)
            }
            styles={{ label: { color: ui.body } }}
          />

          <Group justify="space-between" gap="sm" mt="xs">
            <Button
              size="md"
              variant="default"
              style={dangerButtonStyle}
              onClick={openDeleteConfirm}
              disabled={busy}
            >
              Delete forever
            </Button>
            <Group gap="sm">
              {isRemoved ? (
                <Button
                  size="md"
                  variant="default"
                  style={secondaryButtonStyle}
                  onClick={openAddBackConfirm}
                  disabled={busy}
                >
                  Add back
                </Button>
              ) : (
                <Button
                  size="md"
                  variant="default"
                  style={secondaryButtonStyle}
                  onClick={openRemoveConfirm}
                  disabled={busy}
                >
                  Remove
                </Button>
              )}
              <Button
                size="md"
                style={primaryButtonStyle}
                onClick={handleEditSchool}
                loading={pendingAction === "edit"}
                disabled={busy && pendingAction !== "edit"}
              >
                Save changes
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>

      <Modal
        centered
        opened={removeConfirmOpened}
        onClose={closeRemoveConfirm}
        title="Remove school"
        overlayProps={overlayProps}
        styles={modalStyles}
        radius={8}
      >
        <Stack gap="md">
          <Text size="sm" c={ui.body}>
            Remove {schoolName} from your active schools? You can add it back
            later.
          </Text>
          <TextInput
            label="Removal reason"
            placeholder="Why are you removing it?"
            size="md"
            radius="md"
            value={removalReason}
            onChange={(event) => setRemovalReason(event.currentTarget.value)}
            styles={inputStyles}
          />
          <Group justify="flex-end" gap="sm">
            <Button
              size="md"
              variant="default"
              style={secondaryButtonStyle}
              onClick={closeRemoveConfirm}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              size="md"
              style={primaryButtonStyle}
              onClick={handleRemoveSchool}
              disabled={!removalReason.trim() || busy}
              loading={pendingAction === "remove"}
            >
              Remove school
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        centered
        opened={deleteConfirmOpened}
        onClose={closeDeleteConfirm}
        title="Delete school forever"
        overlayProps={overlayProps}
        styles={modalStyles}
        radius={8}
      >
        <Stack gap="md">
          <Text size="sm" c={ui.ink} fw={600}>
            This cannot be undone.
          </Text>
          <Text size="sm" c={ui.body}>
            {schoolName} will be permanently deleted from your tracker.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              size="md"
              variant="default"
              style={secondaryButtonStyle}
              onClick={closeDeleteConfirm}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              size="md"
              variant="default"
              style={dangerButtonStyle}
              onClick={handleDeleteForever}
              loading={pendingAction === "delete"}
              disabled={busy && pendingAction !== "delete"}
            >
              Delete forever
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        centered
        opened={addBackConfirmOpened}
        onClose={closeAddBackConfirm}
        title="Add school back"
        overlayProps={overlayProps}
        styles={modalStyles}
        radius={8}
      >
        <Stack gap="md">
          <Text size="sm" c={ui.body}>
            Move {schoolName} back into your active schools?
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              size="md"
              variant="default"
              style={secondaryButtonStyle}
              onClick={closeAddBackConfirm}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              size="md"
              style={primaryButtonStyle}
              onClick={handleAddSchoolBack}
              loading={pendingAction === "add-back"}
              disabled={busy && pendingAction !== "add-back"}
            >
              Add back
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

export default EditSchoolDesktopModal;
