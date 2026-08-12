import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import {
  ApplyOption,
  GreStatus,
  Priority,
  Status,
} from "@/app/generated/prisma";
import { DEFAULT_CHECKLIST } from "@/lib/defaults";

// Accepts both raw enum values ("NON_THESIS") and display strings
// ("Non-Thesis") and normalizes them to the Prisma enum form.
function normalizeEnum(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().toUpperCase().replace(/[\s-]+/g, "_");
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
    const data = await request.json();

    const name = typeof data.name === "string" ? data.name.trim() : "";
    if (!name) {
      return NextResponse.json(
        { error: "School name is required" },
        { status: 400 }
      );
    }

    const location =
      typeof data.location === "string" ? data.location.trim() : "";
    if (!location) {
      return NextResponse.json(
        { error: "School location is required" },
        { status: 400 }
      );
    }

    const status = parseEnum(Status, data.status);
    if (!status) {
      return NextResponse.json(
        { error: "A valid status is required" },
        { status: 400 }
      );
    }

    // Optional fields fall back to the schema defaults.
    const priority = parseEnum(Priority, data.priority) ?? Priority.OTHERS;
    const gre = parseEnum(GreStatus, data.gre) ?? GreStatus.NOT_REQUIRED;
    const apply_option =
      parseEnum(ApplyOption, data.apply_option) ?? ApplyOption.UNDECIDED;
    const apply_option_note =
      typeof data.apply_option_note === "string"
        ? data.apply_option_note.trim()
        : "";

    const recommendation_count =
      typeof data.recommendation_count === "number" &&
      Number.isInteger(data.recommendation_count) &&
      data.recommendation_count >= 0
        ? data.recommendation_count
        : 3;

    const non_thesis_option = data.non_thesis_option === true;
    const professional_masters = data.professional_masters === true;
    const duration = typeof data.duration === "string" ? data.duration : "";

    const apiKey = process.env.LOGO_DEV_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const logoUrl = `https://api.logo.dev/search?q=${encodeURIComponent(name)}`;
    const logoResponse = await fetch(logoUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!logoResponse.ok) {
      return NextResponse.json(
        { error: `Logo API error: ${logoResponse.status}` },
        { status: logoResponse.status }
      );
    }

    const logoData = await logoResponse.json();
    const logo_url = logoData[0]?.logo_url;

    // New schools land at the bottom of the manually ordered list.
    const last = await prisma.schools.findFirst({
      orderBy: { sort_order: "desc" },
      select: { sort_order: true },
    });

    const school = await prisma.schools.create({
      data: {
        name,
        location,
        sort_order: (last?.sort_order ?? 0) + 1,
        status,
        priority,
        gre,
        recommendation_count,
        non_thesis_option,
        professional_masters,
        duration,
        apply_option,
        apply_option_note,
        logo: logo_url,
        // Every school starts with the same application checklist.
        checklist: {
          create: DEFAULT_CHECKLIST.map((title, index) => ({
            title,
            order: index,
          })),
        },
      },
      include: { checklist: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json(school);
  } catch (error) {
    console.error("Error adding school:", error);
    return NextResponse.json(
      { error: "Failed to add school" },
      { status: 500 }
    );
  }
}
