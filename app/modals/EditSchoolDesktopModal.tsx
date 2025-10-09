import React, { useState, useEffect } from "react";
import { Button, Input, Modal, Select, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import axios from "axios";
import { useDisclosure } from "@mantine/hooks";

interface EditSchoolDesktopModalProps {
  opened: boolean;
  onClose: () => void;
  onSchoolEdited?: () => void;
  isMobile?: boolean;
  schoolIdProp: string;
  schoolNameProp: string;
  schoolLocationProp: string;
  schoolTierProp: string;
  schoolCategoryProp: string;
  schoolStatusProp: string;
  schoolMsStatusProp: string;
}

function EditSchoolDesktopModal({
  opened,
  onClose,
  onSchoolEdited,
  isMobile,
  schoolIdProp,
  schoolNameProp,
  schoolLocationProp,
  schoolTierProp,
  schoolCategoryProp,
  schoolStatusProp,
  schoolMsStatusProp,
}: EditSchoolDesktopModalProps) {
  const [schoolName, setSchoolName] = useState(schoolNameProp);
  const [schoolLocation, setSchoolLocation] = useState(schoolLocationProp);
  const [schoolTier, setSchoolTier] = useState(schoolTierProp);
  const [schoolCategory, setSchoolCategory] = useState(schoolCategoryProp);
  const [schoolStatus, setSchoolStatus] = useState(schoolStatusProp);
  const [schoolMsStatus, setSchoolMsStatus] = useState(schoolMsStatusProp);
  const [isEdited, setIsEdited] = useState(false);

  const [
    deleteConfirmOpened,
    { open: openDeleteConfirm, close: closeDeleteConfirm },
  ] = useDisclosure(false);
  useEffect(() => {
    setSchoolName(schoolNameProp);
    setSchoolLocation(schoolLocationProp);
    setSchoolTier(schoolTierProp);
    setSchoolCategory(schoolCategoryProp);
    setSchoolStatus(schoolStatusProp);
    setSchoolMsStatus(schoolMsStatusProp);
  }, [
    schoolIdProp,
    schoolNameProp,
    schoolLocationProp,
    schoolTierProp,
    schoolCategoryProp,
    schoolStatusProp,
    schoolMsStatusProp,
  ]);

  const handleEditSchool = async () => {
    await axios.post("/api/edit-school", {
      id: schoolIdProp,
      name: schoolName,
      location: schoolLocation,
      tiers: schoolTier,
      category: schoolCategory,
      status: schoolStatus,
      ms_status: schoolMsStatus,
    });
    setIsEdited(true);

    notifications.show({
      title: "School Edited Successfully!",
      message: `${schoolName} has been edited in your tracker.`,
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

    if (onSchoolEdited) {
      await onSchoolEdited();
    }

    onClose();
  };

  const handleDeleteSchool = async () => {
    await axios.post("/api/delete-school", {
      id: schoolIdProp,
    });

    notifications.show({
      title: "School Deleted Successfully!",
      message: `${schoolName} has been deleted from your tracker.`,
      color: "red",
      icon: <IconCheck size={18} />,
      autoClose: 4000,
      styles: {
        root: {
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(10px)",
          borderLeft: "4px solid #ef4444",
        },
        title: {
          background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 700,
        },
        description: {
          color: "#555",
        },
        icon: {
          background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
        },
      },
    });

    if (onSchoolEdited) {
      await onSchoolEdited();
    }

    closeDeleteConfirm();
    onClose();
  };

  return (
    <>
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
            Edit a school
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
            onClick={handleEditSchool}
            variant="gradient"
            gradient={{ from: "#10b981", to: "#059669", deg: 135 }}
            size="md"
            radius="md"
            style={{
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
            }}
          >
            Edit School
          </Button>
          <Button
            onClick={openDeleteConfirm}
            variant="gradient"
            gradient={{ from: "#ef4444", to: "#b91c1c", deg: 135 }}
            size="md"
            radius="md"
            style={{
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
            }}
          >
            Delete School
          </Button>
        </div>
      </Modal>
      <Modal
        opened={deleteConfirmOpened}
        onClose={closeDeleteConfirm}
        title="Delete School"
      >
        <div className="flex flex-col gap-4">
          <Text>Are you sure you want to delete {schoolName}?</Text>
          <Button
            onClick={handleDeleteSchool}
            variant="gradient"
            gradient={{ from: "#ef4444", to: "#b91c1c", deg: 135 }}
            size="md"
            radius="md"
          >
            Delete School
          </Button>
          <Button
            onClick={closeDeleteConfirm}
            variant="gradient"
            gradient={{ from: "#10b981", to: "#059669", deg: 135 }}
            size="md"
            radius="md"
          >
            No, Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default EditSchoolDesktopModal;
