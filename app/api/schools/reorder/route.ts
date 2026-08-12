import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

/**
 * Persists a drag-to-reorder of the schools list.
 *
 * The client sends the ids in their new visual order and every row is
 * rewritten to its 1-based index, so `sort_order` stays a dense sequence with
 * no gaps to reconcile later. The writes run in one transaction: a partial
 * renumber would leave duplicate positions and an order that reads as
 * arbitrary, which is worse than the drag simply failing and being retried.
 */
export async function POST(request: Request) {
  try {
    const { orderedIds } = await request.json();

    if (
      !Array.isArray(orderedIds) ||
      orderedIds.length === 0 ||
      !orderedIds.every((id) => typeof id === "string" && id)
    ) {
      return NextResponse.json(
        { error: "orderedIds must be a non-empty array of school IDs" },
        { status: 400 }
      );
    }

    if (new Set(orderedIds).size !== orderedIds.length) {
      return NextResponse.json(
        { error: "orderedIds must not contain duplicates" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      orderedIds.map((id: string, index: number) =>
        prisma.schools.update({
          where: { id },
          data: { sort_order: index + 1 },
        })
      )
    );

    return NextResponse.json({ updated: orderedIds.length });
  } catch (error) {
    console.error("Error reordering schools:", error);

    // An id that is no longer in the table (deleted in another tab) aborts the
    // whole transaction, so nothing was renumbered — the client should refetch.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to reorder schools" },
      { status: 500 }
    );
  }
}
