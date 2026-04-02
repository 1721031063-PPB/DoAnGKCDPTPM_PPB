import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { lat, lon } = await req.json();

    if (!lat || !lon) {
      return NextResponse.json({ error: "Thiếu tọa độ lat/lon" }, { status: 400 });
    }

    // Tính ngày bắt đầu (30 ngày trước) và ngày kết thúc (hôm qua)
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 1);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 30);

    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    // Open-Meteo API - Hoàn toàn miễn phí, không cần API key
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&start_date=${fmt(startDate)}&end_date=${fmt(endDate)}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.daily) {
      return NextResponse.json({ error: "Không lấy được dữ liệu lịch sử" }, { status: 500 });
    }

    const { time, temperature_2m_max, temperature_2m_min, precipitation_sum } = data.daily;

    const history = time.map((date: string, i: number) => ({
      date,
      maxTemp: Math.round(temperature_2m_max[i] ?? 0),
      minTemp: Math.round(temperature_2m_min[i] ?? 0),
      precipitation: Math.round((precipitation_sum[i] ?? 0) * 10) / 10,
    }));

    return NextResponse.json({ history });
  } catch (e) {
    console.error("History API error", e);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
