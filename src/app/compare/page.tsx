"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowLeftRight, Search, Thermometer, Wind, Droplets, Sun } from "lucide-react";
import Link from "next/link";

interface CityWeather {
  city: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  uvi: number;
  condition: string;
  forecast: { date: string; maxTemp: number; minTemp: number; description: string; rainProb: number }[];
}

const conditionEmoji: Record<string, string> = {
  clear: "☀️", clouds: "⛅", rain: "🌧️", thunderstorm: "⛈️",
  snow: "❄️", drizzle: "🌦️", mist: "🌫️",
};

async function fetchCity(cityName: string): Promise<CityWeather> {
  const res = await fetch("/api/weather", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city: cityName }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return {
    city: cityName,
    temperature: data.current.temperature,
    description: data.current.description,
    humidity: data.current.humidity,
    windSpeed: data.current.windSpeed,
    uvi: data.current.uvi,
    condition: data.current.condition,
    forecast: data.forecast,
  };
}
function AutocompleteInput({ value, onChange, placeholder, onSubmit }: { value: string, onChange: (v: string) => void, placeholder: string, onSubmit: () => void }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!value || value.length < 2 || !show) {
      setSuggestions([]);
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geo-search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        if (data.results) {
           const mapped = data.results.map((r: any) => `${r.name}${r.state ? ", " + r.state : ""}, ${r.country}`);
           setSuggestions(mapped);
        }
      } catch {}
    }, 350);
    return () => clearTimeout(timeoutRef.current!);
  }, [value, show]);

  return (
    <div className="relative flex-1 w-full">
      <input
        value={value}
        onChange={(e) => { onChange(e.target.value); setShow(true); }}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        onFocus={() => { if (value.length > 1) setShow(true); }}
        placeholder={placeholder}
        className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70"
      />
      {show && suggestions.length > 0 && (
        <ul className="absolute z-50 top-full mt-2 left-0 right-0 bg-slate-800/90 backdrop-blur-md border border-slate-700 auto-complete shadow-2xl rounded-xl max-h-56 overflow-auto">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onClick={() => { onChange(s); setShow(false); onSubmit(); }}
              className="px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700/80 cursor-pointer transition-colors border-b border-white/5 last:border-0"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CompareCard({ data, align }: { data: CityWeather; align: "left" | "right" }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: align === "left" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl p-5 space-y-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Thành phố</p>
          <h3 className="text-lg font-semibold mt-0.5 leading-tight">{data.city.split(",")[0]}</h3>
          <p className="text-xs text-slate-400">{data.city.split(",").slice(1).join(",").trim()}</p>
        </div>
        <span className="text-4xl">{conditionEmoji[data.condition] ?? "🌡️"}</span>
      </div>

      <div>
        <p className="text-5xl font-light">{Math.round(data.temperature)}°C</p>
        <p className="text-sm text-slate-300 capitalize mt-1">{data.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-sm">
        <div className="flex flex-col items-center gap-1 bg-slate-800/50 rounded-xl p-2">
          <Droplets className="w-4 h-4 text-cyan-400" />
          <p className="font-semibold">{data.humidity}%</p>
          <p className="text-xs text-slate-400">Ẩm</p>
        </div>
        <div className="flex flex-col items-center gap-1 bg-slate-800/50 rounded-xl p-2">
          <Wind className="w-4 h-4 text-sky-400" />
          <p className="font-semibold">{Math.round(data.windSpeed)}</p>
          <p className="text-xs text-slate-400">km/h</p>
        </div>
        <div className="flex flex-col items-center gap-1 bg-slate-800/50 rounded-xl p-2">
          <Sun className="w-4 h-4 text-yellow-400" />
          <p className="font-semibold">{data.uvi.toFixed(1)}</p>
          <p className="text-xs text-slate-400">UV</p>
        </div>
      </div>

      {/* Forecast mini */}
      <div className="space-y-1.5">
        <p className="text-xs text-slate-400 uppercase tracking-wider">Dự báo</p>
        {data.forecast.slice(0, 3).map((day) => (
          <div key={day.date} className="flex items-center justify-between text-sm">
            <p className="text-slate-300 w-16">{day.date}</p>
            <p className="text-xs text-slate-400 flex-1 px-2 truncate capitalize">{day.description}</p>
            <p className="font-medium">{Math.round(day.maxTemp)}° <span className="text-slate-500 font-normal">{Math.round(day.minTemp)}°</span></p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function WinnerBadge({ label, leftVal, rightVal, leftCity, rightCity, higherIsBetter = true }: {
  label: string;
  leftVal: number;
  rightVal: number;
  leftCity: string;
  rightCity: string;
  higherIsBetter?: boolean;
}) {
  const leftWins = higherIsBetter ? leftVal > rightVal : leftVal < rightVal;
  const tie = leftVal === rightVal;
  const winner = tie ? "Bằng nhau" : leftWins ? leftCity.split(",")[0] : rightCity.split(",")[0];
  const color = tie ? "text-slate-400" : "text-emerald-400";

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 text-sm">
      <p className="text-slate-400">{label}</p>
      <p className={`font-medium ${color}`}>{winner} {!tie && "✓"}</p>
    </div>
  );
}

export default function CompareWeather() {
  const [cityA, setCityA] = useState("");
  const [cityB, setCityB] = useState("");
  const [dataA, setDataA] = useState<CityWeather | null>(null);
  const [dataB, setDataB] = useState<CityWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCompare = async () => {
    if (!cityA || !cityB) return;
    setLoading(true);
    setError("");
    try {
      const [a, b] = await Promise.all([fetchCity(cityA), fetchCity(cityB)]);
      setDataA(a);
      setDataB(b);
    } catch (e: any) {
      setError(e.message || "Không tìm được một trong hai thành phố.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50 overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_#38bdf81a,_transparent_55%),radial-gradient(circle_at_bottom_right,_#6366f11a,_transparent_55%)]" />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <Link href="/" className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-indigo-300">
              So Sánh Thời Tiết
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">Nhập hai thành phố để so sánh điều kiện thời tiết</p>
          </div>
        </div>

        {/* Input */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <AutocompleteInput
            value={cityA}
            onChange={setCityA}
            onSubmit={handleCompare}
            placeholder="Thành phố thứ nhất (VD: Hanoi)..."
          />
          <ArrowLeftRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <AutocompleteInput
            value={cityB}
            onChange={setCityB}
            onSubmit={handleCompare}
            placeholder="Thành phố thứ hai (VD: Seoul)..."
          />
          <button
            onClick={handleCompare}
            disabled={loading || !cityA || !cityB}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-sm font-medium transition whitespace-nowrap"
          >
            <Search className="w-4 h-4" />
            {loading ? "Đang tải..." : "So sánh"}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 text-sm text-red-300 text-center">
            {error}
          </div>
        )}

        {/* Results */}
        {dataA && dataB && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <CompareCard data={dataA} align="left" />
              <CompareCard data={dataB} align="right" />
            </div>

            {/* Verdict */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl p-5"
            >
              <h3 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-rose-400" /> Kết Quả So Sánh
              </h3>
              <WinnerBadge label="Nhiệt độ dễ chịu hơn" leftVal={Math.abs(dataA.temperature - 25)} rightVal={Math.abs(dataB.temperature - 25)} leftCity={dataA.city} rightCity={dataB.city} higherIsBetter={false} />
              <WinnerBadge label="Độ ẩm dễ chịu hơn" leftVal={Math.abs(dataA.humidity - 60)} rightVal={Math.abs(dataB.humidity - 60)} leftCity={dataA.city} rightCity={dataB.city} higherIsBetter={false} />
              <WinnerBadge label="Gió mát mẻ hơn" leftVal={dataA.windSpeed} rightVal={dataB.windSpeed} leftCity={dataA.city} rightCity={dataB.city} higherIsBetter={true} />
              <WinnerBadge label="UV thấp hơn (an toàn hơn)" leftVal={dataA.uvi} rightVal={dataB.uvi} leftCity={dataA.city} rightCity={dataB.city} higherIsBetter={false} />
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
