export interface AISummaryPayload {
  city: string;
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    description: string;
    condition: string;
    uvi: number;
  };
  forecast: Array<{
    date: string;
    minTemp: number;
    maxTemp: number;
    description: string;
    rainProb: number;
  }>;
  health: {
    aqi: number;
    aqiCategory: string;
    pollenTree: number;
    pollenGrass: number;
  };
}

export async function getFriendlyWeatherSummary(
  payload: AISummaryPayload
): Promise<string> {
  try {
    const res = await fetch("/api/weather-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("AI summary error");
    const data = await res.json();
    return data.summary ?? "";
  } catch {
    return "";
  }
}

