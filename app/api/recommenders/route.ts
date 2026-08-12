import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

function isMissingRecord(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2025"
  );
}

export async function GET() {
  try {
    const recommenders = await prisma.recommender.findMany({
      orderBy: { name: "asc" },
      include: {
        letters: {
          include: {
            school: { select: { id: true, name: true, status: true } },
          },
        },
      },
    });

    return NextResponse.json(recommenders);
  } catch (error) {
    console.error("Error fetching recommenders:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommenders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, notes } = await request.json();

    const trimmedName = typeof name === "string" ? name.trim() : "";
    if (!trimmedName) {
      return NextResponse.json({ error: "A name is required" }, { status: 400 });
    }

    const recommender = await prisma.recommender.create({
      data: {
        name: trimmedName,
        email: typeof email === "string" ? email.trim() : "",
        notes: typeof notes === "string" ? notes : "",
      },
    });

    return NextResponse.json(recommender, { status: 201 });
  } catch (error) {
    console.error("Error creating recommender:", error);
    return NextResponse.json(
      { error: "Failed to create recommender" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (typeof id !== "string" || !id) {
      return NextResponse.json(
        { error: "Recommender ID is required" },
        { status: 400 }
      );
    }

    const data: { name?: string; email?: string; notes?: string } = {};

    if ("name" in body) {
      const trimmed = typeof body.name === "string" ? body.name.trim() : "";
      if (!trimmed) {
        return NextResponse.json(
          { error: "A name is required" },
          { status: 400 }
        );
      }
      data.name = trimmed;
    }

    // Empty strings are valid for these two — that is how they get cleared.
    if ("email" in body) {
      if (typeof body.email !== "string") {
        return NextResponse.json(
          { error: "email must be a string" },
          { status: 400 }
        );
      }
      data.email = body.email.trim();
    }

    if ("notes" in body) {
      if (typeof body.notes !== "string") {
        return NextResponse.json(
          { error: "notes must be a string" },
          { status: 400 }
        );
      }
      data.notes = body.notes;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const recommender = await prisma.recommender.update({ where: { id }, data });
    return NextResponse.json(recommender);
  } catch (error) {
    console.error("Error updating recommender:", error);

    if (isMissingRecord(error)) {
      return NextResponse.json(
        { error: "Recommender not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update recommender" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (typeof id !== "string" || !id) {
      return NextResponse.json(
        { error: "Recommender ID is required" },
        { status: 400 }
      );
    }

    // Letter requests cascade away with the recommender.
    const recommender = await prisma.recommender.delete({ where: { id } });
    return NextResponse.json(recommender);
  } catch (error) {
    console.error("Error deleting recommender:", error);

    if (isMissingRecord(error)) {
      return NextResponse.json(
        { error: "Recommender not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete recommender" },
      { status: 500 }
    );
  }
}
