import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import {
  Category,
  GreStatus,
  MsStatus,
  Priority,
  Status,
  Tiers,
} from "@/app/generated/prisma";

// Accepts both raw enum values ("NOT_SURE") and display strings ("Not Sure")
// and normalizes them to the Prisma enum form.
function normalizeEnum(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().toUpperCase().replace(/\s+/g, "_");
}

function parseEnum<T extends Record<string, string>>(
  enumObject: T,
  value: unknown
): T[keyof T] | null {
  const normalized = normalizeEnum(value);
  const allowed = Object.values(enumObject) as string[];
  return allowed.includes(normalized) ? (normalized as T[keyof T]) : null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 }
      );
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const location =
      typeof body.location === "string" ? body.location.trim() : "";

    if (!name || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const tiers = parseEnum(Tiers, body.tiers);
    const category = parseEnum(Category, body.category);
    const status = parseEnum(Status, body.status);
    const ms_status = parseEnum(MsStatus, body.ms_status);

    if (!tiers || !category || !status || !ms_status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const priority = parseEnum(Priority, body.priority) ?? Priority.LOW;

    const schoolData: {
      name: string;
      location: string;
      priority: Priority;
      tiers: Tiers;
      category: Category;
      status: Status;
      ms_status: MsStatus;
      removed: boolean;
      gre?: GreStatus;
      recommendation_count?: number;
      non_thesis_option?: boolean;
      professional_masters?: boolean;
      duration?: string;
    } = {
      name,
      location,
      priority,
      tiers,
      category,
      status,
      ms_status,
      // Keep the removed flag in sync with the status the user picked.
      removed: status === Status.REMOVED,
    };

    // The new fields are only written when the client actually sends them, so
    // clients that don't know about them yet can't clobber stored values.
    const gre = parseEnum(GreStatus, body.gre);
    if (gre) {
      schoolData.gre = gre;
    }

    if (
      typeof body.recommendation_count === "number" &&
      Number.isInteger(body.recommendation_count) &&
      body.recommendation_count >= 0
    ) {
      schoolData.recommendation_count = body.recommendation_count;
    }

    if (typeof body.non_thesis_option === "boolean") {
      schoolData.non_thesis_option = body.non_thesis_option;
    }

    if (typeof body.professional_masters === "boolean") {
      schoolData.professional_masters = body.professional_masters;
    }

    if (typeof body.duration === "string") {
      schoolData.duration = body.duration;
    }

    const school = await prisma.schools.update({
      where: { id },
      data: schoolData,
    });

    return NextResponse.json(school);
  } catch (error) {
    console.error("Error updating school:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update school" },
      { status: 500 }
    );
  }
}
