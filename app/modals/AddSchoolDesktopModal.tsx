import React, { useState } from "react";
import { Button, Input, Modal, Select } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import axios from "axios";

interface AddSchoolDesktopModalProps {
  opened: boolean;
  onClose: () => void;
  onSchoolAdded?: () => void;
  isMobile?: boolean;
}

function AddSchoolDesktopModal({
  opened,
  onClose,
  onSchoolAdded,
  isMobile,
}: AddSchoolDesktopModalProps) {
  const [schoolName, setSchoolName] = useState("");
  const [schoolLocation, setSchoolLocation] = useState("");
  const [schoolTier, setSchoolTier] = useState("");
  const [schoolCategory, setSchoolCategory] = useState("");
  const [schoolStatus, setSchoolStatus] = useState("");
  const [schoolMsStatus, setSchoolMsStatus] = useState("");
  const [isAdded, setIsAdded] = useState(false);

  const handleAddSchool = async () => {
    await axios.post("/masters/api/add-school", {
      name: schoolName,
      location: schoolLocation,
      tiers: schoolTier,
      category: schoolCategory,
      status: schoolStatus,
      ms_status: schoolMsStatus,
    });
    setIsAdded(true);

    notifications.show({
      title: "School Added Successfully!",
      message: `${schoolName} has been added to your tracker.`,
      color: "teal",
      icon: <IconCheck size={18} />,
      autoClose: 4000,
      styles: {
        root: {
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(10px)",
          borderLeft: "4px solid #10b981",
        },
        title: {
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 700,
        },
        description: {
          color: "#555",
        },
        icon: {
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        },
      },
    });

    if (onSchoolAdded) {
      await onSchoolAdded();
    }

    setSchoolName("");
    setSchoolLocation("");
    setSchoolTier("");
    setSchoolCategory("");
    setSchoolStatus("");
    setSchoolMsStatus("");
    onClose();
  };
  return (
    <Modal
      centered={isMobile}
      opened={opened}
      onClose={onClose}
      title={
        <span
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
            fontSize: "1.25rem",
          }}
        >
          Add a new school
        </span>
      }
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        content: {
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(10px)",
        },
      }}
      radius="md"
      size="md"
    >
      <div className="flex flex-col gap-4">
        <Input
          placeholder="School Name"
          size="md"
          radius="md"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          styles={{
            input: {
              borderColor: "#e0e0e0",
              "&:focus": {
                borderColor: "#10b981",
              },
            },
          }}
        />
        <Input
          placeholder="School Location"
          size="md"
          radius="md"
          value={schoolLocation}
          onChange={(e) => setSchoolLocation(e.target.value)}
          styles={{
            input: {
              borderColor: "#e0e0e0",
              "&:focus": {
                borderColor: "#10b981",
              },
            },
          }}
        />
        <Select
          placeholder="School Tier"
          data={["SAFETY", "TARGET", "REACH"]}
          size="md"
          radius="md"
          value={schoolTier}
          onChange={(value) => setSchoolTier(value ?? "SAFETY")}
          styles={{
            input: {
              borderColor: "#e0e0e0",
              "&:focus": {
                borderColor: "#10b981",
              },
            },
          }}
        />
        <Select
          placeholder="School Category"
          data={[
            "AROUND_ILLINOIS",
            "IN_CHICAGO",
            "IN_ILLINOIS",
            "IN_CALIFORNIA",
            "FAR",
          ]}
          size="md"
          radius="md"
          value={schoolCategory}
          onChange={(value) => setSchoolCategory(value ?? "IN_CHICAGO")}
          styles={{
            input: {
              borderColor: "#e0e0e0",
              "&:focus": {
                borderColor: "#10b981",
              },
            },
          }}
        />
        <Select
          placeholder="School Status"
          data={["APPLYING", "APPLIED", "REJECTED", "ACCEPTED"]}
          size="md"
          radius="md"
          value={schoolStatus}
          onChange={(value) => setSchoolStatus(value ?? "APPLYING")}
          styles={{
            input: {
              borderColor: "#e0e0e0",
              "&:focus": {
                borderColor: "#10b981",
              },
            },
          }}
        />
        <Select
          placeholder="School MS Status"
          data={["RESEARCH_BASED", "PROFESSIONAL_TRACK", "NO_MASTERS"]}
          size="md"
          radius="md"
          value={schoolMsStatus}
          onChange={(value) => setSchoolMsStatus(value ?? "RESEARCH_BASED")}
          styles={{
            input: {
              borderColor: "#e0e0e0",
              "&:focus": {
                borderColor: "#10b981",
              },
            },
          }}
        />
        <Button
          onClick={handleAddSchool}
          variant="gradient"
          gradient={{ from: "#10b981", to: "#059669", deg: 135 }}
          size="md"
          radius="md"
          style={{
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
          }}
        >
          Add School
        </Button>
      </div>
    </Modal>
  );
}

export default AddSchoolDesktopModal;
