import React, { useState } from "react";
import {
  Modal,
  Text,
  Button,
  Badge,
  Divider,
  Paper,
  Group,
  Stack,
  List,
  ThemeIcon,
  ScrollArea,
  Card,
  SimpleGrid,
  Textarea,
  ActionIcon,
} from "@mantine/core";
import {
  IconCalendar,
  IconCurrencyDollar,
  IconBook,
  IconUsers,
  IconMapPin,
  IconCheck,
  IconClipboardList,
  IconBriefcase,
  IconSchool,
  IconFileText,
  IconX,
  IconEdit,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import Image from "next/image";

interface MoreInfoModalMobileProps {
  opened: boolean;
  onClose: () => void;
  schoolId: string;
  schoolName: string;
  schoolLogo: string;
  moreInfoNotes: string;
}

function MoreInfoModalMobile({
  opened,
  onClose,
  schoolName,
  schoolId,
  schoolLogo,
  moreInfoNotes,
}: MoreInfoModalMobileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(moreInfoNotes);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/add-more-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: schoolId,
          more_info_notes: editedNotes,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedNotes(moreInfoNotes);
    setIsEditing(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="95%"
      radius="lg"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        content: {
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          padding: 0,
          maxHeight: "90vh",
          margin: "20px auto",
        },
        header: {
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          padding: "16px 20px",
          borderBottom: "none",
          borderRadius: "12px 12px 0 0",
        },
        title: {
          width: "100%",
        },
        close: {
          color: "white",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          },
        },
        body: {
          padding: 0,
          borderRadius: "0 0 12px 12px",
        },
      }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Image
              src={schoolLogo || "/placeholder-logo.png"}
              alt={schoolName}
              width={40}
              height={40}
              style={{ objectFit: "contain" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Text
              style={{
                color: "white",
                fontSize: "1.25rem",
                fontWeight: 700,
                marginBottom: "2px",
                lineHeight: 1.2,
              }}
            >
              {schoolName}
            </Text>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Master's Program Details
            </Text>
          </div>
        </div>
      }
    >
      <ScrollArea h="calc(90vh - 140px)" type="auto">
        <div style={{ padding: "20px 16px" }}>
          {/* Quick Stats Section - Mobile Optimized */}
          <SimpleGrid cols={2} spacing="md" style={{ marginBottom: "24px" }}>
            <Card
              shadow="sm"
              padding="md"
              radius="md"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                textAlign: "center",
                minHeight: "100px",
              }}
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  padding: "8px",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconCalendar size={20} />
              </div>
              <Text size="lg" fw={700} mb={2}>
                Dec 15
              </Text>
              <Text size="xs" opacity={0.9}>
                Application Deadline
              </Text>
            </Card>
            <Card
              shadow="sm"
              padding="md"
              radius="md"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                color: "white",
                textAlign: "center",
                minHeight: "100px",
              }}
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  padding: "8px",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconCurrencyDollar size={20} />
              </div>
              <Text size="lg" fw={700} mb={2}>
                $85
              </Text>
              <Text size="xs" opacity={0.9}>
                Application Fee
              </Text>
            </Card>
            <Card
              shadow="sm"
              padding="md"
              radius="md"
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                color: "white",
                textAlign: "center",
                minHeight: "100px",
              }}
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  padding: "8px",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconSchool size={20} />
              </div>
              <Text size="lg" fw={700} mb={2}>
                3.5+
              </Text>
              <Text size="xs" opacity={0.9}>
                US Rating
              </Text>
            </Card>
            <Card
              shadow="sm"
              padding="md"
              radius="md"
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "white",
                textAlign: "center",
                minHeight: "100px",
              }}
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  padding: "8px",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconUsers size={20} />
              </div>
              <Text size="lg" fw={700} mb={2}>
                15%
              </Text>
              <Text size="xs" opacity={0.9}>
                Acceptance Rate
              </Text>
            </Card>
          </SimpleGrid>

          {/* Program Overview Section */}
          {/* <Card
            shadow="sm"
            padding="lg"
            radius="md"
            style={{ marginBottom: "20px" }}
          >
            <Group mb="sm">
              <ThemeIcon
                size="md"
                radius="md"
                variant="gradient"
                gradient={{ from: "#10b981", to: "#059669", deg: 135 }}
              >
                <IconBook size={16} />
              </ThemeIcon>
              <Text size="lg" fw={700} c="#1a1a1a">
                Program Overview
              </Text>
            </Group>
            <Text
              size="sm"
              c="#555"
              style={{ lineHeight: 1.6, marginBottom: "12px" }}
            >
              This comprehensive Master's program offers cutting-edge curriculum
              designed to prepare students for leadership roles in their field.
              The program combines rigorous academic coursework with hands-on
              research opportunities, industry partnerships, and professional
              development.
            </Text>
            <Stack gap="xs">
              <Badge
                variant="light"
                color="teal"
                size="md"
                radius="md"
                leftSection={<IconCheck size={12} />}
                fullWidth
              >
                STEM Designated
              </Badge>
              <Badge
                variant="light"
                color="blue"
                size="md"
                radius="md"
                leftSection={<IconCheck size={12} />}
                fullWidth
              >
                Full-time & Part-time Options
              </Badge>
              <Badge
                variant="light"
                color="violet"
                size="md"
                radius="md"
                leftSection={<IconCheck size={12} />}
                fullWidth
              >
                Thesis & Non-thesis Tracks
              </Badge>
            </Stack>
          </Card> */}

          {/* Admission Requirements Section */}
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            style={{ marginBottom: "20px" }}
          >
            <Group mb="sm">
              <ThemeIcon
                size="md"
                radius="md"
                variant="gradient"
                gradient={{ from: "#3b82f6", to: "#2563eb", deg: 135 }}
              >
                <IconClipboardList size={16} />
              </ThemeIcon>
              <Text size="lg" fw={700} c="#1a1a1a">
                Admission Requirements
              </Text>
            </Group>
            <Stack gap="md">
              {/* <div>
                <Text fw={600} size="sm" mb="xs" c="#1a1a1a">
                  Academic Requirements
                </Text>
                <List
                  spacing="xs"
                  size="sm"
                  icon={
                    <ThemeIcon color="teal" size={16} radius="xl">
                      <IconCheck size={10} />
                    </ThemeIcon>
                  }
                >
                  <List.Item>
                    Bachelor's degree from accredited institution
                  </List.Item>
                  <List.Item>Minimum GPA of 3.0/4.0</List.Item>
                  <List.Item>Prerequisite courses in relevant field</List.Item>
                  <List.Item>GRE scores (optional for some programs)</List.Item>
                </List>
              </div> */}
              <div>
                <Text fw={600} size="sm" mb="xs" c="#1a1a1a">
                  {moreInfoNotes}
                </Text>
                <List
                  spacing="xs"
                  size="sm"
                  icon={
                    <ThemeIcon color="blue" size={16} radius="xl">
                      <IconFileText size={10} />
                    </ThemeIcon>
                  }
                >
                  <List.Item>Statement of Purpose (2-3 pages)</List.Item>
                  <List.Item>Three Letters of Recommendation</List.Item>
                  <List.Item>Official Transcripts</List.Item>
                  <List.Item>Resume/CV</List.Item>
                  <List.Item>
                    TOEFL/IELTS (for international students)
                  </List.Item>
                </List>
              </div>
            </Stack>
          </Card>

          {/* Important Dates Section */}
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            style={{ marginBottom: "20px" }}
          >
            <Group mb="sm">
              <ThemeIcon
                size="md"
                radius="md"
                variant="gradient"
                gradient={{ from: "#f59e0b", to: "#d97706", deg: 135 }}
              >
                <IconCalendar size={16} />
              </ThemeIcon>
              <Text size="lg" fw={700} c="#1a1a1a">
                Important Dates & Deadlines
              </Text>
            </Group>
            <SimpleGrid cols={2} spacing="sm">
              <Paper p="sm" withBorder radius="md">
                <Text size="xs" c="dimmed" mb={2}>
                  Application Opens
                </Text>
                <Text size="sm" fw={700} c="teal">
                  Sep 1, 2024
                </Text>
              </Paper>
              <Paper p="sm" withBorder radius="md">
                <Text size="xs" c="dimmed" mb={2}>
                  Priority Deadline
                </Text>
                <Text size="sm" fw={700} c="orange">
                  Dec 1, 2024
                </Text>
              </Paper>
              <Paper p="sm" withBorder radius="md">
                <Text size="xs" c="dimmed" mb={2}>
                  Final Deadline
                </Text>
                <Text size="sm" fw={700} c="red">
                  Dec 15, 2024
                </Text>
              </Paper>
              <Paper p="sm" withBorder radius="md">
                <Text size="xs" c="dimmed" mb={2}>
                  Decision Notification
                </Text>
                <Text size="sm" fw={700} c="blue">
                  Mar 15, 2025
                </Text>
              </Paper>
              <Paper p="sm" withBorder radius="md">
                <Text size="xs" c="dimmed" mb={2}>
                  Admission Decision Due
                </Text>
                <Text size="sm" fw={700} c="violet">
                  Apr 15, 2025
                </Text>
              </Paper>
              <Paper p="sm" withBorder radius="md">
                <Text size="xs" c="dimmed" mb={2}>
                  Program Starts
                </Text>
                <Text size="sm" fw={700} c="teal">
                  Aug 25, 2025
                </Text>
              </Paper>
            </SimpleGrid>
          </Card>

          {/* Financial Information Section */}
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            style={{ marginBottom: "20px" }}
          >
            <Group mb="sm">
              <ThemeIcon
                size="md"
                radius="md"
                variant="gradient"
                gradient={{ from: "#10b981", to: "#059669", deg: 135 }}
              >
                <IconCurrencyDollar size={16} />
              </ThemeIcon>
              <Text size="lg" fw={700} c="#1a1a1a">
                Financial Information
              </Text>
            </Group>
            <SimpleGrid cols={1} spacing="sm">
              <Paper p="md" withBorder radius="md">
                <Text size="xs" c="dimmed" mb={4}>
                  Tuition (per year)
                </Text>
                <Text size="lg" fw={700} c="teal" mb={2}>
                  $45,000
                </Text>
                <Text size="xs" c="dimmed">
                  In-state: $28,000/year
                </Text>
              </Paper>
              <Paper p="md" withBorder radius="md">
                <Text size="xs" c="dimmed" mb={4}>
                  Estimated Living Costs
                </Text>
                <Text size="lg" fw={700} c="blue" mb={2}>
                  $18,000
                </Text>
                <Text size="xs" c="dimmed">
                  Per academic year
                </Text>
              </Paper>
            </SimpleGrid>
            {/* <Divider my="md" />
            <Text fw={600} size="sm" mb="xs" c="#1a1a1a">
              Funding Opportunities
            </Text>
            <List
              spacing="xs"
              size="sm"
              icon={
                <ThemeIcon color="teal" size={16} radius="xl">
                  <IconCheck size={10} />
                </ThemeIcon>
              }
            >
              <List.Item>
                <Text component="span" fw={600} size="sm">
                  Research Assistantships:
                </Text>{" "}
                <Text component="span" size="sm">
                  Full tuition + $25,000 stipend
                </Text>
              </List.Item>
              <List.Item>
                <Text component="span" fw={600} size="sm">
                  Teaching Assistantships:
                </Text>{" "}
                <Text component="span" size="sm">
                  Full tuition + $22,000 stipend
                </Text>
              </List.Item>
              <List.Item>
                <Text component="span" fw={600} size="sm">
                  Merit Scholarships:
                </Text>{" "}
                <Text component="span" size="sm">
                  $5,000 - $15,000 per year
                </Text>
              </List.Item>
              <List.Item>
                <Text component="span" fw={600} size="sm">
                  Fellowship Programs:
                </Text>{" "}
                <Text component="span" size="sm">
                  Full tuition + living expenses
                </Text>
              </List.Item>
            </List> */}
          </Card>

          {/* Research Areas Section */}
          {/* <Card
            shadow="sm"
            padding="lg"
            radius="md"
            style={{ marginBottom: "20px" }}
          >
            <Group mb="sm">
              <ThemeIcon
                size="md"
                radius="md"
                variant="gradient"
                gradient={{ from: "#8b5cf6", to: "#7c3aed", deg: 135 }}
              >
                <IconBriefcase size={16} />
              </ThemeIcon>
              <Text size="lg" fw={700} c="#1a1a1a">
                Research Areas & Specializations
              </Text>
            </Group>
            <Stack gap="xs">
              <Badge
                variant="light"
                color="teal"
                size="md"
                fullWidth
                style={{ padding: "8px", height: "auto" }}
              >
                Artificial Intelligence & Machine Learning
              </Badge>
              <Badge
                variant="light"
                color="blue"
                size="md"
                fullWidth
                style={{ padding: "8px", height: "auto" }}
              >
                Data Science & Analytics
              </Badge>
              <Badge
                variant="light"
                color="violet"
                size="md"
                fullWidth
                style={{ padding: "8px", height: "auto" }}
              >
                Cybersecurity & Privacy
              </Badge>
              <Badge
                variant="light"
                color="orange"
                size="md"
                fullWidth
                style={{ padding: "8px", height: "auto" }}
              >
                Systems & Software Engineering
              </Badge>
              <Badge
                variant="light"
                color="pink"
                size="md"
                fullWidth
                style={{ padding: "8px", height: "auto" }}
              >
                Human-Computer Interaction
              </Badge>
              <Badge
                variant="light"
                color="cyan"
                size="md"
                fullWidth
                style={{ padding: "8px", height: "auto" }}
              >
                Computer Vision & Graphics
              </Badge>
            </Stack>
          </Card> */}

          {/* Campus & Location Section */}
          {/* <Card
            shadow="sm"
            padding="lg"
            radius="md"
            style={{ marginBottom: "20px" }}
          >
            <Group mb="sm">
              <ThemeIcon
                size="md"
                radius="md"
                variant="gradient"
                gradient={{ from: "#3b82f6", to: "#2563eb", deg: 135 }}
              >
                <IconMapPin size={16} />
              </ThemeIcon>
              <Text size="lg" fw={700} c="#1a1a1a">
                Campus & Location Information
              </Text>
            </Group>
            <Text size="sm" c="#555" mb="md" style={{ lineHeight: 1.6 }}>
              The university is located in a vibrant metropolitan area, offering
              students access to numerous tech companies, research institutions,
              and cultural attractions. The campus features state-of-the-art
              research facilities, modern classrooms, and collaborative
              workspaces.
            </Text>
            <SimpleGrid cols={1} spacing="sm">
              <Paper p="sm" withBorder radius="md">
                <Text size="xs" fw={600} c="#1a1a1a" mb={2}>
                  Campus Size
                </Text>
                <Text size="sm" c="dimmed">
                  250 acres
                </Text>
              </Paper>
              <Paper p="sm" withBorder radius="md">
                <Text size="xs" fw={600} c="#1a1a1a" mb={2}>
                  Total Students
                </Text>
                <Text size="sm" c="dimmed">
                  25,000+
                </Text>
              </Paper>
              <Paper p="sm" withBorder radius="md">
                <Text size="xs" fw={600} c="#1a1a1a" mb={2}>
                  Graduate Students
                </Text>
                <Text size="sm" c="dimmed">
                  8,500+
                </Text>
              </Paper>
            </SimpleGrid>
          </Card> */}

          {/* Additional Notes Section */}
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            style={{ marginBottom: "20px" }}
          >
            <Group mb="sm" justify="space-between">
              <Group>
                <ThemeIcon
                  size="md"
                  radius="md"
                  variant="gradient"
                  gradient={{ from: "#10b981", to: "#059669", deg: 135 }}
                >
                  <IconFileText size={16} />
                </ThemeIcon>
                <Text size="lg" fw={700} c="#1a1a1a">
                  Additional Notes
                </Text>
              </Group>
              {!isEditing && (
                <ActionIcon
                  variant="light"
                  color="teal"
                  size="md"
                  radius="md"
                  onClick={() => setIsEditing(true)}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              )}
            </Group>
            {isEditing ? (
              <Stack gap="sm">
                <Textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.currentTarget.value)}
                  placeholder="Add your notes here..."
                  minRows={6}
                  autosize
                  styles={{
                    input: {
                      fontFamily: "inherit",
                      fontSize: "14px",
                      lineHeight: 1.6,
                    },
                  }}
                />
                <Group justify="flex-end" gap="xs">
                  <Button
                    variant="light"
                    color="gray"
                    size="sm"
                    leftSection={<IconX size={14} />}
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="gradient"
                    gradient={{ from: "#10b981", to: "#059669", deg: 135 }}
                    size="sm"
                    leftSection={<IconDeviceFloppy size={14} />}
                    onClick={handleSave}
                    loading={isSaving}
                  >
                    Save
                  </Button>
                </Group>
              </Stack>
            ) : (
              <Paper p="md" withBorder radius="md" bg="#f8f9fa">
                <Text
                  size="sm"
                  c="#555"
                  style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}
                >
                  {moreInfoNotes || "No notes added yet."}
                </Text>
              </Paper>
            )}
          </Card>

          {/* Action Buttons */}
          <Stack gap="sm" mt="lg">
            <Button
              variant="gradient"
              gradient={{ from: "#10b981", to: "#059669", deg: 135 }}
              size="md"
              radius="md"
              fullWidth
              style={{
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              }}
            >
              Visit Program Website
            </Button>
            <Button
              variant="light"
              color="gray"
              size="md"
              radius="md"
              fullWidth
              onClick={onClose}
              leftSection={<IconX size={16} />}
            >
              Close
            </Button>
          </Stack>
        </div>
      </ScrollArea>
    </Modal>
  );
}

export default MoreInfoModalMobile;
