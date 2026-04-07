import { NextRequest, NextResponse } from "next/server";

const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

async function tryMirror(url: string, body: string): Promise<any> {
  const res = await fetch(url, {
    method: "POST",
    body,
    headers: { "Content-Type": "text/plain" },
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("json")) throw new Error("Non-JSON response");

  const data = await res.json();
  if (!data.elements) throw new Error("No elements in response");

  return data;
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  try {
    // Race all mirrors — first successful one wins
    const data = await Promise.any(
      OVERPASS_MIRRORS.map(url => tryMirror(url, body))
    );
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Map data unavailable. Sources are busy — try again in a moment." },
      { status: 503 }
    );
  }
}
