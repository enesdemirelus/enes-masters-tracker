"use client";

import { useState } from "react";
import {
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import axios from "axios";
import {
  errorMessage,
  inputStyles,
  modalStyles,
  notifyError,
  notifySuccess,
  overlayProps,
  primaryButtonStyle,
  recommendationCountBody,
  secondaryButtonStyle,
  ui,
} from "./modalTheme";

interface AddSchoolDesktopModalProps {
  opened: boolean;
  onClose: () => void;
  onSchoolAdded?: () => void | Promise<void>;
  isMobile?: boolean;
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
const MS_STATUS_OPTIONS = ["Research Based", "Professional Track", "No Masters"];
const GRE_OPTIONS = ["Not Required", "Optional", "Required"];

function AddSchoolDesktopModal({
  opened,
  onClose,
  onSchoolAdded,
  isMobile,
}: AddSchoolDesktopModalProps) {
  const [schoolName, setSchoolName] = useState("");
  const [schoolLocation, setSchoolLocation] = useState("");
  const [schoolPriority, setSchoolPriority] = useState("Low");
  const [schoolTier, setSchoolTier] = useState("");
  const [schoolCategory, setSchoolCategory] = useState("");
  const [schoolStatus, setSchoolStatus] = useState("Applying");
  const [schoolMsStatus, setSchoolMsStatus] = useState("");
  const [gre, setGre] = useState("Not Required");
  const [recommendationCount, setRecommendationCount] = useState<
    number | string
  >(3);
  const [nonThesisOption, setNonThesisOption] = useState(false);
  const [professionalMasters, setProfessionalMasters] = useState(false);
  const [duration, setDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setSchoolName("");
    setSchoolLocation("");
    setSchoolPriority("Low");
    setSchoolTier("");
    setSchoolCategory("");
    setSchoolStatus("Applying");
    setSchoolMsStatus("");
    setGre("Not Required");
    setRecommendationCount(3);
    setNonThesisOption(false);
    setProfessionalMasters(false);
    setDuration("");
  };

  const handleAddSchool = async () => {
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

    setIsSubmitting(true);
    try {
      await axios.post("/api/add-school", {
        name: schoolName.trim(),
        location: schoolLocation.trim(),
        priority: schoolPriority,
        tiers: schoolTier,
        category: schoolCategory,
        status: schoolStatus,
        ms_status: schoolMsStatus,
        gre,
        // Omitted when the field is left blank so the schema default (3) wins.
        ...recommendationCountBody(recommendationCount),
        non_thesis_option: nonThesisOption,
        professional_masters: professionalMasters,
        duration: duration.trim(),
      });

      notifySuccess(
        "School added",
        `${schoolName.trim()} has been added to your tracker.`
      );

      if (onSchoolAdded) {
        await onSchoolAdded();
      }

      resetForm();
      onClose();
    } catch (error) {
      // Keep the modal open so the entered values are not lost.
      notifyError(
        "Could not add school",
        errorMessage(error, "Something went wrong while saving this school.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      centered={isMobile}
      opened={opened}
      onClose={onClose}
      title="Add a new school"
      overlayProps={overlayProps}
      styles={modalStyles}
      radius={8}
      size="md"
    >
      <Stack gap="md">
        <TextInput
          label="School name"
          placeholder="University of Illinois"
          size="md"
          radius="md"
          value={schoolName}
          onChange={(event) => setSchoolName(event.currentTarget.value)}
          styles={inputStyles}
        />
        <TextInput
          label="Location"
          placeholder="Urbana, IL"
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
          data={STATUS_OPTIONS}
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

        <Group justify="flex-end" gap="sm" mt="xs">
          <Button
            size="md"
            variant="default"
            style={secondaryButtonStyle}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            size="md"
            style={primaryButtonStyle}
            onClick={handleAddSchool}
            loading={isSubmitting}
          >
            Add school
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default AddSchoolDesktopModal;
