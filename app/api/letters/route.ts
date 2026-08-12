import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { LetterStatus } from "@/app/generated/prisma";

function prismaCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    return (error as { code?: string }).code;
  }
  return undefined;
}

export async function POST(request: Request) {
  try {
    const { school_id, recommender_id, status } = await request.json();

    if (typeof school_id !== "string" || !school_id) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 }
      );
    }

    if (typeof recommender_id !== "string" || !recommender_id) {
      return NextResponse.json(
        { error: "Recommender ID is required" },
        { status: 400 }
      );
    }

    let initialStatus: LetterStatus = LetterStatus.NOT_ASKED;
    if (status !== undefined) {
      if (!Object.values(LetterStatus).includes(status)) {
        return NextResponse.json(
          { error: "Invalid letter status" },
          { status: 400 }
        );
      }
      initialStatus = status;
    }

    const letter = await prisma.letterRequest.create({
      data: { school_id, recommender_id, status: initialStatus },
      include: { recommender: true },
    });

    return NextResponse.json(letter, { status: 201 });
  } catch (error) {
    const code = prismaCode(error);

    // The @@unique([school_id, recommender_id]) pair — this recommender is
    // already attached to this school.
    if (code === "P2002") {
      return NextResponse.json(
        { error: "This recommender is already requested for this school" },
        { status: 409 }
      );
    }

    // Foreign key violation: the school or the recommender is gone.
    if (code === "P2003") {
      return NextResponse.json(
        { error: "School or recommender not found" },
        { status: 404 }
      );
    }

    console.error("Error creating letter request:", error);
    return NextResponse.json(
      { error: "Failed to create letter request" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    if (typeof id !== "string" || !id) {
      return NextResponse.json(
        { error: "Letter request ID is required" },
        { status: 400 }
      );
    }

    if (!Object.values(LetterStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid letter status" },
        { status: 400 }
      );
    }

    const letter = await prisma.letterRequest.update({
      where: { id },
      data: { status },
      include: { recommender: true },
    });

    return NextResponse.json(letter);
  } catch (error) {
    if (prismaCode(error) === "P2025") {
      return NextResponse.json(
        { error: "Letter request not found" },
        { status: 404 }
      );
    }

    console.error("Error updating letter request:", error);
    return NextResponse.json(
      { error: "Failed to update letter request" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (typeof id !== "string" || !id) {
      return NextResponse.json(
        { error: "Letter request ID is required" },
        { status: 400 }
      );
    }

    const letter = await prisma.letterRequest.delete({ where: { id } });
    return NextResponse.json(letter);
  } catch (error) {
    if (prismaCode(error) === "P2025") {
      return NextResponse.json(
        { error: "Letter request not found" },
        { status: 404 }
      );
    }

    console.error("Error deleting letter request:", error);
    return NextResponse.json(
      { error: "Failed to delete letter request" },
      { status: 500 }
    );
  }
}
