import { NextRequest, NextResponse } from "next/server";

type WeatherCondition =
  | "clear"
  | "rain"
  | "clouds"
  | "thunderstorm"
  | "snow"
  | "drizzle"
  | "mist";

interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  condition: WeatherCondition;
  uvi: number;
}

interface DailyForecast {
  date: string;
  minTemp: number;
  maxTemp: number;
  description: string;
  rainProb: number;
}

// Bảng dịch mô tả thời tiết OpenWeatherMap → Tiếng Việt
const weatherDescriptionMap: Record<string, string> = {
  // Clear
  "clear sky": "Trời quang đãng",
  // Clouds
  "few clouds": "Ít mây",
  "scattered clouds": "Mây rải rác",
  "broken clouds": "Nhiều mây",
  "overcast clouds": "Trời u ám",
  // Drizzle
  "light intensity drizzle": "Mưa phùn nhẹ",
  "drizzle": "Mưa phùn",
  "heavy intensity drizzle": "Mưa phùn nặng hạt",
  "light intensity drizzle rain": "Mưa phùn nhẹ",
  "drizzle rain": "Mưa phùn kèm mưa",
  "heavy intensity drizzle rain": "Mưa phùn nặng",
  "shower rain and drizzle": "Mưa rào và mưa phùn",
  "heavy shower rain and drizzle": "Mưa rào nặng và mưa phùn",
  "shower drizzle": "Mưa phùn rào",
  // Rain
  "light rain": "Mưa nhẹ",
  "moderate rain": "Mưa vừa",
  "heavy intensity rain": "Mưa to",
  "very heavy rain": "Mưa rất to",
  "extreme rain": "Mưa cực lớn",
  "freezing rain": "Mưa đóng băng",
  "light intensity shower rain": "Mưa rào nhẹ",
  "shower rain": "Mưa rào",
  "heavy intensity shower rain": "Mưa rào to",
  "ragged shower rain": "Mưa rào thất thường",
  // Thunderstorm
  "thunderstorm with light rain": "Dông kèm mưa nhẹ",
  "thunderstorm with rain": "Dông kèm mưa",
  "thunderstorm with heavy rain": "Dông kèm mưa to",
  "light thunderstorm": "Dông nhẹ",
  "thunderstorm": "Dông",
  "heavy thunderstorm": "Dông mạnh",
  "ragged thunderstorm": "Dông thất thường",
  "thunderstorm with light drizzle": "Dông kèm mưa phùn nhẹ",
  "thunderstorm with drizzle": "Dông kèm mưa phùn",
  "thunderstorm with heavy drizzle": "Dông kèm mưa phùn nặng",
  // Snow
  "light snow": "Tuyết nhẹ",
  "snow": "Tuyết",
  "heavy snow": "Tuyết dày",
  "sleet": "Mưa tuyết",
  "light shower sleet": "Mưa tuyết nhẹ",
  "shower sleet": "Mưa tuyết rào",
  "light rain and snow": "Mưa và tuyết nhẹ",
  "rain and snow": "Mưa và tuyết",
  "light shower snow": "Tuyết rào nhẹ",
  "shower snow": "Tuyết rào",
  "heavy shower snow": "Tuyết rào dày",
  // Atmosphere
  "mist": "Sương mù nhẹ",
  "smoke": "Khói mù",
  "haze": "Mù khô",
  "sand/dust whirls": "Lốc cát/bụi",
  "fog": "Sương mù",
  "sand": "Bão cát",
  "dust": "Bụi mù",
  "volcanic ash": "Tro núi lửa",
  "squalls": "Gió giật mạnh",
  "tornado": "Lốc xoáy",
};

function translateDescription(desc: string): string {
  return weatherDescriptionMap[desc.toLowerCase()] ?? desc;
}

