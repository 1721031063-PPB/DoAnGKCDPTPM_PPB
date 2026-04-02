"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Legend,
} from "recharts";
import { History, Thermometer, CloudRain } from "lucide-react";

interface HistoryDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
}

interface Props {
  lat: number | null;
  lon: number | null;
  city: string;
}

export default function WeatherHistory({ lat, lon, city }: Props) {
  const [history, setHistory] = useState<HistoryDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"temp" | "rain">("temp");

  const fetchHistory = useCallback(async () => {
    if (!lat || !lon) return;
    setLoading(true);
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      });
      const data = await res.json();
      if (data.history) setHistory(data.history);
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Format ngày ngắn gọn cho trục X
  const chartData = history.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
  }));

  const avgMax = history.length ? Math.round(history.reduce((s, d) => s + d.maxTemp, 0) / history.length) : 0;
  const avgMin = history.length ? Math.round(history.reduce((s, d) => s + d.minTemp, 0) / history.length) : 0;
  const totalRain = history.length ? Math.round(history.reduce((s, d) => s + d.precipitation, 0) * 10) / 10 : 0;
  const rainyDays = history.filter((d) => d.precipitation > 1).length;

  if (!lat || !lon) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-2xl p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <History className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-slate-100">Lịch Sử 30 Ngày — {city.split(",")[0]}</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats tổng hợp */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <Thermometer className="w-4 h-4 text-rose-400" />, label: "Trung bình Max", value: `${avgMax}°C` },
              { icon: <Thermometer className="w-4 h-4 text-sky-400" />, label: "Trung bình Min", value: `${avgMin}°C` },
              { icon: <CloudRain className="w-4 h-4 text-cyan-400" />, label: "Tổng lượng mưa", value: `${totalRain} mm` },
              { icon: <CloudRain className="w-4 h-4 text-indigo-400" />, label: "Số ngày có mưa", value: `${rainyDays} ngày` },
            ].map((s) => (
              <div key={s.label} className="bg-slate-800/50 rounded-2xl p-3 space-y-1 border border-white/5">
                <div className="flex items-center gap-1.5">{s.icon}<p className="text-xs text-slate-400">{s.label}</p></div>
                <p className="text-lg font-semibold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tab switch */}
          <div className="flex gap-2">
            {(["temp", "rain"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${tab === t ? "bg-violet-500/30 text-violet-200 border border-violet-500/50" : "text-slate-400 hover:text-white border border-transparent"}`}
              >
                {t === "temp" ? "🌡️ Nhiệt độ" : "🌧️ Lượng mưa"}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="h-52 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              {tab === "temp" ? (
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="maxGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} unit="°" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(15,23,42,0.8)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    labelStyle={{ color: "#94a3b8" }}
                    formatter={(val: any, name: any) => [`${val}°C`, name === "maxTemp" ? "Cao nhất" : "Thấp nhất"]}
                    labelFormatter={(l) => `Ngày ${l}`}
                  />
                  <Legend formatter={(v) => v === "maxTemp" ? "Cao nhất" : "Thấp nhất"} />
                  <Area type="monotone" dataKey="maxTemp" stroke="#f87171" strokeWidth={2} fill="url(#maxGrad)" />
                  <Area type="monotone" dataKey="minTemp" stroke="#38bdf8" strokeWidth={2} fill="url(#minGrad)" />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} unit="mm" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(15,23,42,0.8)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    labelStyle={{ color: "#94a3b8" }}
                    formatter={(val: any) => [`${val} mm`, "Lượng mưa"]}
                    labelFormatter={(l) => `Ngày ${l}`}
                  />
                  <Bar dataKey="precipitation" fill="#38bdf8" radius={[4, 4, 0, 0]} opacity={0.8} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </>
      )}
    </motion.div>
  );
}
