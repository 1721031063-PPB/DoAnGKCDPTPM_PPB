import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { activity, timeDescription, current, forecast } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    // Fallback nếu không có API Key
    if (!apiKey) {
      const basicScore = current.temperature > 15 && current.temperature < 32 && forecast.rainProb < 0.5 ? 85 : 45;
      return NextResponse.json({
        score: basicScore,
        outfit: basicScore > 70 ? ["Áo thun", "Mũ lưỡi trai", "Kính râm"] : ["Áo khoác", "Ô/dù", "Giày đi mưa"],
        bestTime: "Sáng sớm",
        advice: "Đây là nhận định tự động do thiếu API Key. Hãy khai báo GROQ_API_KEY trong .env.local",
      });
    }

    const payload = {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Bạn là trợ lý du lịch AI. Phân tích tác động của thời tiết đến kế hoạch của người dùng. Trả về JSON chứa: score (0-100), outfit (mảng các chuỗi ngắn gọn gỉợi ý đồ mặc), bestTime (chuỗi, khung giờ lý tưởng nhất), advice (chuỗi, lý giải ngắn gọn 2-3 câu).",
        },
        {
          role: "user",
          content: `Kế hoạch: ${activity} vào ${timeDescription}.\nThời tiết hiện tại: ${current.temperature}°C, ${current.description}, UV: ${current.uvi}.\nDự báo: Khả năng mưa ${(forecast.rainProb * 100).toFixed(0)}%.`,
        },
      ],
      response_format: { type: "json_object" },
    };

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.error) {
       console.error("Groq Error:", data.error);
       
       // Fallback vì tài khoản miễn phí hoặc lỗi
       const basicScore = current.temperature > 15 && current.temperature < 32 && forecast.rainProb < 0.5 ? 85 : 45;
       return NextResponse.json({
         score: basicScore,
         outfit: basicScore > 70 ? ["Áo thun", "Mũ lưỡi trai", "Kính râm"] : ["Áo khoác", "Ô/dù", "Giày đi mưa"],
         bestTime: "Sáng sớm",
         advice: `Hệ thống dùng thuật toán nội bộ vì API Groq bị lỗi (${data.error.code || 'quota_exceeded'}).`,
       });
    }
    
    const parsed = JSON.parse(data.choices[0].message.content);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Lỗi AI Planner:", error);
    return NextResponse.json({ score: 0, advice: "Hệ thống AI quá tải.", outfit: [], bestTime: "" }, { status: 500 });
  }
}
