"use client";
import { Button, Modal, Text, TextInput, Paper, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { IconLock } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [opened, { open, close }] = useDisclosure(false);
  const [password, setPassword] = useState("");
  const router = useRouter();
  const handleLogin = () => {
    router.push("/schools");
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
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
            That is PRIVATE!
          </span>
        }
        centered
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
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Text style={{ color: "#555", fontSize: "1rem" }}>
            Please enter the password to access the tracker.
          </Text>
          <TextInput
            placeholder="Password"
            type="password"
            size="md"
            radius="md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftSection={<IconLock size={18} />}
            styles={{
              input: {
                borderColor: "#e0e0e0",
                "&:focus": {
                  borderColor: "#10b981",
                },
              },
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLogin();
              }
            }}
          />
          <Button
            onClick={handleLogin}
            variant="gradient"
            gradient={{ from: "#10b981", to: "#059669", deg: 135 }}
            size="md"
            radius="md"
            style={{
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
            }}
          >
            Login
          </Button>
        </div>
      </Modal>
      <div
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <Paper
          shadow="xl"
          radius="lg"
          style={{
            maxWidth: "600px",
            width: "100%",
            padding: "60px 40px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            textAlign: "center",
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
              marginBottom: "16px",
            }}
          >
            Welcome to the Enes Masters Tracker
          </Title>
          <Text
            style={{
              color: "#555",
              fontSize: "1.125rem",
              marginBottom: "40px",
              lineHeight: "1.6",
            }}
          >
            Please select the action you want to perform
          </Text>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              maxWidth: "400px",
              margin: "0 auto",
            }}
          >
            <Button
              onClick={open}
              variant="gradient"
              gradient={{ from: "#10b981", to: "#059669", deg: 135 }}
              size="lg"
              radius="md"
              leftSection={<IconLock size={20} />}
              style={{
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              }}
            >
              Open Enes's Master's Tracker
            </Button>
            <Button
              variant="outline"
              size="lg"
              radius="md"
              style={{
                fontWeight: 600,
                borderColor: "#10b981",
                color: "#10b981",
              }}
              styles={{
                root: {
                  "&:hover": {
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                  },
                },
              }}
            >
              Open Demo Master's Tracker
            </Button>
          </div>
        </Paper>
      </div>
    </>
  );
}
