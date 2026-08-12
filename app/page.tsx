"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { Button, Center, Loader, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useIsMobile } from "@/lib/use-mobile";
import AddSchoolDesktopModal from "./modals/AddSchoolDesktopModal";
import {
  checklistProgress,
  DeadlineChip,
  ProgressMeter,
} from "./components/school-list";
import {
  cardStyle,
  formatDate,
  LETTER_STATUS_LABELS,
  letterStatusColor,
  notifyError,
  pageTitleStyle,
  primaryButtonStyle,
  sectionLabelStyle,
  ui,
  type LetterStatusValue,
  type RecommenderWithLetters,
  type SchoolFull,
} from "./theme";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * What `/api/get-school` hands back: every scalar column plus the two thin
 * relation slices (`done` flags and letter statuses) the rollups need.
 */
interface DashboardSchool
  extends Pick<
    SchoolFull,
    | "id"
    | "name"
    | "status"
    | "removed"
    | "deadline"
    | "application_fee"
    | "decision_date"
  > {
  checklist: Array<{ done: boolean }>;
  letters: Array<{ status: LetterStatusValue }>;
}

/* -------------------------------------------------------------------------- */
/* Small building blocks                                                      */
/* -------------------------------------------------------------------------- */

const cardPadStyle: CSSProperties = { ...cardStyle, padding: 20 };

const schoolLinkStyle: CSSProperties = {
  color: ui.ink,
  fontSize: 14,
  fontWeight: 500,
  textDecoration: "none",
};

const footerLinkStyle: CSSProperties = {
  color: ui.body,
  fontSize: 12,
  fontWeight: 500,
  textDecoration: "none",
};

const emptyTextStyle: CSSProperties = {
  color: ui.muted,
  fontSize: 13,
  padding: "12px 0",
};

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "9px 0",
  borderTop: `1px solid ${ui.border}`,
};

function SchoolLink({ id, name }: { id: string; name: string }) {
  return (
    <Link href={`/schools/${id}`} style={schoolLinkStyle}>
      {name}
    </Link>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 15, fontWeight: 600, color: ui.ink }}>
      {children}
    </div>
  );
}

