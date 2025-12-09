import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { Status } from "@/app/generated/prisma";

export async function POST(request: Request) {
  try {
    const { id } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 }


      );
    }

    const school = await prisma.schools.update({
      data: {
        removed: false,
        removal_reason: null,
        status: Status.APPLYING,
      },
      where: { id }
    });

    return NextResponse.json(school);
  } catch (error) {
    console.error("Error adding school back:", error);
    return NextResponse.json(
      { error: "Failed to add school back" },
      { status: 500 }
    );
  }
}
