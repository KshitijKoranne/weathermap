import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body,
      headers: { "Content-Type": "text/plain" },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Overpass fetch failed" }, { status: 500 });
  }
}