export async function POST(req: NextRequest) {
  try {
    const { city } = (await req.json()) as { city: string };
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Thiếu OPENWEATHER_API_KEY trong server." },
        { status: 500 }
      );
    }

    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        city
      )}&limit=1&appid=${apiKey}`
    );
    const geo = await geoRes.json();
    if (!geo?.length) {
      return NextResponse.json(
        { error: "Không tìm thấy vị trí" },
        { status: 400 }
      );
    }

    const { lat, lon } = geo[0];

    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    const currentData = await currentRes.json();
    if (!currentRes.ok) {
      const msg =
        (currentData && (currentData.message || currentData.error)) ||
        "Không lấy được dữ liệu thời tiết hiện tại (kiểm tra API key / quota).";
      return NextResponse.json({ error: msg }, { status: currentRes.status });
    }

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    const forecastData = await forecastRes.json();
    if (!forecastRes.ok) {
      const msg =
        (forecastData && (forecastData.message || forecastData.error)) ||
        "Không lấy được dữ liệu dự báo 5 ngày.";
      return NextResponse.json(
        { error: msg },
        { status: forecastRes.status }
      );
    }

    const nowWeather = currentData.weather?.[0] ?? {};
    const clouds = currentData.clouds?.all ?? 50;
    const hour = new Date((currentData.dt ?? Date.now()) * 1000).getHours();
    let approxUvi = 1;
    if (hour >= 9 && hour <= 15) {
      approxUvi = 9 - clouds / 15;
    } else if (hour >= 7 && hour <= 17) {
      approxUvi = 6 - clouds / 20;
    }
    if (approxUvi < 0) approxUvi = 0.5;

    const current: CurrentWeather = {
      temperature: currentData.main?.temp ?? 0,
      humidity: currentData.main?.humidity ?? 0,
      windSpeed: currentData.wind?.speed ?? 0,
      description: translateDescription(nowWeather.description ?? ""),
      condition: (nowWeather.main?.toLowerCase() as WeatherCondition) ?? "clear",
      uvi: approxUvi
    };

    const hourly = (forecastData.list ?? []).slice(0, 8).map((item: any) => {
      const date = new Date((item.dt ?? Date.now()) * 1000);
      return {
        time: date.getHours() + ":00",
        temp: Math.round(item.main?.temp ?? 0),
        rainProb: Math.round((item.pop ?? 0) * 100),
      };
    });

    const buckets: Record<
      string,
      { temps: number[]; pops: number[]; descriptions: string[] }
    > = {};

    for (const item of forecastData.list ?? []) {
      const dt = item.dt ? new Date(item.dt * 1000) : new Date();
      const dayKey = dt.toISOString().slice(0, 10);
      if (!buckets[dayKey]) {
        buckets[dayKey] = { temps: [], pops: [], descriptions: [] };
      }
      buckets[dayKey].temps.push(item.main?.temp ?? 0);
      buckets[dayKey].pops.push(item.pop ?? 0);
      if (item.weather?.[0]?.description) {
        buckets[dayKey].descriptions.push(item.weather[0].description);
      }
    }

    const dayKeys = Object.keys(buckets).sort().slice(0, 5);
    const forecast: DailyForecast[] = dayKeys.map((key) => {
      const bucket = buckets[key];
      const minTemp = Math.min(...bucket.temps);
      const maxTemp = Math.max(...bucket.temps);
      const rainProb =
        bucket.pops.length > 0
          ? bucket.pops.reduce((a, b) => a + b, 0) / bucket.pops.length
          : 0;

      let description = "";
      if (bucket.descriptions.length) {
        const freq: Record<string, number> = {};
        for (const d of bucket.descriptions) {
          freq[d] = (freq[d] || 0) + 1;
        }
        description = translateDescription(Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]);
      }

      return {
        date: new Date(key).toLocaleDateString("vi-VN", { weekday: "short" }),
        minTemp,
        maxTemp,
        description,
        rainProb
      };
    });

    return NextResponse.json({ current, forecast, hourly, lat, lon });
  } catch (e: any) {
    console.error("Weather API error", e);
    return NextResponse.json(
      { error: "Lỗi server khi lấy dữ liệu thời tiết." },
      { status: 500 }
    );
  }
}

