import { NextRequest, NextResponse } from "next/server";

const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

async function tryOverpass(url: string, body: string): Promise<Response> {
  return fetch(url, {
    method: "POST",
    body,
    headers: { "Content-Type": "text/plain" },
    signal: AbortSignal.timeout(30000),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  for (const mirror of OVERPASS_MIRRORS) {
    try {
      const res = await tryOverpass(mirror, body);

      if (!res.ok) continue;

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("json")) continue;

      const data = await res.json();
      if (!data.elements) continue;

      return NextResponse.json(data);
    } catch {
      continue;
    }
  }

  return NextResponse.json(
    { error: "Map data unavailable. All sources are busy — try again in a moment." },
    { status: 503 }
  );
}
