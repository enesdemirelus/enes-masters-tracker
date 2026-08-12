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

interface EditSchoolDesktopModalProps {
  opened: boolean;
  onClose: () => void;
  onSchoolEdited?: () => void | Promise<void>;
  isMobile?: boolean;
  schoolIdProp: string;
  schoolNameProp: string;
  schoolLocationProp: string;
  schoolPriorityProp: string;
  schoolTierProp: string;
  schoolCategoryProp: string;
  schoolStatusProp: string;
  schoolMsStatusProp: string;
  schoolRemovedProp?: boolean;
  schoolGreProp?: string;
  schoolRecommendationCountProp?: number;
  schoolNonThesisOptionProp?: boolean;
  schoolProfessionalMastersProp?: boolean;
  schoolDurationProp?: string | null;
}

const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
const TIER_OPTIONS = ["Safety", "Target", "Reach", "Not Sure"];
const CATEGORY_OPTIONS = [
  "Around Illinois",
  "In Chicago",
  "In Illinois",
  "In California",
  "Far",
];
const STATUS_OPTIONS = ["Applying", "Applied", "Rejected", "Accepted"];
// "Removed" is only offered for schools that are already removed, so that the
// value round-trips on save. Active schools must go through the Remove button,
// which collects the removal reason that /api/remove-school requires.
const REMOVED_STATUS_OPTIONS = [...STATUS_OPTIONS, "Removed"];
const MS_STATUS_OPTIONS = ["Research Based", "Professional Track", "No Masters"];
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
  schoolTierProp,
  schoolCategoryProp,
  schoolStatusProp,
  schoolMsStatusProp,
  schoolRemovedProp = false,
  schoolGreProp,
  schoolRecommendationCountProp,
  schoolNonThesisOptionProp,
  schoolProfessionalMastersProp,
  schoolDurationProp,
}: EditSchoolDesktopModalProps) {
  const [schoolName, setSchoolName] = useState(schoolNameProp);
  const [schoolLocation, setSchoolLocation] = useState(schoolLocationProp);
  const [schoolPriority, setSchoolPriority] = useState(
    toOption(schoolPriorityProp)
  );
  const [schoolTier, setSchoolTier] = useState(toOption(schoolTierProp));
  const [schoolCategory, setSchoolCategory] = useState(
    toOption(schoolCategoryProp)
  );
  const [schoolStatus, setSchoolStatus] = useState(toOption(schoolStatusProp));
  const [schoolMsStatus, setSchoolMsStatus] = useState(
    toOption(schoolMsStatusProp)
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

  useEffect(() => {
    setSchoolName(schoolNameProp);
    setSchoolLocation(schoolLocationProp);
    setSchoolPriority(toOption(schoolPriorityProp));
    setSchoolTier(toOption(schoolTierProp));
    setSchoolCategory(toOption(schoolCategoryProp));
    setSchoolStatus(toOption(schoolStatusProp));
    setSchoolMsStatus(toOption(schoolMsStatusProp));
    setGre(toOption(schoolGreProp) || "Not Required");
    setRecommendationCount(schoolRecommendationCountProp ?? 3);
    setNonThesisOption(schoolNonThesisOptionProp ?? false);
    setProfessionalMasters(schoolProfessionalMastersProp ?? false);
    setDuration(schoolDurationProp ?? "");
    setRemovalReason("");
  }, [
    schoolIdProp,
    schoolNameProp,
    schoolLocationProp,
    schoolPriorityProp,
    schoolTierProp,
    schoolCategoryProp,
    schoolStatusProp,
    schoolMsStatusProp,
    schoolGreProp,
    schoolRecommendationCountProp,
    schoolNonThesisOptionProp,
    schoolProfessionalMastersProp,
    schoolDurationProp,
  ]);

  const handleEditSchool = async () => {
    if (
      !schoolName.trim() ||
      !schoolLocation.trim() ||
      !schoolTier ||
      !schoolCategory ||
      !schoolStatus ||
      !schoolMsStatus
    ) {
      notifyError(
        "Missing information",
        "Name, location, tier, category, status and MS status are all required."
      );
      return;
    }

    setPendingAction("edit");
    try {
      await axios.post("/api/edit-school", {
        id: schoolIdProp,
        name: schoolName.trim(),
        location: schoolLocation.trim(),
        priority: schoolPriority,
        tiers: schoolTier,
        category: schoolCategory,
        status: schoolStatus,
        ms_status: schoolMsStatus,
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
            onChange={(value) => setSchoolPriority(value ?? "Low")}
            styles={inputStyles}
          />
          <Select
            label="Tier"
            placeholder="Select a tier"
            data={TIER_OPTIONS}
            size="md"
            radius="md"
            value={schoolTier}
            onChange={(value) => setSchoolTier(value ?? "")}
            styles={inputStyles}
          />
          <Select
            label="Location category"
            placeholder="Select a category"
            data={CATEGORY_OPTIONS}
            size="md"
            radius="md"
            value={schoolCategory}
            onChange={(value) => setSchoolCategory(value ?? "")}
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
            label="MS status"
            placeholder="Select an MS status"
            data={MS_STATUS_OPTIONS}
            size="md"
            radius="md"
            value={schoolMsStatus}
            onChange={(value) => setSchoolMsStatus(value ?? "")}
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
            checked={nonThesisOption}
            onChange={(event) => setNonThesisOption(event.currentTarget.checked)}
            styles={{ label: { color: ui.body } }}
          />
          <Checkbox
            label="Professional masters"
            color={ui.ink}
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
