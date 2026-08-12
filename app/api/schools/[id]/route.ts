import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { GreStatus } from "@/app/generated/prisma";
import { DEFAULT_CHECKLIST } from "@/lib/defaults";

const schoolInclude = {
  checklist: { orderBy: { order: "asc" } },
  letters: { include: { recommender: true } },
} as const;

function isMissingRecord(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2025"
  );
}

// Accepts both raw enum values ("NOT_REQUIRED") and display strings
// ("Not Required") and normalizes them to the Prisma enum form.
function parseEnum<T extends Record<string, string>>(
  enumObject: T,
  value: unknown
): T[keyof T] | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
  const allowed = Object.values(enumObject) as string[];
  return allowed.includes(normalized) ? (normalized as T[keyof T]) : null;
}

/**
 * Dates arrive either as a full ISO string or as the `YYYY-MM-DD` value of a
 * native date input; the latter is pinned to UTC midnight so the stored instant
 * still reads back as the same calendar day everywhere.
 */
function parseDate(value: unknown): Date | null | undefined {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? `${trimmed}T00:00:00.000Z`
    : trimmed;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const school = await prisma.schools.findUnique({
      where: { id },
      include: schoolInclude,
    });

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    // Schools created before checklists existed (and any that somehow lost
    // their items) get the default list on first open.
    if (school.checklist.length === 0) {
      await prisma.checklistItem.createMany({
        data: DEFAULT_CHECKLIST.map((title, index) => ({
          school_id: id,
          title,
          order: index,
        })),
      });

      const seeded = await prisma.schools.findUnique({
        where: { id },
        include: schoolInclude,
      });
      return NextResponse.json(seeded);
    }

    return NextResponse.json(school);
  } catch (error) {
    console.error("Error fetching school:", error);
    return NextResponse.json(
      { error: "Failed to fetch school" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};

    for (const field of [
      "deadline",
      "applied_date",
      "decision_date",
    ] as const) {
      if (field in body) {
        const parsed = parseDate(body[field]);
        if (parsed === undefined) {
          return NextResponse.json(
            { error: `Invalid ${field}` },
            { status: 400 }
          );
        }
        data[field] = parsed;
      }
    }

    if ("application_fee" in body) {
      const value = body.application_fee;
      if (value === null || value === "") {
        data.application_fee = null;
      } else {
        const parsed = typeof value === "number" ? value : Number(value);
        if (!Number.isInteger(parsed) || parsed < 0) {
          return NextResponse.json(
            { error: "Application fee must be a non-negative whole number" },
            { status: 400 }
          );
        }
        data.application_fee = parsed;
      }
    }

    for (const field of [
      "program_url",
      "portal_url",
      "more_info_notes",
      "duration",
    ] as const) {
      if (field in body) {
        const value = body[field];
        if (value === null) {
          data[field] = "";
          continue;
        }
        if (typeof value !== "string") {
          return NextResponse.json(
            { error: `${field} must be a string` },
            { status: 400 }
          );
        }
        data[field] = value.trim();
      }
    }

    if ("gre" in body) {
      const gre = parseEnum(GreStatus, body.gre);
      if (!gre) {
        return NextResponse.json({ error: "Invalid GRE value" }, { status: 400 });
      }
      data.gre = gre;
    }

    if ("recommendation_count" in body) {
      const value = body.recommendation_count;
      const parsed = typeof value === "number" ? value : Number(value);
      if (!Number.isInteger(parsed) || parsed < 0) {
        return NextResponse.json(
          { error: "Recommendation count must be a non-negative whole number" },
          { status: 400 }
        );
      }
      data.recommendation_count = parsed;
    }

    for (const field of ["non_thesis_option", "professional_masters"] as const) {
      if (field in body) {
        if (typeof body[field] !== "boolean") {
          return NextResponse.json(
            { error: `${field} must be a boolean` },
            { status: 400 }
          );
        }
        data[field] = body[field];
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No updatable fields provided" },
        { status: 400 }
      );
    }

    const school = await prisma.schools.update({
      where: { id },
      data,
      include: schoolInclude,
    });

    return NextResponse.json(school);
  } catch (error) {
    console.error("Error updating school:", error);

    if (isMissingRecord(error)) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update school" },
      { status: 500 }
    );
  }
}
