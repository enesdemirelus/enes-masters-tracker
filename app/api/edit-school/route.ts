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

    if (
      !name ||
      !location ||
      !tiers ||
      !category ||
      !status ||
      !ms_status
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let new_tiers = tiers;
    let new_category = category;
    let new_status = status;
    let new_ms_status = ms_status;



    if (category === "Around Illinois") {
      new_category = "AROUND_ILLINOIS";
    } else if (category === "In Chicago") {
      new_category = "IN_CHICAGO";
    } else if (category === "In Illinois") {
      new_category = "IN_ILLINOIS";
    } else if (category === "In California") {
      new_category = "IN_CALIFORNIA";
    } else if (category === "Far") {
      new_category = "FAR";
    }

    if (tiers === "Safety") {
      new_tiers = "SAFETY";
    } else if (tiers === "Target") {
      new_tiers = "TARGET";
    } else if (tiers === "Reach") {
      new_tiers = "REACH";
    }

    if (status === "Applying") {
      new_status = "APPLYING";
    } else if (status === "Applied") {
      new_status = "APPLIED";
    } else if (status === "Rejected") {
      new_status = "REJECTED";
    } else if (status === "Accepted") {
      new_status = "ACCEPTED";
    }

    if (ms_status === "Research Based") {
      new_ms_status = "RESEARCH_BASED";
    } else if (ms_status === "Professional Track") {
      new_ms_status = "PROFESSIONAL_TRACK";
    } else if (ms_status === "No Masters") {
      new_ms_status = "NO_MASTERS";
    }


    const schoolData = {
      name,
      location,
      tiers: new_tiers,
      category: new_category,
      status: new_status,
      ms_status: new_ms_status,
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
