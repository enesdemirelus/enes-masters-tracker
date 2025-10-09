import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function POST(request: Request) {
  try {
    const { id, name, location, tiers, category, status, ms_status } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 }
      );
    }

    if (!name || !location || !tiers || !category || !status || !ms_status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const schoolData = {
      name,
      location,
      tiers,
      category,
      status,
      ms_status,
    };

    const school = await prisma.schools.upsert({
      where: { id },
      update: schoolData,
      create: {
        id,
        ...schoolData,
      },
    });

    return NextResponse.json(school);
  } catch (error) {
    console.error("Error updating school:", error);
    return NextResponse.json(
      { error: "Failed to update school" },
      { status: 500 }
    );
  }
}
