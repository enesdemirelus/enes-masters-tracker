"use client";

import { useEffect, useState } from "react";
import { Anchor, Group, NumberInput, Stack, Text, TextInput } from "@mantine/core";
import { inputStyles, ui, type SchoolFull } from "@/app/theme";
import { DetailCard, DetailRow, type PatchSchool } from "./DetailCard";

/** Bare domains typed without a scheme still have to open as absolute links. */
function toHref(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function UrlField({
  label,
  value,
  placeholder,
  onCommit,
}: {
  label: string;
  value: string;
  placeholder: string;
  onCommit: (next: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  // Only a real change is worth a request — blurring an untouched field is not.
  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed === value) {
      setDraft(trimmed);
      return;
    }
    onCommit(trimmed);
  };

  return (
    <div>
      <Group justify="space-between" align="center" mb={4} gap="xs">
        <Text size="sm" c={ui.body}>
          {label}
        </Text>
        {value ? (
          <Anchor
            href={toHref(value)}
            target="_blank"
            rel="noreferrer"
            size="xs"
            c={ui.body}
            style={{ textDecoration: "none" }}
          >
            open ↗
          </Anchor>
        ) : null}
      </Group>
      <TextInput
        size="sm"
        radius="md"
        placeholder={placeholder}
        value={draft}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        styles={inputStyles}
      />
    </div>
  );
}

export default function ApplicationCard({
  school,
  onPatch,
}: {
  school: SchoolFull;
  onPatch: PatchSchool;
}) {
  const storedFee = school.application_fee;
  const [fee, setFee] = useState<number | string>(storedFee ?? "");

  useEffect(() => {
    setFee(storedFee ?? "");
  }, [storedFee]);

  const commitFee = () => {
    const raw = typeof fee === "string" ? fee.trim() : fee;
    if (raw === "" || raw === null) {
      if (storedFee === null) {
        return;
      }
      onPatch({ application_fee: null }, "Application fee cleared.");
      return;
    }

    const parsed = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed === storedFee) {
      return;
    }
    onPatch({ application_fee: parsed }, "Application fee updated.");
  };

  return (
    <DetailCard title="Application">
      <Stack gap={12}>
        <DetailRow
          label="Application fee"
          value={
            <NumberInput
              size="sm"
              radius="md"
              prefix="$"
              min={0}
              hideControls
              allowNegative={false}
              allowDecimal={false}
              placeholder="—"
              value={fee}
              onChange={setFee}
              onBlur={commitFee}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                }
              }}
              styles={inputStyles}
              style={{ width: 110 }}
            />
          }
        />
        <UrlField
          label="Program website"
          placeholder="https://…"
          value={school.program_url ?? ""}
          onCommit={(next) =>
            onPatch(
              { program_url: next },
              next ? "Program website updated." : "Program website cleared."
            )
          }
        />
        <UrlField
          label="Application portal"
          placeholder="https://…"
          value={school.portal_url ?? ""}
          onCommit={(next) =>
            onPatch(
              { portal_url: next },
              next ? "Application portal updated." : "Application portal cleared."
            )
          }
        />
      </Stack>
    </DetailCard>
  );
}
