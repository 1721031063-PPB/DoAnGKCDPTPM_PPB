"use client";

import { useState, useEffect } from "react";

interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  condition: string;
}

type Theme = "dark" | "light" | "minimal";

export default function WidgetPage() {
  const [city, setCity] = useState("Ho Chi Minh City");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = (typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("theme") || "dark"
    : "dark") as Theme;
  const paramCity = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("city") || "Ho Chi Minh City"
    : "Ho Chi Minh City";

  useEffect(() => {
    const targetCity = paramCity;
    setCity(targetCity);
    fetch("/api/weather", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: targetCity }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.current) setWeather(data.current);
      })
      .finally(() => setLoading(false));
  }, []);

  const conditionEmoji: Record<string, string> = {
    clear: "☀️", clouds: "⛅", rain: "🌧️", thunderstorm: "⛈️",
    snow: "❄️", drizzle: "🌦️", mist: "🌫️",
  };

  const themes: Record<Theme, string> = {
    dark: "bg-slate-900 text-white border-slate-700",
    light: "bg-white text-slate-900 border-slate-200",
    minimal: "bg-transparent text-white border-white/20",
  };

  const subTextThemes: Record<Theme, string> = {
    dark: "text-slate-400", light: "text-slate-500", minimal: "text-white/60",
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-2 ${theme === "light" ? "bg-slate-100" : "bg-transparent"}`}>
      <div className={`rounded-2xl border p-4 w-64 shadow-xl backdrop-blur-xl ${themes[theme]}`}>
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : weather ? (
          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-medium ${subTextThemes[theme]}`}>SKYCAST AI</p>
                <p className="text-sm font-semibold truncate max-w-[130px]">{city.split(",")[0]}</p>
              </div>
              <span className="text-4xl leading-none">
                {conditionEmoji[weather.condition] ?? "🌡️"}
              </span>
            </div>

            {/* Temp */}
            <div>
              <p className="text-3xl font-light leading-none">{Math.round(weather.temperature)}°C</p>
              <p className={`text-xs mt-1 ${subTextThemes[theme]} capitalize`}>{weather.description}</p>
            </div>

            {/* Details */}
            <div className={`flex gap-3 text-xs pt-2 border-t ${theme === "light" ? "border-slate-200" : "border-white/10"}`}>
              <span>💧 {weather.humidity}%</span>
              <span>💨 {Math.round(weather.windSpeed)} km/h</span>
            </div>

            {/* Branding */}
            <p className={`text-[10px] text-center pt-1 ${subTextThemes[theme]}`}>
              skycast-ai.vercel.app
            </p>
          </div>
        ) : (
          <p className="text-xs text-center text-red-400">Không tải được dữ liệu</p>
        )}
      </div>
    </div>
  );
}
