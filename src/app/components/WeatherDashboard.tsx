"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { getFriendlyWeatherSummary } from "../lib/aiSummary";
import { calculateTripScore } from "../lib/tripPlanner";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Star, MapPin, Wind, Droplets, Sun, CalendarDays, Activity, Clock, ArrowLeftRight, Code2 } from "lucide-react";
import HourlyChart, { HourlyData } from "./HourlyChart";

const WeatherHistory = dynamic(() => import("./WeatherHistory"), { ssr: false });
const NotificationToggle = dynamic(() => import("./NotificationToggle"), { ssr: false });

const WeatherAtmosphere = dynamic(
  () => import("../effects/WeatherAtmosphere"),
  { ssr: false }
);

const WeatherMapLayers = dynamic(
  () => import("../components/WeatherMapLayers"),
  { ssr: false }
);

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

interface HealthData {
  aqi: number;
  aqiCategory: string;
  pollenTree: number;
  pollenGrass: number;
}

interface AIPerfectTripResult {
  score: number;
  outfit: string[];
  bestTime: string;
  advice: string;
}

const DEFAULT_CITY = "Ho Chi Minh City";

async function fetchWeatherByCity(city: string) {
  const res = await fetch("/api/weather", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Không lấy được dữ liệu thời tiết.");
  }
  return data as {
    current: CurrentWeather;
    forecast: DailyForecast[];
    hourly: HourlyData[];
    lat: number;
    lon: number;
  };
}

async function fetchHealthData(lat: number, lon: number): Promise<HealthData> {
  const res = await fetch("/api/health", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lon })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Không lấy được dữ liệu sức khoẻ.");
  }
  return data as HealthData;
}

const aqiColor = (aqi: number) => {
  if (aqi <= 50) return "bg-emerald-500/40 border-emerald-400";
  if (aqi <= 100) return "bg-yellow-500/40 border-yellow-400";
  if (aqi <= 150) return "bg-orange-500/40 border-orange-400";
  if (aqi <= 200) return "bg-red-500/40 border-red-400";
  if (aqi <= 300) return "bg-purple-500/40 border-purple-400";
  return "bg-rose-700/40 border-rose-500";
};

const uviLabel = (uvi: number) => {
  if (uvi < 3) return "Thấp";
  if (uvi < 6) return "Trung bình";
  if (uvi < 8) return "Cao";
  if (uvi < 11) return "Rất cao";
  return "Nguy hiểm";
};