function LetterBadge({ status }: { status: LetterStatusValue }) {
  const color = letterStatusColor(status);
  return (
    <span
      style={{
        flexShrink: 0,
        fontSize: 11,
        fontWeight: 600,
        color,
        border: `1px solid ${color}`,
        borderRadius: 4,
        padding: "1px 6px",
        whiteSpace: "nowrap",
      }}
    >
      {LETTER_STATUS_LABELS[status].toLowerCase()}
    </span>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div style={{ ...cardStyle, padding: "14px 18px", flex: "1 1 140px" }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: color ?? ui.ink }}>
        {value}
      </div>
      <div style={{ ...sectionLabelStyle, marginTop: 2 }}>{label}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function DashboardPage() {
  const isMobile = useIsMobile();
  const [schools, setSchools] = useState<DashboardSchool[]>([]);
  const [recommenders, setRecommenders] = useState<RecommenderWithLetters[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);

  const load = useCallback(async () => {
    setLoading(true);

    // Both panels are independent: a failing recommenders call should still
    // leave the school-driven cards populated.
    const [schoolResult, recommenderResult] = await Promise.allSettled([
      fetch("/api/get-school").then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch schools: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Unexpected response shape from /api/get-school");
        }
        return data as DashboardSchool[];
      }),
      fetch("/api/recommenders").then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch recommenders: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Unexpected response shape from /api/recommenders");
        }
        return data as RecommenderWithLetters[];
      }),
    ]);

    if (schoolResult.status === "fulfilled") {
      setSchools(schoolResult.value);
    } else {
      console.error("Error fetching schools:", schoolResult.reason);
      setSchools([]);
      notifyError("Could not load schools", "The school list is unavailable.");
    }

    if (recommenderResult.status === "fulfilled") {
      setRecommenders(recommenderResult.value);
    } else {
      console.error("Error fetching recommenders:", recommenderResult.reason);
      setRecommenders([]);
      notifyError(
        "Could not load recommenders",
        "Letter progress is unavailable."
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const active = schools.filter((school) => !school.removed);
  const countBy = (status: string) =>
    active.filter((school) => school.status === status).length;

  /* Up next — only schools still being worked on can have an urgent deadline. */
  const upcoming = active
    .filter((school) => school.deadline && school.status === "APPLYING")
    .sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? ""))
    .slice(0, 6);

  /* Letters — flattened across every recommender. */
  const letters = recommenders.flatMap((recommender) =>
    recommender.letters.map((letter) => ({
      ...letter,
      recommenderName: recommender.name,
    }))
  );
  const submittedLetters = letters.filter(
    (letter) => letter.status === "SUBMITTED"
  ).length;
  const pendingLetters = letters
    .filter((letter) => letter.status !== "SUBMITTED")
    .slice(0, 5);

  /* Application progress — least-finished first, so the work surfaces. */
  const inProgress = active
    .filter(
      (school) => school.status === "APPLYING" || school.status === "APPLIED"
    )
    .map((school) => ({ school, ...checklistProgress(school) }))
    .sort((a, b) => a.ratio - b.ratio);
  const progressRows = inProgress.slice(0, 10);
  const hiddenProgress = inProgress.length - progressRows.length;

  /* Fees — "still to pay" approximates as anything not yet submitted. */
  const feeTotal = active.reduce(
    (sum, school) => sum + (school.application_fee ?? 0),
    0
  );
  const feeOutstanding = active
    .filter((school) => school.status === "APPLYING")
    .reduce((sum, school) => sum + (school.application_fee ?? 0), 0);

  /* Decisions. */
  const accepted = countBy("ACCEPTED");
  const rejected = countBy("REJECTED");
  const latestDecision = active
    .filter(
      (school) =>
        school.decision_date &&
        (school.status === "ACCEPTED" || school.status === "REJECTED")
    )
    .sort((a, b) => (b.decision_date ?? "").localeCompare(a.decision_date ?? ""))[0];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const twoColumnStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: 16,
  };

  return (
    <>
      <AddSchoolDesktopModal
        opened={addOpened}
        onClose={closeAdd}
        onSchoolAdded={load}
        isMobile={isMobile}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Header ------------------------------------------------------- */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <Title order={1} style={pageTitleStyle}>
              Dashboard
            </Title>
            <div style={{ color: ui.muted, fontSize: 13, marginTop: 4 }}>
              {today}
            </div>
          </div>
          <Button size="sm" radius={6} style={primaryButtonStyle} onClick={openAdd}>
            Add School
          </Button>
        </div>

        {loading ? (
          <Center style={{ minHeight: "40vh" }}>
            <Loader color={ui.emphasis} size="sm" />
          </Center>
        ) : (
          <>
            {/* Stats ---------------------------------------------------- */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <StatCard label="Schools" value={active.length} />
              <StatCard label="Applying" value={countBy("APPLYING")} />
              <StatCard label="Applied" value={countBy("APPLIED")} />
              <StatCard label="Accepted" value={accepted} color={ui.success} />
              <StatCard label="Rejected" value={rejected} color={ui.danger} />
            </div>

            {/* Up next + letters ---------------------------------------- */}
            <div style={twoColumnStyle}>
              <div style={cardPadStyle}>
                <CardTitle>Up next</CardTitle>
                <div style={{ marginTop: 8 }}>
                  {upcoming.length === 0 ? (
                    <div style={emptyTextStyle}>No upcoming deadlines</div>
                  ) : (
                    upcoming.map((school, index) => (
                      <div
                        key={school.id}
                        style={{
                          ...rowStyle,
                          borderTop:
                            index === 0 ? "none" : `1px solid ${ui.border}`,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <SchoolLink id={school.id} name={school.name} />
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: ui.body,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDate(school.deadline)}
                        </div>
                        <DeadlineChip
                          deadline={school.deadline}
                          status={school.status}
                        />
                      </div>
                    ))
                  )}
                </div>
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: `1px solid ${ui.border}`,
                  }}
                >
                  <Link href="/deadlines" style={footerLinkStyle}>
                    All deadlines →
                  </Link>
                </div>
              </div>

              <div style={cardPadStyle}>
                <CardTitle>Letters of recommendation</CardTitle>
                {letters.length === 0 ? (
                  <>
                    <div style={emptyTextStyle}>No letter requests yet</div>
                    <Link href="/recommenders" style={footerLinkStyle}>
                      Add a recommender →
                    </Link>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 13,
                        color: ui.body,
                        fontWeight: 500,
                      }}
                    >
                      <span style={{ color: ui.ink, fontWeight: 600 }}>
                        {submittedLetters}
                      </span>{" "}
                      of {letters.length} submitted
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <ProgressMeter
                        ratio={submittedLetters / letters.length}
                        width="100%"
                      />
                    </div>
                    <div style={{ marginTop: 10 }}>
                      {pendingLetters.length === 0 ? (
                        <div style={emptyTextStyle}>
                          Every letter is submitted
                        </div>
                      ) : (
                        pendingLetters.map((letter) => (
                          <div key={letter.id} style={rowStyle}>
                            <div
                              style={{
                                flex: 1,
                                minWidth: 0,
                                fontSize: 13,
                                color: ui.body,
                              }}
                            >
                              <span style={{ color: ui.ink, fontWeight: 500 }}>
                                {letter.recommenderName}
                              </span>
                              <span style={{ color: ui.muted }}> → </span>
                              <SchoolLink
                                id={letter.school.id}
                                name={letter.school.name}
                              />
                            </div>
                            <LetterBadge status={letter.status} />
                          </div>
                        ))
                      )}
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 10,
                        borderTop: `1px solid ${ui.border}`,
                      }}
                    >
                      <Link href="/recommenders" style={footerLinkStyle}>
                        All recommenders →
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Application progress ------------------------------------- */}
            <div style={cardPadStyle}>
              <CardTitle>Application progress</CardTitle>
              <div style={{ marginTop: 8 }}>
                {progressRows.length === 0 ? (
                  <div style={emptyTextStyle}>No applications in progress</div>
                ) : (
                  progressRows.map(({ school, done, total, ratio, complete }, index) => {
                    return (
                      <div
                        key={school.id}
                        style={{
                          ...rowStyle,
                          alignItems: "center",
                          borderTop:
                            index === 0 ? "none" : `1px solid ${ui.border}`,
                        }}
                      >
                        <div
                          style={{
                            flex: isMobile ? "1 1 auto" : "0 0 280px",
                            minWidth: 0,
                          }}
                        >
                          <SchoolLink id={school.id} name={school.name} />
                        </div>
                        {!isMobile && (
                          <div style={{ flex: 1 }}>
                            <ProgressMeter
                              ratio={ratio}
                              complete={complete}
                              width="100%"
                            />
                          </div>
                        )}
                        <div
                          style={{
                            flexShrink: 0,
                            fontSize: 12,
                            fontWeight: 600,
                            color: complete ? ui.success : ui.body,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {done}/{total}
                          {complete && " ✓"}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {hiddenProgress > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: `1px solid ${ui.border}`,
                  }}
                >
                  <Link href="/schools" style={footerLinkStyle}>
                    +{hiddenProgress} more →
                  </Link>
                </div>
              )}
            </div>

            {/* Fees + decisions ----------------------------------------- */}
            <div style={twoColumnStyle}>
              <div style={cardPadStyle}>
                <div style={sectionLabelStyle}>Fees</div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: ui.ink,
                    marginTop: 6,
                  }}
                >
                  ${feeTotal.toLocaleString("en-US")}
                </div>
                <div style={{ fontSize: 13, color: ui.body, marginTop: 4 }}>
                  total · ${feeOutstanding.toLocaleString("en-US")} still to pay
                </div>
              </div>

              <div style={cardPadStyle}>
                <div style={sectionLabelStyle}>Decisions</div>
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    marginTop: 6,
                    alignItems: "baseline",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: ui.success,
                      }}
                    >
                      {accepted}
                    </span>
                    <span style={{ fontSize: 13, color: ui.body }}>
                      {" "}
                      accepted
                    </span>
                  </div>
                  <div>
                    <span
                      style={{ fontSize: 22, fontWeight: 700, color: ui.danger }}
                    >
                      {rejected}
                    </span>
                    <span style={{ fontSize: 13, color: ui.body }}>
                      {" "}
                      rejected
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: ui.body, marginTop: 8 }}>
                  {latestDecision ? (
                    <>
                      Latest:{" "}
                      <SchoolLink
                        id={latestDecision.id}
                        name={latestDecision.name}
                      />{" "}
                      <span style={{ color: ui.muted }}>
                        {formatDate(latestDecision.decision_date)}
                      </span>
                    </>
                  ) : (
                    <span style={{ color: ui.muted }}>No decisions yet</span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
