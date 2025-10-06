import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";


export async function POST(request: Request) {
    const data = await request.json()
    const school = await prisma.schools.create({data})
    return NextResponse.json(school)

}