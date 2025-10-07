"use client";
import { Table, Badge, ActionIcon, Title, Paper, Button } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import MobileSchoolsView from "./MobileSchoolsView";
import { useIsMobile } from "../../lib/use-mobile";
import AddSchoolDesktopModal from "../modals/AddSchoolDesktopModal";
import { useDisclosure } from "@mantine/hooks";

export default function Page() {
  const [elements, setElements] = useState<any[]>([]);
  const isMobile = useIsMobile();
  const [opened, { open, close }] = useDisclosure(false);

  const fetchSchools = async () => {
    const response = await fetch("/api/get-school");
    const data = await response.json();
    setElements(data);
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "SAFETY":
        return "green";
      case "TARGET":
        return "orange";
      case "REACH":
        return "red";
      case "NOT_SURE":
        return "black";
      default:
        return "blue";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "AROUND_ILLINOIS":
        return "teal";
      case "IN_CHICAGO":
        return "indigo";
      case "IN_ILLINOIS":
        return "cyan";
      case "IN_CALIFORNIA":
        return "violet";
      case "FAR":
        return "grape";
      default:
        return "blue";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPLYING":
        return "blue";
      case "APPLIED":
        return "green";
      case "REJECTED":
        return "red";
      case "ACCEPTED":
        return "green";
      default:
        return "blue";
    }
  };

  if (isMobile) {
    return (
      <MobileSchoolsView
        elements={elements}
        getTierColor={getTierColor}
        getCategoryColor={getCategoryColor}
        getStatusColor={getStatusColor}
        onSchoolAdded={fetchSchools}
      />
    );
  }

  const rows = elements.map((element) => (
    <Table.Tr
      key={element.name}
      style={{
        transition: "background-color 0.2s ease",
      }}
    >
      <Table.Td
        style={{ whiteSpace: "nowrap", textAlign: "center", width: "1px" }}
      >
        <ActionIcon variant="light" color="indigo" size="md" radius="md">
          <IconEdit size={18} />
        </ActionIcon>
      </Table.Td>
      <Table.Td>
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
      </Table.Td>
      <Table.Td style={{ fontWeight: 600, color: "#1a1a1a" }}>
        {element.name}
      </Table.Td>
      <Table.Td style={{ color: "#555" }}>{element.location}</Table.Td>
      <Table.Td>
        {" "}
        <Badge
          variant="light"
          color={getCategoryColor(element.category)}
          size="lg"
          radius="md"
        >
          {element.category.replace(/_/g, " ")}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge
          variant="light"
          color={getStatusColor(element.status)}
          size="lg"
          radius="md"
        >
          {element.status}
        </Badge>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <AddSchoolDesktopModal
        opened={opened}
        onClose={close}
        onSchoolAdded={fetchSchools}
      />
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          minHeight: "100vh",
          padding: "40px 20px",
        }}
      >
        <Paper
          shadow="xl"
          radius="lg"
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "40px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <Title
              order={1}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "2.5rem",
                fontWeight: 800,
              }}
            >
              Enes' Master's Application Tracker
            </Title>
            <Button
              variant="gradient"
              gradient={{ from: "#667eea", to: "#764ba2", deg: 135 }}
              size="md"
              radius="md"
              style={{
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              }}
              onClick={open}
            >
              Add School
            </Button>
          </div>
          <Table
            highlightOnHover
            withTableBorder
            withColumnBorders
            style={{
              backgroundColor: "white",
            }}
          >
            <Table.Thead style={{ backgroundColor: "#f8f9fa" }}>
              <Table.Tr>
                <Table.Th style={{ whiteSpace: "nowrap", textAlign: "center" }}>
                  Edit School
                </Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>School Name</Table.Th>
                <Table.Th>Location</Table.Th>
                <Table.Th>Location Category</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Paper>
      </div>
    </>
  );
}
