import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET() {
  try {
    const schools = await prisma.schools.findMany({
      orderBy: {
        tiers: "asc",
      },
      // Additive: every existing field still ships, plus two thin relation
      // slices so list views (dashboard progress bars, letter rollups) can be
      // rendered from this one request instead of N per-school fetches.
      include: {
        checklist: { select: { done: true } },
        letters: { select: { status: true } },
      },
    });
    return NextResponse.json(schools);
  } catch (error) {
    console.error("Error fetching schools:", error);
    return NextResponse.json(
      { error: "Failed to fetch schools" },
      { status: 500 }
    );
  }
}
