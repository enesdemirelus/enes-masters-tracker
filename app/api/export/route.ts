import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

/** Full JSON dump of the tracker — the "Export data" button in the sidebar. */
export async function GET() {
  try {
    const [schools, recommenders] = await Promise.all([
      prisma.schools.findMany({
        orderBy: { name: "asc" },
        include: {
          checklist: { orderBy: { order: "asc" } },
          letters: { include: { recommender: true } },
        },
      }),
      prisma.recommender.findMany({ orderBy: { name: "asc" } }),
    ]);

    return NextResponse.json(
      {
        exported_at: new Date().toISOString(),
        schools,
        recommenders,
      },
      {
        headers: {
          "Content-Disposition":
            'attachment; filename="masters-tracker-export.json"',
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