const WeatherDashboard: React.FC = () => {
  const { data: session } = useSession();
  
  const [city, setCity] = useState(DEFAULT_CITY);
  const [searchQuery, setSearchQuery] = useState(DEFAULT_CITY);
  const [suggestions, setSuggestions] = useState<
    { label: string; lat: number; lon: number }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<{ label: string; lat: number; lon: number }[]>([]);
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [hourly, setHourly] = useState<HourlyData[]>([]);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [friendlySummary, setFriendlySummary] = useState("");
  const [plannerActivity, setPlannerActivity] = useState("Đi biển");
  const [plannerTime, setPlannerTime] = useState("Chiều nay");
  const [plannerResult, setPlannerResult] = useState<AIPerfectTripResult | null>(
    null
  );
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cityParam = urlParams.get("city");
    if (cityParam) {
      setCity(cityParam);
      setSearchQuery(cityParam);
      handleFetch(cityParam);
    } else {
      handleFetch();
    }
  }, []);

  // Fetch favorites on load
  useEffect(() => {
    if (session) {
      fetch("/api/favorites")
        .then((res) => res.json())
        .then((data) => {
          if (data.favorites) setFavorites(data.favorites);
        });
    } else {
      const local = localStorage.getItem("skycast_favorites");
      if (local) {
        try {
          setFavorites(JSON.parse(local));
        } catch {}
      } else {
        setFavorites([]);
      }
    }
  }, [session]);

  const toggleFavorite = async () => {
    if (!coords) return;

    const isFav = favorites.find((f) => f.label === city);
    
    if (session) {
      if (isFav) {
        const res = await fetch(`/api/favorites?label=${encodeURIComponent(city)}`, { method: "DELETE" });
        const data = await res.json();
        if (data.favorites) setFavorites(data.favorites);
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: city, lat: coords.lat, lon: coords.lon }),
        });
        const data = await res.json();
        if (data.favorites) setFavorites(data.favorites);
      }
    } else {
      let updated = [...favorites];
      if (isFav) {
        updated = updated.filter(f => f.label !== city);
      } else {
        updated.push({ label: city, lat: coords.lat, lon: coords.lon });
      }
      setFavorites(updated);
      localStorage.setItem("skycast_favorites", JSON.stringify(updated));
    }
  };

  // Autocomplete địa danh (debounce)
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2 || searchQuery === city) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geo-search?q=${encodeURIComponent(
          searchQuery
        )}`);
        const data = await res.json();
        if (!res.ok) {
          setSuggestions([]);
          return;
        }
        const mapped =
          (data.results as any[])?.map((r) => ({
            label: `${r.name}${
              r.state ? ", " + r.state : ""
            }, ${r.country}`,
            lat: r.lat,
            lon: r.lon
          })) ?? [];
        setSuggestions(mapped);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 350);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, city]);

  const handleFetch = async (targetCity = city) => {
    try {
      if (typeof targetCity !== "string") targetCity = city; // Bắt sự kiện OnClick trả về event thay vì string
      setError(null);
      setLoading(true);
      const { current, forecast, hourly: hData, lat, lon } = await fetchWeatherByCity(targetCity);
      setCurrent(current);
      setForecast(forecast);
      setHourly(hData ?? []);
      setCoords({ lat, lon });

      const healthData = await fetchHealthData(lat, lon);
      setHealth(healthData);

      const summary = await getFriendlyWeatherSummary({
        city: targetCity,
        current,
        forecast,
        health: healthData
      });
      setFriendlySummary(summary);
    } catch (e: any) {
      setError(e?.message ?? "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = async (s: {
    label: string;
    lat: number;
    lon: number;
  }) => {
    try {
      setShowSuggestions(false);
      setCity(s.label);
      setSearchQuery(s.label);
      setError(null);
      setLoading(true);

      // Gọi thẳng weather bằng city (server route vẫn geocode lại),
      // nhưng ta cũng cập nhật coords trước cho Radar/Health mượt hơn.
      setCoords({ lat: s.lat, lon: s.lon });

      const { current, forecast, lat, lon } = await fetchWeatherByCity(
        s.label
      );
      setCurrent(current);
      setForecast(forecast);
      setCoords({ lat, lon });

      const healthData = await fetchHealthData(lat, lon);
      setHealth(healthData);

      const summary = await getFriendlyWeatherSummary({
        city: s.label,
        current,
        forecast,
        health: healthData
      });
      setFriendlySummary(summary);
    } catch (e: any) {
      setError(e?.message ?? "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanner = async () => {
    if (!current || !forecast.length) return;
    setPlannerLoading(true);

    try {
      const targetForecast = forecast[0];
      const res = await fetch("/api/ai-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity: plannerActivity,
          timeDescription: plannerTime,
          current,
          forecast: targetForecast,
        }),
      });
      const data = await res.json();
      setPlannerResult(data);
    } catch (e) {
      alert("Lỗi khi kết nối AI Planner!");
    } finally {
      setPlannerLoading(false);
    }
  };

  const condition = current?.condition ?? "clear";

  // Đổi gradient nền theo thời gian/ngày để immersive hơn
  const hour = new Date().getHours();
  let dayPhaseClass =
    "from-sky-500/20 via-slate-900 to-indigo-700/40"; // mặc định
  if (hour >= 5 && hour < 11) {
    // sáng sớm
    dayPhaseClass = "from-orange-300/25 via-sky-900/80 to-slate-900";
  } else if (hour >= 11 && hour < 16) {
    // trưa nắng
    dayPhaseClass = "from-amber-300/35 via-sky-500/10 to-slate-900";
  } else if (hour >= 16 && hour < 19) {
    // chiều tối
    dayPhaseClass = "from-rose-400/30 via-indigo-800/80 to-slate-950";
  } else if (hour >= 19 || hour < 5) {
    // đêm khuya
    dayPhaseClass = "from-slate-900 via-slate-950 to-indigo-900/70";
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* Parallax ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#38bdf81a,_transparent_60%),radial-gradient(circle_at_bottom,_#6366f11a,_transparent_55%)]" />
      </div>

      <WeatherAtmosphere condition={condition} />

      <div
        className={`pointer-events-none fixed inset-0 bg-gradient-to-br ${dayPhaseClass}`}
      ></div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-8">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="flex-1 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-200">
                  SKYCAST AI
                </h1>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-sky-400">
                  <path d="M7.5 2.25A1.5 1.5 0 006 3.75V4.5H4.5A1.5 1.5 0 003 6v1.5H2.25a.75.75 0 000 1.5H3v3H2.25a.75.75 0 000 1.5H3v3H2.25a.75.75 0 000 1.5H3v1.5A1.5 1.5 0 004.5 21h1.5v.75a.75.75 0 001.5 0V21h3v.75a.75.75 0 001.5 0V21h3v.75a.75.75 0 001.5 0V21h1.5A1.5 1.5 0 0021 19.5v-1.5h.75a.75.75 0 000-1.5H21v-3h.75a.75.75 0 000-1.5H21v-3h.75a.75.75 0 000-1.5H21V6a1.5 1.5 0 00-1.5-1.5H18v-.75a.75.75 0 00-1.5 0V4.5h-3v-.75a.75.75 0 00-1.5 0V4.5h-3v-.75a.75.75 0 00-1.5 0v.75H7.5V3.75a1.5 1.5 0 00-1.5-1.5zm1.5 4.5h6a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5h-6A1.5 1.5 0 016 14.25v-6A1.5 1.5 0 017.5 6.75zm1.5 3a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-1.5A.75.75 0 0012 9.75H9z" />
                </svg>
              </div>
              <p className="text-slate-300/80 mt-1">
                Trợ lý thời tiết thông minh, thân thiện với sức khoẻ.
              </p>
            </div>
            
            <div className="hidden md:flex flex-col items-end gap-3">
              {/* Nav links */}
              <div className="flex items-center gap-2">
                <Link href="/favorites" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-yellow-300 transition-colors border border-white/10 hover:border-yellow-500/50 px-3 py-1.5 rounded-lg bg-slate-800/50 backdrop-blur-md">
                  <Star className="w-3.5 h-3.5" /> Nơi đã lưu
                </Link>
                <Link href="/compare" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-300 transition-colors border border-white/10 hover:border-sky-500/50 px-3 py-1.5 rounded-lg bg-slate-800/50 backdrop-blur-md">
                  <ArrowLeftRight className="w-3.5 h-3.5" /> So sánh
                </Link>
                <Link href="/widget" target="_blank" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-300 transition-colors border border-white/10 hover:border-violet-500/50 px-3 py-1.5 rounded-lg bg-slate-800/50 backdrop-blur-md">
                  <Code2 className="w-3.5 h-3.5" /> Widget
                </Link>
              </div>
              {/* Auth */}
              {session ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-sky-200">Chào, {session.user?.name}</span>
                  <button onClick={() => signOut()} className="text-sm text-slate-400 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded-lg bg-slate-800/50 backdrop-blur-md">
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <Link href="/auth/login" className="text-sm font-medium text-white hover:text-sky-300 transition-colors bg-sky-500/80 hover:bg-sky-500 border border-sky-400/50 px-4 py-2 rounded-xl shadow-lg backdrop-blur-md">
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto md:min-w-[420px]">
            <div className="relative w-full">
              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                onFocus={() => {
                  if (suggestions.length && searchQuery !== city) setShowSuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Nhập thành phố, quốc gia..."
                className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70 backdrop-blur-md text-slate-100"
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full rounded-2xl border border-white/10 bg-slate-800/80 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] max-h-64 overflow-y-auto z-[70] flex flex-col p-2 gap-1.5">
                  {suggestions.map((s, idx) => (
                    <button
                      key={`${s.label}-${s.lat}-${s.lon}-${idx}`}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full text-left px-4 py-3 rounded-xl border border-transparent hover:border-white/10 hover:bg-slate-700/80 flex flex-col transition-all"
                    >
                      <span className="text-slate-100 font-medium text-sm">{s.label}</span>
                      <span className="text-xs text-slate-400 mt-1">
                        ({s.lat.toFixed(2)}, {s.lon.toFixed(2)})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => handleFetch(city)}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-sm md:text-base font-medium shadow-lg shadow-sky-500/30 transition disabled:opacity-60 whitespace-nowrap flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
              {loading ? "Đang tải..." : "Lấy dữ liệu"}
            </button>
          </div>
        </motion.header>

        {error && (
          <div className="bg-rose-900/50 border border-rose-500/60 text-rose-50 px-4 py-3 rounded-2xl text-sm">
            {error}
          </div>
        )}

        <section className="grid lg:grid-cols-[1.5fr,1fr] gap-6">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="group relative overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-2xl p-6 shadow-2xl shadow-sky-950/40"
            >
              <div className="absolute inset-0 opacity-40 pointer-events-none">
                <div className="absolute -top-20 -right-10 w-56 h-56 bg-sky-500/40 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 -left-10 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl"></div>
              </div>

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                      Hiện tại
                    </p>
                    <button onClick={toggleFavorite} className="focus:outline-none transition-transform hover:scale-110 active:scale-95" title="Yêu thích">
                      {favorites.find((f) => f.label === city) ? (
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-md" />
                      ) : (
                        <Star className="w-5 h-5 text-slate-400 hover:text-yellow-200" />
                      )}
                    </button>
                    <NotificationToggle
                      condition={current?.condition ?? ""}
                      description={current?.description ?? ""}
                      city={city}
                    />
                  </div>
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-sky-400" /> {city || DEFAULT_CITY}
                  </h2>
                  <p className="text-slate-300 text-sm pl-8">
                    {current
                      ? new Date().toLocaleString("vi-VN", {
                          weekday: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "Đang chờ dữ liệu..."}
                  </p>
                </div>

                {current && (
                  <div className="flex items-end gap-4">
                    <div>
                      <motion.p
                        key={current.temperature}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="text-5xl font-semibold leading-none"
                      >
                        {Math.round(current.temperature)}°
                      </motion.p>
                      <p className="text-sm text-slate-300">
                        {current.description}
                      </p>
                    </div>
                    <div className="text-sm text-slate-300 space-y-2 bg-slate-900/50 p-3 flex-shrink-0 min-w-32 rounded-2xl border border-white/5 backdrop-blur-md">
                      <p className="flex items-center gap-1.5 font-medium"><Wind className="w-4 h-4 text-sky-400" /> {Math.round(current.windSpeed)} km/h</p>
                      <p className="flex items-center gap-1.5 font-medium"><Droplets className="w-4 h-4 text-cyan-400" /> {current.humidity}%</p>
                      <p className="flex items-center gap-1.5 font-medium">
                        <Sun className="w-4 h-4 text-yellow-500" /> UV {current.uvi.toFixed(1)} ({uviLabel(current.uvi)})
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {friendlySummary && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative mt-5 rounded-2xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-sm text-sky-50/95 shadow-inner shadow-sky-500/20 group-hover:border-sky-400/70 transition-colors"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/80 mb-1">
                    TÓM TẮT AI
                  </p>
                  <p>{friendlySummary}</p>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="rounded-3xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-indigo-400" /> Dự báo 5 ngày
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {forecast.map((day) => (
                  <motion.div
                    key={day.date}
                    whileHover={{ y: -2, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="rounded-2xl border border-slate-700/60 bg-slate-900/60 px-3 py-3 text-sm flex flex-col gap-1"
                  >
                    <p className="text-xs text-slate-400">{day.date}</p>
                    <p className="text-lg font-semibold">
                      {Math.round(day.maxTemp)}°
                    </p>
                    <p className="text-xs text-slate-300">
                      Thấp nhất {Math.round(day.minTemp)}°
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {day.description}
                    </p>
                    <p className="text-xs text-sky-300 mt-1">
                      Mưa: {(day.rainProb * 100).toFixed(0)}%
                    </p>
                  </motion.div>
                ))}
              </div>

              {hourly && hourly.length > 0 && (
                <div className="pt-2 border-t border-slate-700/60 mt-4">
                  <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-sky-400" /> Biểu đồ 24h Tới
                  </h3>
                  <HourlyChart data={hourly} />
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="rounded-3xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-100">
                  Smart Trip Planner
                </h3>
                <p className="text-xs text-slate-400">
                  Nhập hoạt động và thời điểm, AI chấm điểm chuyến đi.
                </p>
              </div>

              <div className="grid md:grid-cols-[1fr,1.4fr] gap-5 items-start">
                <div className="space-y-3">
                  <input
                    list="activity-suggestions"
                    value={plannerActivity}
                    onChange={(e) => setPlannerActivity(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                    placeholder='Ví dụ: "Đi cắm trại"...'
                  />
                  <datalist id="activity-suggestions">
                    <option value="Đi cắm trại"></option>
                    <option value="Chụp ảnh ngoài trời"></option>
                    <option value="Chạy bộ"></option>
                    <option value="Đạp xe Dạo phố"></option>
                    <option value="Leo núi"></option>
                  </datalist>

                  <input
                    list="time-suggestions"
                    value={plannerTime}
                    onChange={(e) => setPlannerTime(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                    placeholder='Ví dụ: "Chiều nay"...'
                  />
                  <datalist id="time-suggestions">
                    <option value="Trưa nay"></option>
                    <option value="Chiều nay"></option>
                    <option value="Tối nay"></option>
                    <option value="Sáng mai"></option>
                    <option value="Cuối tuần"></option>
                  </datalist>

                  <button
                    onClick={handlePlanner}
                    disabled={plannerLoading}
                    className="w-full px-4 py-2 mt-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-500/50 disabled:cursor-wait text-sm font-medium shadow-lg shadow-indigo-500/30 transition text-white"
                  >
                    {plannerLoading ? "Đang xử lý..." : "Hỏi AI Cố Vấn"}
                  </button>
                </div>

                <div className="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-50/95 space-y-2">
                  {plannerResult ? (
                    <div className="space-y-3 pb-1">
                      {/* Điểm tổng quan */}
                      <div className="flex items-center gap-3">
                         <div className="flex shrink-0 items-center justify-center w-12 h-12 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
                            <span className="text-2xl font-bold text-indigo-300">{plannerResult.score}</span>
                         </div>
                         <div className="flex flex-col">
                           <span className="text-indigo-200/70 text-[10px] font-bold uppercase tracking-[0.15em]">Đánh giá chung</span>
                           <span className="text-indigo-50 text-sm font-semibold tracking-wide">Điểm Chuyến Đi</span>
                         </div>
                      </div>
                      
                      {/* Hai thẻ dọc thay vì chia cột ngang để tránh ép chữ */}
                      <div className="flex flex-col gap-2 mt-1">
                        <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-400/10 relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400/50 rounded-tl-xl rounded-bl-xl"></div>
                           <p className="text-[10px] text-indigo-300/90 font-bold mb-1 tracking-wider uppercase pl-2">👕 Trang phục gợi ý</p>
                           <p className="text-[13px] text-indigo-50 font-medium pl-2 leading-relaxed">
                             {plannerResult.outfit.join(", ")}
                           </p>
                        </div>
                        <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-400/10 relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-1 h-full bg-amber-400/50 rounded-tl-xl rounded-bl-xl"></div>
                           <p className="text-[10px] text-amber-300/90 font-bold mb-1 tracking-wider uppercase pl-2">⌛ Giờ vàng xuất phát</p>
                           <p className="text-[13px] text-indigo-50 font-medium pl-2 leading-relaxed">
                             {plannerResult.bestTime}
                           </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-indigo-500/20">
                        <p className="text-indigo-100/90 text-[13px] italic leading-relaxed text-justify">
                          &quot;{plannerResult.advice}&quot;
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-300 text-xs">
                      Nhập kế hoạch và bấm &quot;Hỏi AI Cố Vấn&quot; để xem cấu trúc gợi ý trang phục, giờ đẹp.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-2xl p-5 space-y-4"
            >
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Thông tin Sức khoẻ
              </h3>

              {health ? (
                <div className="space-y-3">
                  <div
                    className={`rounded-2xl border px-4 py-3 flex items-center justify-between gap-3 ${aqiColor(
                      health.aqi
                    )}`}
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em]">
                        AQI
                      </p>
                      <p className="text-2xl font-semibold">
                        {health.aqi ?? "-"}
                      </p>
                      <p className="text-xs">{health.aqiCategory}</p>
                    </div>
                    <div className="text-xs text-slate-50/90 max-w-[9rem]">
                      {health.aqi > 150
                        ? "Khuyến cáo hạn chế ở ngoài trời, đặc biệt với nhóm nhạy cảm."
                        : "Chất lượng không khí tương đối chấp nhận được."}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-2xl border border-amber-400/50 bg-amber-500/15 px-3 py-3">
                      <p className="uppercase tracking-[0.18em] text-amber-200/90 mb-1">
                        Chỉ số UV
                      </p>
                      <p className="text-xl font-semibold">
                        {current?.uvi.toFixed(1) ?? "-"}
                      </p>
                      <p className="mt-1">
                        {uviLabel(current?.uvi ?? 0)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-lime-400/50 bg-lime-500/10 px-3 py-3 space-y-1">
                      <p className="uppercase tracking-[0.18em] text-lime-200/90">
                        Phấn hoa
                      </p>
                      <p>Cây: {health.pollenTree}/5</p>
                      <p>Cỏ: {health.pollenGrass}/5</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Đang tải dữ liệu sức khoẻ...
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  🗺️ Bản Đồ Thời Tiết
                </h3>
                <p className="text-[11px] text-slate-400">6 lớp dữ liệu thời tiết trực tiếp</p>
              </div>
              <WeatherMapLayers lat={coords?.lat} lon={coords?.lon} />
            </motion.div>
          </div>
        </section>

        {/* Lịch sử 30 ngày */}
        {coords && (
          <section>
            <WeatherHistory lat={coords.lat} lon={coords.lon} city={city} />
          </section>
        )}
      </main>
    </div>
  );
};

export default WeatherDashboard;

