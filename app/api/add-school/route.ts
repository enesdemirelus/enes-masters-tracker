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
import { DEFAULT_CHECKLIST } from "@/lib/defaults";

// Accepts both raw enum values ("RESEARCH_BASED") and display strings
// ("Research Based") and normalizes them to the Prisma enum form.
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

    const tiers = parseEnum(Tiers, data.tiers);
    if (!tiers) {
      return NextResponse.json(
        { error: "A valid tier is required" },
        { status: 400 }
      );
    }

    const category = parseEnum(Category, data.category);
    if (!category) {
      return NextResponse.json(
        { error: "A valid category is required" },
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

    const ms_status = parseEnum(MsStatus, data.ms_status);
    if (!ms_status) {
      return NextResponse.json(
        { error: "A valid MS status is required" },
        { status: 400 }
      );
    }

    // Optional fields fall back to the schema defaults.
    const priority = parseEnum(Priority, data.priority) ?? Priority.LOW;
    const gre = parseEnum(GreStatus, data.gre) ?? GreStatus.NOT_REQUIRED;

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

    const school = await prisma.schools.create({
      data: {
        name,
        location,
        tiers,
        category,
        status,
        priority,
        ms_status,
        gre,
        recommendation_count,
        non_thesis_option,
        professional_masters,
        duration,
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
