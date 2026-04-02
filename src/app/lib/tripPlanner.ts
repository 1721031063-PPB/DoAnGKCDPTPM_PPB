interface TripPlannerInput {
  activity: string;
  timeDescription: string;
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    description: string;
    condition: string;
  };
  forecast: {
    minTemp: number;
    maxTemp: number;
    rainProb: number;
    description: string;
  };
}

interface TripPlannerResult {
  score: number;
  explanation: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function calculateTripScore(
  input: TripPlannerInput
): TripPlannerResult {
  const { activity, timeDescription, current, forecast } = input;

  let score = 10;
  const reasons: string[] = [];

  const avgTemp = (forecast.minTemp + forecast.maxTemp) / 2;
  const rainPct = forecast.rainProb * 100;

  if (rainPct > 80) {
    score -= 4;
    reasons.push("Xác suất mưa rất cao");
  } else if (rainPct > 50) {
    score -= 2.5;
    reasons.push("Có thể có mưa, nên chuẩn bị ô/áo mưa");
  } else if (rainPct > 20) {
    score -= 1;
    reasons.push("Có rủi ro mưa nhẹ");
  } else {
    reasons.push("Khả năng mưa thấp");
  }

  if (avgTemp < 10) {
    score -= 4;
    reasons.push("Trời khá lạnh");
  } else if (avgTemp < 18) {
    score -= 2;
    reasons.push("Trời hơi lạnh");
  } else if (avgTemp > 35) {
    score -= 4;
    reasons.push("Trời rất nóng");
  } else if (avgTemp > 30) {
    score -= 2;
    reasons.push("Trời hơi oi nóng");
  } else {
    reasons.push("Nhiệt độ khá dễ chịu");
  }

  if (current.windSpeed > 40) {
    score -= 3;
    reasons.push("Gió mạnh, có thể gây khó chịu");
  } else if (current.windSpeed > 25) {
    score -= 1.5;
    reasons.push("Gió tương đối mạnh");
  }

  const lowerActivity = activity.toLowerCase();

  if (lowerActivity.includes("biển") || lowerActivity.includes("beach")) {
    if (avgTemp < 24 || avgTemp > 34) {
      score -= 1.5;
      reasons.push("Nhiệt độ chưa tối ưu cho đi biển");
    }
    if (rainPct > 40) {
      score -= 1.5;
      reasons.push("Mưa có thể làm trải nghiệm biển kém hơn");
    }
  }

  if (
    lowerActivity.includes("leo núi") ||
    lowerActivity.includes("trek") ||
    lowerActivity.includes("hiking")
  ) {
    if (avgTemp > 30) {
      score -= 1.5;
      reasons.push("Trời hơi nóng cho hoạt động leo núi");
    }
    if (rainPct > 30) {
      score -= 2;
      reasons.push("Đường trơn trượt nếu mưa");
    }
  }

  if (
    lowerActivity.includes("chạy bộ") ||
    lowerActivity.includes("jog") ||
    lowerActivity.includes("run")
  ) {
    if (avgTemp > 32) {
      score -= 2;
      reasons.push("Nhiệt độ cao dễ mệt khi chạy bộ");
    }
  }

  score = clamp(score, 1, 10);

  const baseSummary = `Kế hoạch "${activity}" vào ${timeDescription} có điểm phù hợp khoảng ${score.toFixed(
    1
  )}/10.`;
  const details = reasons
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join("; ");

  return {
    score,
    explanation: `${baseSummary} ${details}.`
  };
}

