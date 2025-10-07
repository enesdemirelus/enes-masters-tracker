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
} from "@mantine/core";
import { IconClick } from "@tabler/icons-react";

interface School {
  name: string;
  location: string;
  tiers: string;
  category: string;
}

interface MobileSchoolsViewProps {
  elements: School[];
  getTierColor: (tier: string) => string;
  getCategoryColor: (category: string) => string;
}

export default function MobileSchoolsView({
  elements,
  getTierColor,
  getCategoryColor,
}: MobileSchoolsViewProps) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
        padding: "20px 16px",
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
        <Title
          order={1}
          style={{
            marginBottom: "20px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "1.75rem",
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          Enes' Master's Tracker
        </Title>

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
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
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
                  <ActionIcon
                    variant="light"
                    color="indigo"
                    size="lg"
                    radius="md"
                  >
                    <IconClick size={20} />
                  </ActionIcon>
                </Group>

                <Group gap="xs">
                  <Badge
                    variant="gradient"
                    gradient={{
                      from: getTierColor(element.tiers),
                      to: getTierColor(element.tiers),
                      deg: 90,
                    }}
                    size="lg"
                    radius="md"
                  >
                    {element.tiers}
                  </Badge>
                  <Badge
                    variant="light"
                    color={getCategoryColor(element.category)}
                    size="lg"
                    radius="md"
                  >
                    {element.category.replace(/_/g, " ")}
                  </Badge>
                </Group>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Paper>
    </div>
  );
}
