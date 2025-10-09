"use client";
import {
  Badge,
  ActionIcon,
  Title,
  Paper,
  Card,
  Group,
  Stack,
  Text,
  Button,
} from "@mantine/core";
import { IconEdit, IconInfoCircle } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import AddSchoolDesktopModal from "../modals/AddSchoolDesktopModal";
import EditSchoolDesktopModal from "../modals/EditSchoolDesktopModal";

interface School {
  id: string;
  name: string;
  location: string;
  tiers: string;
  category: string;
  status: string;
  ms_status: string;
}

interface MobileSchoolsViewProps {
  elements: School[];
  getTierColor: (tier: string) => string;
  getCategoryColor: (category: string) => string;
  getStatusColor: (status: string) => string;
  getMsStatusColor: (ms_status: string) => string;
  onSchoolAdded?: () => void;
}

export default function MobileSchoolsView({
  elements,
  getTierColor,
  getCategoryColor,
  getStatusColor,
  getMsStatusColor,
  onSchoolAdded,
}: MobileSchoolsViewProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  return (
    <>
      <AddSchoolDesktopModal
        opened={opened}
        onClose={close}
        onSchoolAdded={onSchoolAdded}
        isMobile={true}
      />
      {selectedSchool && (
        <EditSchoolDesktopModal
          opened={editOpened}
          onClose={closeEdit}
          onSchoolEdited={onSchoolAdded}
          isMobile={true}
          schoolIdProp={selectedSchool.id}
          schoolNameProp={selectedSchool.name}
          schoolLocationProp={selectedSchool.location}
          schoolTierProp={selectedSchool.tiers}
          schoolCategoryProp={selectedSchool.category}
          schoolStatusProp={selectedSchool.status}
          schoolMsStatusProp={selectedSchool.ms_status}
        />
      )}
      <div
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          minHeight: "100vh",
          padding: "20px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          shadow="xl"
          radius="lg"
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "20px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              gap: "12px",
            }}
          >
            <Title
              order={1}
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "1.5rem",
                fontWeight: 800,
                flex: 1,
              }}
            >
              Enes' Master's Tracker
            </Title>
            <Button
              variant="gradient"
              gradient={{ from: "#10b981", to: "#059669", deg: 135 }}
              size="sm"
              radius="md"
              style={{
                fontWeight: 600,
                fontSize: "0.8rem",
                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                whiteSpace: "nowrap",
              }}
              onClick={open}
            >
              Add School
            </Button>
          </div>

          <Stack gap="md">
            {elements.map((element) => (
              <Card
                key={element.name}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{
                  background: "white",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start">
                    <div style={{ flex: 1 }}>
                      <Text
                        fw={700}
                        size="lg"
                        style={{ color: "#1a1a1a", marginBottom: "4px" }}
                      >
                        {element.name}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {element.location}
                      </Text>
                    </div>
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        color="teal"
                        size="lg"
                        radius="md"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSchool(element);
                          openEdit();
                        }}
                      >
                        <IconEdit size={20} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="orange"
                        size="lg"
                        radius="md"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(element);
                        }}
                      >
                        <IconInfoCircle size={20} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Group gap="xs">
                    <Badge
                      variant="gradient"
                      gradient={{
                        from: getTierColor(element.tiers),
                        to: getTierColor(element.tiers),
                        deg: 90,
                      }}
                      size="xs"
                      radius="md"
                    >
                      {element.tiers}
                    </Badge>
                    <Badge
                      variant="light"
                      color={getCategoryColor(element.category)}
                      size="xs"
                      radius="md"
                    >
                      {element.category.replace(/_/g, " ")}
                    </Badge>
                    <Badge
                      variant="light"
                      color={getStatusColor(element.status)}
                      size="xs"
                      radius="md"
                    >
                      {element.status}
                    </Badge>
                    <Badge
                      variant="light"
                      color={getMsStatusColor(element.ms_status)}
                      size="xs"
                      radius="md"
                    >
                      {element.ms_status}
                    </Badge>
                  </Group>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Paper>
      </div>
    </>
  );
}
