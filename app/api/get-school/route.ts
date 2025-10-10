import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET() {
  try {
    const schools = await prisma.schools.findMany({
      orderBy: {
        tiers: "asc",
      },
    });
    return NextResponse.json(schools);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch schools" },
      { status: 500 }
    );
  }
}