import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET() {
  try {
    const schools = await prisma.schools.findMany({
      // The hand-set order wins; priority (MAIN before OTHERS, enum declaration
      // order) then name only break ties among rows that share a sort_order —
      // i.e. rows added before the feature existed, which all sit at 0.
      orderBy: [{ sort_order: "asc" }, { priority: "asc" }, { name: "asc" }],
      // Every scalar column ships (including apply_option / apply_option_note),
      // plus two thin relation slices so list views (dashboard progress bars,
      // letter rollups) can be rendered from this one request instead of N
      // per-school fetches.
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
