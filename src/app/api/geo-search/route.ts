import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

    if (!q || !apiKey) {
      return NextResponse.json({ results: [] });
    }

    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        q
      )}&limit=5&appid=${apiKey}`
    );
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { results: [], error: data?.message || "Geo search failed" },
        { status: res.status }
      );
    }

    const results = (data || []).map((item: any) => ({
      name: item.name,
      country: item.country,
      state: item.state,
      lat: item.lat,
      lon: item.lon
    }));

    return NextResponse.json({ results });
  } catch (e: any) {
    console.error("Geo search error", e);
    return NextResponse.json(
      { results: [], error: "Lỗi server khi tìm địa điểm." },
      { status: 500 }
    );
  }
}

