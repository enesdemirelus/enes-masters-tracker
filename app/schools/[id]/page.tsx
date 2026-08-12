"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button, Center, Loader, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useIsMobile } from "@/lib/use-mobile";
import EditSchoolDesktopModal from "@/app/modals/EditSchoolDesktopModal";
import ApplicationCard from "@/app/components/detail/ApplicationCard";
import ChecklistCard from "@/app/components/detail/ChecklistCard";
import KeyDatesCard from "@/app/components/detail/KeyDatesCard";
import LettersCard from "@/app/components/detail/LettersCard";
import NotesCard from "@/app/components/detail/NotesCard";
import ProgramDetailsCard from "@/app/components/detail/ProgramDetailsCard";
import SchoolDetailHeader from "@/app/components/detail/SchoolDetailHeader";
import {
  errorMessage,
  notifyError,
  notifySuccess,
  secondaryButtonStyle,
  ui,
  type SchoolFull,
} from "@/app/theme";

type LoadResult = "ok" | "missing" | "error";

export default function SchoolDetailPage() {
  const params = useParams<{ id: string }>();
  const schoolId = typeof params?.id === "string" ? params.id : "";
  const router = useRouter();
  const isMobile = useIsMobile();

  const [school, setSchool] = useState<SchoolFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  const load = useCallback(async (): Promise<LoadResult> => {
    try {
      const response = await fetch(`/api/schools/${schoolId}`);

      if (response.status === 404) {
        setMissing(true);
        setSchool(null);
        return "missing";
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch school: ${response.status}`);
      }

      setSchool((await response.json()) as SchoolFull);
      setMissing(false);
      return "ok";
    } catch (error) {
      notifyError(
        "Could not load school",
        errorMessage(error, "Something went wrong while loading this school.")
      );
      return "error";
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId) {
      setLoading(false);
      setMissing(true);
      return;
    }
    load();
  }, [schoolId, load]);

  /** Partial field update; the response carries the school plus its relations. */
  const patchSchool = useCallback(
    async (body: Record<string, unknown>, message: string) => {
      try {
        const response = await fetch(`/api/schools/${schoolId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            typeof data?.error === "string" ? data.error : "Failed to save"
          );
        }

        setSchool(data as SchoolFull);
        notifySuccess("Saved", message);
        return true;
      } catch (error) {
        notifyError(
          "Could not save",
          errorMessage(error, "Something went wrong while saving this change.")
        );
        return false;
      }
    },
    [schoolId]
  );

  /**
   * Server truth on demand. The checklist and letter cards call this after a
   * failed optimistic write instead of rolling back to their own snapshot,
   * which would clobber any sibling mutation that landed meanwhile.
   */
  const refreshSchool = useCallback(async () => {
    await load();
  }, [load]);

  // The Edit modal can also remove or delete the school, so a refresh that
  // 404s means the record is gone and this page has nothing left to show.
  const handleSchoolEdited = useCallback(async () => {
    const result = await load();
    if (result === "missing") {
      router.replace("/schools");
    }
  }, [load, router]);

  if (loading || isMobile === undefined) {
    return (
      <Center style={{ minHeight: 320 }}>
        <Loader color={ui.emphasis} size="sm" />
      </Center>
    );
  }

  if (missing || !school) {
    return (
      <Stack gap={12} align="flex-start" style={{ paddingTop: 40 }}>
        <Text fw={700} c={ui.ink} style={{ fontSize: 24 }}>
          School not found
        </Text>
        <Text size="sm" c={ui.body}>
          This school is not in your tracker — it may have been deleted.
        </Text>
        <Button
          component={Link}
          href="/schools"
          size="sm"
          variant="default"
          style={secondaryButtonStyle}
        >
          Back to schools
        </Button>
      </Stack>
    );
  }

  const leftColumn = (
    <Stack gap={16}>
      <ProgramDetailsCard school={school} />
      <KeyDatesCard school={school} onPatch={patchSchool} />
      <ApplicationCard school={school} onPatch={patchSchool} />
    </Stack>
  );

  const rightColumn = (
    <Stack gap={16}>
      <ChecklistCard
        school={school}
        onSchoolChange={setSchool}
        onRefresh={refreshSchool}
      />
      <LettersCard
        school={school}
        onSchoolChange={setSchool}
        onRefresh={refreshSchool}
      />
      <NotesCard school={school} onPatch={patchSchool} />
    </Stack>
  );

  return (
    <>
      <Stack gap={20}>
        <SchoolDetailHeader school={school} onEdit={openEdit} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "minmax(0, 1fr)"
              : "minmax(0, 55fr) minmax(0, 45fr)",
            gap: 16,
            alignItems: "start",
          }}
        >
          {leftColumn}
          {rightColumn}
        </div>
      </Stack>

      <EditSchoolDesktopModal
        opened={editOpened}
        onClose={closeEdit}
        onSchoolEdited={handleSchoolEdited}
        isMobile={isMobile}
        schoolIdProp={school.id}
        schoolNameProp={school.name}
        schoolLocationProp={school.location}
        schoolPriorityProp={school.priority}
        schoolStatusProp={school.status}
        schoolApplyOptionProp={school.apply_option}
        schoolApplyOptionNoteProp={school.apply_option_note}
        schoolRemovedProp={school.removed}
        schoolGreProp={school.gre}
        schoolRecommendationCountProp={school.recommendation_count}
        schoolNonThesisOptionProp={school.non_thesis_option}
        schoolProfessionalMastersProp={school.professional_masters}
        schoolDurationProp={school.duration}
      />
    </>
  );
}
