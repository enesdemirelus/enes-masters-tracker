import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function POST(request: Request) {
  try {
    const { id, more_info_notes } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 }
      );
    }

    if (!more_info_notes) {
      return NextResponse.json(
        { error: "More info notes are required" },
        { status: 400 }
      );
    }


    const school = await prisma.schools.update({
      where: { id },
      data: { more_info_notes },
    });

    return NextResponse.json(school);
  } catch (error) {
    console.error("Error adding more info:", error);
    return NextResponse.json(
      { error: "Failed to add more info" },
      { status: 500 }
    );
  }
}
