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
  Grid,
  List,
  ThemeIcon,
  ScrollArea,
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
  IconEdit,
  IconDeviceFloppy,
  IconX,
} from "@tabler/icons-react";
import Image from "next/image";

interface MoreInfoModalProps {
  opened: boolean;
  onClose: () => void;
  schoolId: string;
  schoolName: string;
  schoolLogo: string;
  moreInfoNotes: string;
}

function MoreInfoModal({
  opened,
  onClose,
  schoolId,
  schoolName,
  schoolLogo,
  moreInfoNotes,
}: MoreInfoModalProps) {
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
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        centered
        size="70%"
        radius="lg"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        styles={{
          content: {
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(10px)",
            maxHeight: "90vh",
          },
          header: {
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            padding: "24px",
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
          },
        }}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Image
                src={schoolLogo || "/placeholder-logo.png"}
                alt={schoolName}
                width={60}
                height={60}
                style={{ objectFit: "contain" }}
              />
            </div>
            <div>
              <Text
                style={{
                  color: "white",
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                {schoolName}
              </Text>
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: "1rem",
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
          <div style={{ padding: "32px" }}>
            {/* Quick Stats Section */}
            <Grid gutter="lg" style={{ marginBottom: "32px" }}>
              <Grid.Col span={3}>
                <Paper
                  shadow="sm"
                  p="lg"
                  radius="md"
                  style={{
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "120px",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      borderRadius: "12px",
                      padding: "12px",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconCalendar size={24} />
                  </div>
                  <Text size="xl" fw={700} mb={4}>
                    Dec 15
                  </Text>
                  <Text size="sm" opacity={0.9}>
                    Application Deadline
                  </Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={3}>
                <Paper
                  shadow="sm"
                  p="lg"
                  radius="md"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "white",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "120px",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      borderRadius: "12px",
                      padding: "12px",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconCurrencyDollar size={24} />
                  </div>
                  <Text size="xl" fw={700} mb={4}>
                    $85
                  </Text>
                  <Text size="sm" opacity={0.9}>
                    Application Fee
                  </Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={3}>
                <Paper
                  shadow="sm"
                  p="lg"
                  radius="md"
                  style={{
                    background:
                      "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                    color: "white",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "120px",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      borderRadius: "12px",
                      padding: "12px",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconSchool size={24} />
                  </div>
                  <Text size="xl" fw={700} mb={4}>
                    3.5+
                  </Text>
                  <Text size="sm" opacity={0.9}>
                    US Rating
                  </Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={3}>
                <Paper
                  shadow="sm"
                  p="lg"
                  radius="md"
                  style={{
                    background:
                      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    color: "white",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "120px",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      borderRadius: "12px",
                      padding: "12px",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconUsers size={24} />
                  </div>
                  <Text size="xl" fw={700} mb={4}>
                    15%
                  </Text>
                  <Text size="sm" opacity={0.9}>
                    Acceptance Rate
                  </Text>
                </Paper>
              </Grid.Col>
            </Grid>

            {/* Program Overview Section */}
            {/* <Paper
              shadow="sm"
              p="xl"
              radius="md"
              style={{ marginBottom: "24px" }}
            >
              <Group mb="md">
                <ThemeIcon
                  size="lg"
                  radius="md"
                  variant="gradient"
                  gradient={{ from: "#10b981", to: "#059669", deg: 135 }}
                >
                  <IconBook size={20} />
                </ThemeIcon>
                <Text size="xl" fw={700} c="#1a1a1a">
                  Program Overview
                </Text>
              </Group>
              <Text size="md" c="#555" style={{ lineHeight: 1.7 }}>
                This comprehensive Master's program offers cutting-edge
                curriculum designed to prepare students for leadership roles in
                their field. The program combines rigorous academic coursework
                with hands-on research opportunities, industry partnerships, and
                professional development.
              </Text>
              <Group mt="md" gap="xs">
                <Badge
                  variant="light"
                  color="teal"
                  size="lg"
                  radius="md"
                  leftSection={<IconCheck size={14} />}
                >
                  STEM Designated
                </Badge>
                <Badge
                  variant="light"
                  color="blue"
                  size="lg"
                  radius="md"
                  leftSection={<IconCheck size={14} />}
                >
                  Full-time & Part-time Options
                </Badge>
                <Badge
                  variant="light"
                  color="violet"
                  size="lg"
                  radius="md"
                  leftSection={<IconCheck size={14} />}
                >
                  Thesis & Non-thesis Tracks
                </Badge>
              </Group>
            </Paper> */}

            {/* Admission Requirements Section */}
            <Paper
              shadow="sm"
              p="xl"
              radius="md"
              style={{ marginBottom: "24px" }}
            >
              <Group mb="md">
                <ThemeIcon
                  size="lg"
                  radius="md"
                  variant="gradient"
                  gradient={{ from: "#3b82f6", to: "#2563eb", deg: 135 }}
                >
                  <IconClipboardList size={20} />
                </ThemeIcon>
                <Text size="xl" fw={700} c="#1a1a1a">
                  Admission Requirements
                </Text>
              </Group>
              <Grid gutter="lg">
                {/* <Grid.Col span={6}>
                  <Text fw={600} size="md" mb="sm" c="#1a1a1a">
                    Academic Requirements
                  </Text>
                  <List
                    spacing="xs"
                    size="sm"
                    icon={
                      <ThemeIcon color="teal" size={20} radius="xl">
                        <IconCheck size={12} />
                      </ThemeIcon>
                    }
                  >
                    <List.Item>
                      Bachelor's degree from accredited institution
                    </List.Item>
                    <List.Item>Minimum GPA of 3.0/4.0</List.Item>
                    <List.Item>
                      Prerequisite courses in relevant field
                    </List.Item>
                    <List.Item>
                      GRE scores (optional for some programs)
                    </List.Item>
                  </List>
                </Grid.Col> */}
                <Grid.Col span={6}>
                  <Text fw={600} size="md" mb="sm" c="#1a1a1a">
                    Application Materials
                  </Text>
                  <List
                    spacing="xs"
                    size="sm"
                    icon={
                      <ThemeIcon color="blue" size={20} radius="xl">
                        <IconFileText size={12} />
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
                </Grid.Col>
              </Grid>
            </Paper>

            {/* Important Dates Section */}
            <Paper
              shadow="sm"
              p="xl"
              radius="md"
              style={{ marginBottom: "24px" }}
            >
              <Group mb="md">
                <ThemeIcon
                  size="lg"
                  radius="md"
                  variant="gradient"
                  gradient={{ from: "#f59e0b", to: "#d97706", deg: 135 }}
                >
                  <IconCalendar size={20} />
                </ThemeIcon>
                <Text size="xl" fw={700} c="#1a1a1a">
                  Important Dates & Deadlines
                </Text>
              </Group>
              <Grid gutter="md">
                <Grid.Col span={4}>
                  <Paper p="md" withBorder>
                    <Text size="sm" c="dimmed" mb={4}>
                      Application Opens
                    </Text>
                    <Text size="lg" fw={700} c="teal">
                      September 1, 2024
                    </Text>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Paper p="md" withBorder>
                    <Text size="sm" c="dimmed" mb={4}>
                      Priority Deadline
                    </Text>
                    <Text size="lg" fw={700} c="orange">
                      December 1, 2024
                    </Text>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Paper p="md" withBorder>
                    <Text size="sm" c="dimmed" mb={4}>
                      Final Deadline
                    </Text>
                    <Text size="lg" fw={700} c="red">
                      December 15, 2024
                    </Text>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Paper p="md" withBorder>
                    <Text size="sm" c="dimmed" mb={4}>
                      Decision Notification
                    </Text>
                    <Text size="lg" fw={700} c="blue">
                      March 15, 2025
                    </Text>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Paper p="md" withBorder>
                    <Text size="sm" c="dimmed" mb={4}>
                      Admission Decision Due
                    </Text>
                    <Text size="lg" fw={700} c="violet">
                      April 15, 2025
                    </Text>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Paper p="md" withBorder>
                    <Text size="sm" c="dimmed" mb={4}>
                      Program Starts
                    </Text>
                    <Text size="lg" fw={700} c="teal">
                      August 25, 2025
                    </Text>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Paper>

            {/* Financial Information Section */}
            <Paper
              shadow="sm"
              p="xl"
              radius="md"
              style={{ marginBottom: "24px" }}
            >
              <Group mb="md">
                <ThemeIcon
                  size="lg"
                  radius="md"
                  variant="gradient"
                  gradient={{ from: "#10b981", to: "#059669", deg: 135 }}
                >
                  <IconCurrencyDollar size={20} />
                </ThemeIcon>
                <Text size="xl" fw={700} c="#1a1a1a">
                  Financial Information
                </Text>
              </Group>
              <Grid gutter="lg">
                <Grid.Col span={6}>
                  <Paper p="lg" withBorder radius="md">
                    <Text size="sm" c="dimmed" mb={8}>
                      Tuition (per year)
                    </Text>
                    <Text size="xl" fw={700} c="teal" mb="xs">
                      $45,000
                    </Text>
                    <Text size="xs" c="dimmed">
                      In-state: $28,000/year
                    </Text>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Paper p="lg" withBorder radius="md">
                    <Text size="sm" c="dimmed" mb={8}>
                      Estimated Living Costs
                    </Text>
                    <Text size="xl" fw={700} c="blue" mb="xs">
                      $18,000
                    </Text>
                    <Text size="xs" c="dimmed">
                      Per academic year
                    </Text>
                  </Paper>
                </Grid.Col>
              </Grid>
              {/* <Divider my="md" />
              <Text fw={600} size="md" mb="sm" c="#1a1a1a">
                Funding Opportunities
              </Text>
              <List
                spacing="xs"
                size="sm"
                icon={
                  <ThemeIcon color="teal" size={20} radius="xl">
                    <IconCheck size={12} />
                  </ThemeIcon>
                }
              >
                <List.Item>
                  <Text component="span" fw={600}>
                    Research Assistantships:
                  </Text>{" "}
                  Full tuition + $25,000 stipend
                </List.Item>
                <List.Item>
                  <Text component="span" fw={600}>
                    Teaching Assistantships:
                  </Text>{" "}
                  Full tuition + $22,000 stipend
                </List.Item>
                <List.Item>
                  <Text component="span" fw={600}>
                    Merit Scholarships:
                  </Text>{" "}
                  $5,000 - $15,000 per year
                </List.Item>
                <List.Item>
                  <Text component="span" fw={600}>
                    Fellowship Programs:
                  </Text>{" "}
                  Full tuition + living expenses
                </List.Item>
              </List> */}
            </Paper>

            {/* Research Areas Section */}
            {/* <Paper
              shadow="sm"
              p="xl"
              radius="md"
              style={{ marginBottom: "24px" }}
            >
              <Group mb="md">
                <ThemeIcon
                  size="lg"
                  radius="md"
                  variant="gradient"
                  gradient={{ from: "#8b5cf6", to: "#7c3aed", deg: 135 }}
                >
                  <IconBriefcase size={20} />
                </ThemeIcon>
                <Text size="xl" fw={700} c="#1a1a1a">
                  Research Areas & Specializations
                </Text>
              </Group>
              <Grid gutter="md">
                <Grid.Col span={6}>
                  <Badge
                    variant="light"
                    color="teal"
                    size="lg"
                    fullWidth
                    style={{ padding: "12px", height: "auto" }}
                  >
                    Artificial Intelligence & Machine Learning
                  </Badge>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Badge
                    variant="light"
                    color="blue"
                    size="lg"
                    fullWidth
                    style={{ padding: "12px", height: "auto" }}
                  >
                    Data Science & Analytics
                  </Badge>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Badge
                    variant="light"
                    color="violet"
                    size="lg"
                    fullWidth
                    style={{ padding: "12px", height: "auto" }}
                  >
                    Cybersecurity & Privacy
                  </Badge>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Badge
                    variant="light"
                    color="orange"
                    size="lg"
                    fullWidth
                    style={{ padding: "12px", height: "auto" }}
                  >
                    Systems & Software Engineering
                  </Badge>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Badge
                    variant="light"
                    color="pink"
                    size="lg"
                    fullWidth
                    style={{ padding: "12px", height: "auto" }}
                  >
                    Human-Computer Interaction
                  </Badge>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Badge
                    variant="light"
                    color="cyan"
                    size="lg"
                    fullWidth
                    style={{ padding: "12px", height: "auto" }}
                  >
                    Computer Vision & Graphics
                  </Badge>
                </Grid.Col>
              </Grid>
            </Paper> */}

            {/* Campus & Location Section */}
            {/* <Paper
              shadow="sm"
              p="xl"
              radius="md"
              style={{ marginBottom: "24px" }}
            >
              <Group mb="md">
                <ThemeIcon
                  size="lg"
                  radius="md"
                  variant="gradient"
                  gradient={{ from: "#3b82f6", to: "#2563eb", deg: 135 }}
                >
                  <IconMapPin size={20} />
                </ThemeIcon>
                <Text size="xl" fw={700} c="#1a1a1a">
                  Campus & Location Information
                </Text>
              </Group>
              <Text size="md" c="#555" mb="md" style={{ lineHeight: 1.7 }}>
                The university is located in a vibrant metropolitan area,
                offering students access to numerous tech companies, research
                institutions, and cultural attractions. The campus features
                state-of-the-art research facilities, modern classrooms, and
                collaborative workspaces.
              </Text>
              <Grid gutter="md">
                <Grid.Col span={4}>
                  <Paper p="md" withBorder>
                    <Text size="sm" fw={600} c="#1a1a1a" mb={4}>
                      Campus Size
                    </Text>
                    <Text size="md" c="dimmed">
                      250 acres
                    </Text>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Paper p="md" withBorder>
                    <Text size="sm" fw={600} c="#1a1a1a" mb={4}>
                      Total Students
                    </Text>
                    <Text size="md" c="dimmed">
                      25,000+
                    </Text>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Paper p="md" withBorder>
                    <Text size="sm" fw={600} c="#1a1a1a" mb={4}>
                      Graduate Students
                    </Text>
                    <Text size="md" c="dimmed">
                      8,500+
                    </Text>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Paper> */}

            {/* Additional Notes Section */}
            <Paper shadow="sm" p="xl" radius="md">
              <Group mb="md" justify="space-between">
                <Group>
                  <ThemeIcon
                    size="lg"
                    radius="md"
                    variant="gradient"
                    gradient={{ from: "#10b981", to: "#059669", deg: 135 }}
                  >
                    <IconFileText size={20} />
                  </ThemeIcon>
                  <Text size="xl" fw={700} c="#1a1a1a">
                    Additional Notes
                  </Text>
                </Group>
                {!isEditing && (
                  <ActionIcon
                    variant="light"
                    color="teal"
                    size="lg"
                    radius="md"
                    onClick={() => setIsEditing(true)}
                  >
                    <IconEdit size={18} />
                  </ActionIcon>
                )}
              </Group>
              {isEditing ? (
                <Stack gap="md">
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
                        lineHeight: 1.7,
                      },
                    }}
                  />
                  <Group justify="flex-end" gap="sm">
                    <Button
                      variant="light"
                      color="gray"
                      leftSection={<IconX size={16} />}
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="gradient"
                      gradient={{ from: "#10b981", to: "#059669", deg: 135 }}
                      leftSection={<IconDeviceFloppy size={16} />}
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
                    style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}
                  >
                    {moreInfoNotes || "No notes added yet."}
                  </Text>
                </Paper>
              )}
            </Paper>

            {/* Action Buttons */}
            <Group mt="xl" justify="flex-end" gap="md">
              <Button
                variant="light"
                color="gray"
                size="md"
                radius="md"
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                variant="gradient"
                gradient={{ from: "#10b981", to: "#059669", deg: 135 }}
                size="md"
                radius="md"
                style={{
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                }}
              >
                Visit Program Website
              </Button>
            </Group>
          </div>
        </ScrollArea>
      </Modal>
    </>
  );
}

export default MoreInfoModal;
