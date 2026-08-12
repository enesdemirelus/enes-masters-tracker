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

    // An empty string is valid here — that is how notes get cleared.
    if (typeof more_info_notes !== "string") {
      return NextResponse.json(
        { error: "More info notes must be a string" },
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
