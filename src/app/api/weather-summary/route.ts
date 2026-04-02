import { NextRequest, NextResponse } from "next/server";
import { AISummaryPayload } from "@/app/lib/aiSummary";

// Hàm tạo tóm tắt thủ công khi OpenAI không khả dụng
function generateFallbackSummary(body: AISummaryPayload): string {
  const { city, current, forecast, health } = body;
  const { temperature, description, humidity, windSpeed, uvi } = current;

  const intro = `Chào bạn! Hôm nay ở ${city}`;
  const weather = `trời ${description}, nhiệt độ ${Math.round(temperature)}°C, độ ẩm ${humidity}%.`;

  let tips = "";
  if (uvi >= 8) tips += " Chỉ số UV rất cao — nhớ bôi kem chống nắng và đội mũ nhé!";
  else if (uvi >= 5) tips += " UV ở mức vừa phải, nên bảo vệ da khi ra ngoài.";

  if (windSpeed > 30) tips += " Gió khá mạnh, chú ý khi di chuyển bằng xe máy!";

  const todayRain = forecast[0]?.rainProb ?? 0;
  if (todayRain > 0.6) tips += " Khả năng mưa cao, hãy mang dù theo khi ra đường.";
  else if (todayRain > 0.3) tips += " Có thể có mưa nhẹ vào chiều tối, nên chuẩn bị áo mưa.";

  if (health.aqi > 150) tips += ` Chất lượng không khí kém (AQI: ${health.aqi}) — hạn chế ra ngoài trời.`;
  else if (health.aqi > 100) tips += ` Không khí hơi ô nhiễm (AQI: ${health.aqi}), người nhạy cảm nên đeo khẩu trang.`;

  return `${intro} ${weather}${tips}`;
}

export async function POST(req: NextRequest) {
  let body: AISummaryPayload;

  try {
    body = (await req.json()) as AISummaryPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { city, current, forecast, health } = body;
  const apiKey = process.env.GROQ_API_KEY;

  // Nếu không có key → dùng ngay fallback
  if (!apiKey) {
    return NextResponse.json({ summary: generateFallbackSummary(body) });
  }

  try {
    const prompt = `
Bạn là trợ lý thời tiết thân thiện, nói tiếng Việt tự nhiên, ngắn gọn (tối đa ~80 từ).

Thông tin hiện tại cho thành phố ${city}:
- Nhiệt độ: ${current.temperature}°C
- Mô tả: ${current.description}
- Độ ẩm: ${current.humidity}%
- Gió: ${current.windSpeed} km/h
- UV: ${current.uvi}

Dự báo 5 ngày:
${forecast.map((d) => `- ${d.date}: ${d.description}, ${d.minTemp}–${d.maxTemp}°C, xác suất mưa ${(d.rainProb * 100).toFixed(0)}%`).join("\n")}

Sức khoẻ:
- AQI: ${health.aqi} (${health.aqiCategory})
- Phấn hoa (Cây: ${health.pollenTree}/5, Cỏ: ${health.pollenGrass}/5)

Hãy mở đầu thân thiện ("Chào bạn, hôm nay ở ${city}..."), tóm tắt tổng quan và 1–2 gợi ý. Chỉ 1 đoạn văn, không bullet.
`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Bạn là trợ lý thời tiết thân thiện người Việt." },
          { role: "user", content: prompt },
        ],
        max_tokens: 200,
      }),
    });

    const data = await res.json();

    // Có lỗi từ OpenAI → graceful fallback thay vì crash
    if (data.error || !data.choices?.[0]) {
      console.warn("Groq không khả dụng:", data.error?.message ?? "Unknown");
      return NextResponse.json({ summary: generateFallbackSummary(body) });
    }

    const summary = data.choices[0].message?.content ?? generateFallbackSummary(body);
    return NextResponse.json({ summary });

  } catch (e) {
    console.error("AI error", e);
    return NextResponse.json({ summary: generateFallbackSummary(body) });
  }
}
