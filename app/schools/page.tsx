"use client";
import {
  Table,
  Badge,
  ActionIcon,
  Title,
  Paper,
  Button,
  TextInput,
} from "@mantine/core";
import { IconEdit, IconInfoCircle, IconSearch } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import MobileSchoolsView from "./MobileSchoolsView";
import { useIsMobile } from "../../lib/use-mobile";
import AddSchoolDesktopModal from "../modals/AddSchoolDesktopModal";
import EditSchoolDesktopModal from "../modals/EditSchoolDesktopModal";
import { useDisclosure } from "@mantine/hooks";
import MoreInfoModal from "../modals/MoreInfoModal";

export default function Page() {
  const [elements, setElements] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const [opened, { open, close }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [moreInfoOpened, { open: openMoreInfo, close: closeMoreInfo }] =
    useDisclosure(false);

  const fetchSchools = async () => {
    const response = await fetch("/masters/api/get-school");
    const data = await response.json();
    setElements(data);
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const filteredElements = elements.filter((element) => {
    const query = searchQuery.toLowerCase();
    return (
      element.name.toLowerCase().includes(query) ||
      element.location.toLowerCase().includes(query) ||
      element.tiers.toLowerCase().includes(query) ||
      element.category.toLowerCase().includes(query) ||
      element.status.toLowerCase().includes(query) ||
      element.ms_status.toLowerCase().includes(query)
    );
  });

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

  const getMsStatusColor = (msStatus: string) => {
    switch (msStatus) {
      case "RESEARCH_BASED":
        return "green";
      case "PROFESSIONAL_TRACK":
        return "purple";
      case "NO_MASTERS":
        return "gray";
      default:
        return "green";
    }
  };
  if (isMobile) {
    return (
      <MobileSchoolsView
        elements={filteredElements}
        getTierColor={getTierColor}
        getCategoryColor={getCategoryColor}
        getStatusColor={getStatusColor}
        getMsStatusColor={getMsStatusColor}
        onSchoolAdded={fetchSchools}
      />
    );
  }

  const rows = filteredElements.map((element) => (
    <Table.Tr
      key={element.name}
      style={{
        transition: "background-color 0.2s ease",
      }}
    >
      <Table.Td
        style={{ whiteSpace: "nowrap", textAlign: "center", width: "1px" }}
      >
        <ActionIcon
          variant="light"
          color="teal"
          size="md"
          radius="md"
          onClick={() => {
            setSelectedSchool(element);
            openEdit();
          }}
        >
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
      <Table.Td>
        <Badge
          variant="light"
          color={getMsStatusColor(element.ms_status)}
          size="lg"
          radius="md"
        >
          {element.ms_status}
        </Badge>
      </Table.Td>
      <Table.Td
        style={{ whiteSpace: "nowrap", textAlign: "center", width: "1px" }}
      >
        <ActionIcon
          variant="light"
          color="orange"
          size="md"
          radius="md"
          onClick={() => {
            setSelectedSchool(element);
            openMoreInfo();
          }}
        >
          <IconInfoCircle size={18} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <MoreInfoModal
        opened={moreInfoOpened}
        onClose={closeMoreInfo}
        schoolName={selectedSchool?.name}
        schoolLogo={selectedSchool?.logo}
      />
      <AddSchoolDesktopModal
        opened={opened}
        onClose={close}
        onSchoolAdded={fetchSchools}
      />
      {selectedSchool && (
        <EditSchoolDesktopModal
          opened={editOpened}
          onClose={closeEdit}
          onSchoolEdited={fetchSchools}
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
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "2.5rem",
                fontWeight: 800,
              }}
            >
              Enes' Master's Application Tracker
            </Title>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <TextInput
                placeholder="Search schools..."
                size="md"
                radius="md"
                leftSection={<IconSearch size={18} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "300px",
                }}
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
                variant="gradient"
                gradient={{ from: "#10b981", to: "#059669", deg: 135 }}
                size="md"
                radius="md"
                style={{
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                }}
                onClick={open}
              >
                Add School
              </Button>
            </div>
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
                <Table.Th>MS Program Type</Table.Th>
                <Table.Th style={{ whiteSpace: "nowrap", textAlign: "center" }}>
                  More Info
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Paper>
      </div>
    </>
  );
}
