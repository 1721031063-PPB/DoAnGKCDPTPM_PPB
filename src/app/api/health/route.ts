import { NextRequest, NextResponse } from "next/server";

interface HealthData {
  aqi: number;
  aqiCategory: string;
  pollenTree: number;
  pollenGrass: number;
}

export async function POST(req: NextRequest) {
  try {
    const { lat, lon } = (await req.json()) as { lat: number; lon: number };

    const waqiToken = process.env.NEXT_PUBLIC_WAQI_TOKEN;
    const ambeeKey = process.env.NEXT_PUBLIC_AMBEE_API_KEY;

    if (!waqiToken) {
      return NextResponse.json(
        { error: "Thiếu WAQI token trên server." },
        { status: 500 }
      );
    }

    const aqiRes = await fetch(
      `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${waqiToken}`
    );
    const aqiJson = await aqiRes.json();
    const aqi = aqiJson?.data?.aqi ?? 50;

    let aqiCategory = "Tốt";
    if (aqi > 300) aqiCategory = "Nguy hại";
    else if (aqi > 200) aqiCategory = "Rất xấu";
    else if (aqi > 150) aqiCategory = "Xấu";
    else if (aqi > 100) aqiCategory = "Trung bình";

    let pollenTree = 1;
    let pollenGrass = 1;

    if (ambeeKey) {
      const pollenRes = await fetch(
        `https://api.ambeedata.com/latest/pollen/by-lat-lng?lat=${lat}&lng=${lon}`,
        {
          headers: {
            "x-api-key": ambeeKey
          }
        }
      );

      if (pollenRes.ok) {
        const pollenJson = await pollenRes.json();
        const pollenData = pollenJson?.data?.[0] ?? {};
        pollenTree = pollenData?.pollen_level_tree ?? pollenTree;
        pollenGrass = pollenData?.pollen_level_grass ?? pollenGrass;
      }
    }

    const health: HealthData = {
      aqi,
      aqiCategory,
      pollenTree,
      pollenGrass
    };

    return NextResponse.json(health);
  } catch (e: any) {
    console.error("Health API error", e);
    return NextResponse.json(
      { error: "Lỗi server khi lấy dữ liệu sức khoẻ." },
      { status: 500 }
    );
  }
}

