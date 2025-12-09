import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";



export async function POST(request: Request) {
    const data = await request.json()

    const school_name = data.name;
    if (!school_name) {
        return NextResponse.json({ error: "School name is required" }, { status: 400 });
    }

    const apiKey = process.env.LOGO_DEV_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const logoUrl = `https://api.logo.dev/search?q=${encodeURIComponent(school_name)}`;
    const logoResponse = await fetch(logoUrl, {
        headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!logoResponse.ok) {
        return NextResponse.json({ error: `Logo API error: ${logoResponse.status}` }, { status: logoResponse.status });
    }

    const logoData = await logoResponse.json();
    const logo_url = logoData[0]?.logo_url;
    const school = await prisma.schools.create({data: {
        ...data,
        logo: logo_url
    }})
    return NextResponse.json(school)

}