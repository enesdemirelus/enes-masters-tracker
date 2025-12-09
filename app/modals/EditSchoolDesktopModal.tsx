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
  schoolRemovedProp?: boolean;
}

function convertToDisplayFormat(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
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
  schoolRemovedProp = false,
}: EditSchoolDesktopModalProps) {
  const [schoolName, setSchoolName] = useState(schoolNameProp);
  const [schoolLocation, setSchoolLocation] = useState(schoolLocationProp);
  const [schoolTier, setSchoolTier] = useState(
    convertToDisplayFormat(schoolTierProp)
  );
  const [schoolCategory, setSchoolCategory] = useState(
    convertToDisplayFormat(schoolCategoryProp)
  );
  const [schoolStatus, setSchoolStatus] = useState(
    convertToDisplayFormat(schoolStatusProp)
  );
  const [schoolMsStatus, setSchoolMsStatus] = useState(
    convertToDisplayFormat(schoolMsStatusProp)
  );
  const [isEdited, setIsEdited] = useState(false);
  const [removalReason, setRemovalReason] = useState("");

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
    setSchoolTier(convertToDisplayFormat(schoolTierProp));
    setSchoolCategory(convertToDisplayFormat(schoolCategoryProp));
    setSchoolStatus(convertToDisplayFormat(schoolStatusProp));
    setSchoolMsStatus(convertToDisplayFormat(schoolMsStatusProp));
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
    await axios.post("/masters/api/edit-school", {
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

  const handleRemoveSchool = async () => {
    await axios.post("/masters/api/remove-school", {
      id: schoolIdProp,
      removal_reason: removalReason,
    });

    notifications.show({
      title: "School Removed Successfully!",
      message: `${schoolName} has been removed from your tracker.`,
      color: "orange",
      icon: <IconCheck size={18} />,
      autoClose: 4000,
      styles: {
        root: {
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(10px)",
          borderLeft: "4px solid #f97316",
        },
        title: {
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 700,
        },
        description: {
          color: "#555",
        },
        icon: {
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        },
      },
    });

    if (onSchoolEdited) {
      await onSchoolEdited();
    }

    closeRemoveConfirm();
    onClose();
  };

  const handleAddSchoolBack = async () => {
    await axios.post("/masters/api/add-school-back", {
      id: schoolIdProp,
    });

    notifications.show({
      title: "School Added Back Successfully!",
      message: `${schoolName} has been added back to your tracker.`,
      color: "yellow",
      icon: <IconCheck size={18} />,
      autoClose: 4000,
      styles: {
        root: {
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(10px)",
          borderLeft: "4px solid #eab308",
        },
        title: {
          background: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 700,
        },
        description: {
          color: "#555",
        },
        icon: {
          background: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
        },
      },
    });

    if (onSchoolEdited) {
      await onSchoolEdited();
    }

    closeAddBackConfirm();
    onClose();
  };

  const handleDeleteForever = async () => {
    await axios.post("/masters/api/delete-school", {
      id: schoolIdProp,
    });

    notifications.show({
      title: "School Deleted Forever!",
      message: `${schoolName} has been permanently deleted from your tracker.`,
      color: "red",
      icon: <IconCheck size={18} />,
      autoClose: 4000,
      styles: {
        root: {
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(10px)",
          borderLeft: "4px solid #dc2626",
        },
        title: {
          background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 700,
        },
        description: {
          color: "#555",
        },
        icon: {
          background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
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
            data={["Safety", "Target", "Reach"]}
            size="md"
            radius="md"
            value={schoolTier}
            onChange={(value) => setSchoolTier(value ?? "Safety")}
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
              "Around Illinois",
              "In Chicago",
              "In Illinois",
              "In California",
              "Far",
            ]}
            size="md"
            radius="md"
            value={schoolCategory}
            onChange={(value) => setSchoolCategory(value ?? "In Chicago")}
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
            data={["Applying", "Applied", "Rejected", "Accepted", "Removed"]}
            size="md"
            radius="md"
            value={schoolStatus}
            onChange={(value) => setSchoolStatus(value ?? "Applying")}
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
            data={["Research Based", "Professional Track", "No Masters"]}
            size="md"
            radius="md"
            value={schoolMsStatus}
            onChange={(value) => setSchoolMsStatus(value ?? "Research Based")}
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
          {schoolRemovedProp ? (
            <Button
              onClick={openAddBackConfirm}
              variant="gradient"
              gradient={{ from: "#eab308", to: "#ca8a04", deg: 135 }}
              size="md"
              radius="md"
              style={{
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(234, 179, 8, 0.3)",
              }}
            >
              Add School Back
            </Button>
          ) : (
            <Button
              onClick={openRemoveConfirm}
              variant="gradient"
              gradient={{ from: "#f97316", to: "#ea580c", deg: 135 }}
              size="md"
              radius="md"
              style={{
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
              }}
            >
              Remove School
            </Button>
          )}
          <Button
            onClick={openDeleteConfirm}
            variant="gradient"
            gradient={{ from: "#dc2626", to: "#991b1b", deg: 135 }}
            size="md"
            radius="md"
            style={{
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
            }}
          >
            Delete Forever
          </Button>
        </div>
      </Modal>
      <Modal
        opened={removeConfirmOpened}
        onClose={closeRemoveConfirm}
        title="Remove School"
      >
        <div className="flex flex-col gap-4">
          <Text>Are you sure you want to remove {schoolName}?</Text>
          <Input
            placeholder="Enter removal reason"
            size="md"
            radius="md"
            value={removalReason}
            onChange={(e) => setRemovalReason(e.target.value)}
            required
            styles={{
              input: {
                borderColor: "#e0e0e0",
                "&:focus": {
                  borderColor: "#f97316",
                },
              },
            }}
          />
          <Button
            onClick={handleRemoveSchool}
            variant="gradient"
            gradient={{ from: "#f97316", to: "#ea580c", deg: 135 }}
            size="md"
            radius="md"
            disabled={!removalReason.trim()}
          >
            Yes, Remove School
          </Button>
          <Button
            onClick={closeRemoveConfirm}
            variant="gradient"
            gradient={{ from: "#10b981", to: "#059669", deg: 135 }}
            size="md"
            radius="md"
          >
            No, Cancel
          </Button>
        </div>
      </Modal>
      <Modal
        opened={deleteConfirmOpened}
        onClose={closeDeleteConfirm}
        title="Delete School Forever"
      >
        <div className="flex flex-col gap-4">
          <Text>⚠️ WARNING: This action cannot be undone!</Text>
          <Text>
            Are you absolutely sure you want to permanently delete {schoolName}?
          </Text>
          <Button
            onClick={handleDeleteForever}
            variant="gradient"
            gradient={{ from: "#dc2626", to: "#991b1b", deg: 135 }}
            size="md"
            radius="md"
          >
            Yes, Delete Forever
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
      <Modal
        opened={addBackConfirmOpened}
        onClose={closeAddBackConfirm}
        title="Add School Back"
      >
        <div className="flex flex-col gap-4">
          <Text>
            Are you sure you want to add {schoolName} back to your active
            schools?
          </Text>
          <Button
            onClick={handleAddSchoolBack}
            variant="gradient"
            gradient={{ from: "#10b981", to: "#059669", deg: 135 }}
            size="md"
            radius="md"
          >
            Yes, Add School Back
          </Button>
          <Button
            onClick={closeAddBackConfirm}
            variant="gradient"
            gradient={{ from: "#f97316", to: "#ea580c", deg: 135 }}
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
