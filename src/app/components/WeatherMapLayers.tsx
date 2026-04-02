"use client";

import { useEffect, useRef, useState } from "react";
// @ts-ignore
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  lat?: number;
  lon?: number;
}

type MapLayerDef = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  getTileUrl: (apiKey: string, radarPath?: string) => string | null;
  opacity: number;
  colorFrom: string;
  colorTo: string;
  colorMin: string;
  colorMax: string;
};

const LAYERS: MapLayerDef[] = [
  {
    id: "radar",
    label: "Radar Mưa",
    emoji: "🌧️",
    description: "Vị trí mưa thực tế trong 2 giờ gần đây (RainViewer)",
    getTileUrl: (_key, radarPath) =>
      radarPath
        ? `https://tilecache.rainviewer.com/v2/radar/${radarPath}/256/{z}/{x}/{y}/2/1_1.png`
        : null,
    opacity: 0.75,
    colorFrom: "#86efac",
    colorTo: "#991b1b",
    colorMin: "Khô",
    colorMax: "Mưa lớn",
  },
  {
    id: "temp",
    label: "Nhiệt Độ",
    emoji: "🌡️",
    description: "Nhiệt độ bề mặt toàn cầu (OpenWeatherMap)",
    getTileUrl: (key) =>
      key ? `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${key}` : null,
    opacity: 0.6,
    colorFrom: "#818cf8",
    colorTo: "#ef4444",
    colorMin: "Lạnh",
    colorMax: "Nóng",
  },
  {
    id: "wind",
    label: "Tốc Độ Gió",
    emoji: "💨",
    description: "Tốc độ gió bề mặt (OpenWeatherMap)",
    getTileUrl: (key) =>
      key ? `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${key}` : null,
    opacity: 0.65,
    colorFrom: "#bfdbfe",
    colorTo: "#1e3a8a",
    colorMin: "Lặng gió",
    colorMax: "Bão",
  },
  {
    id: "clouds",
    label: "Mây",
    emoji: "☁️",
    description: "Độ che phủ mây toàn cầu (%)",
    getTileUrl: (key) =>
      key ? `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${key}` : null,
    opacity: 0.55,
    colorFrom: "#f8fafc",
    colorTo: "#1e293b",
    colorMin: "Quang mây",
    colorMax: "Mây phủ kín",
  },
  {
    id: "pressure",
    label: "Áp Suất",
    emoji: "🔵",
    description: "Áp suất khí quyển (hPa)",
    getTileUrl: (key) =>
      key ? `https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${key}` : null,
    opacity: 0.55,
    colorFrom: "#7c3aed",
    colorTo: "#fbbf24",
    colorMin: "Thấp",
    colorMax: "Cao",
  },
  {
    id: "precipitation",
    label: "Lượng Mưa",
    emoji: "🌦️",
    description: "Lượng mưa tích lũy (mm/h) — OpenWeatherMap",
    getTileUrl: (key) =>
      key ? `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${key}` : null,
    opacity: 0.65,
    colorFrom: "#bfdbfe",
    colorTo: "#312e81",
    colorMin: "Khô",
    colorMax: "Mưa lớn",
  },
];

export default function WeatherMapLayers({ lat, lon }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const weatherLayer = useRef<L.TileLayer | null>(null);

  const [activeId, setActiveId] = useState("radar");
  const [radarPath, setRadarPath] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [statusMsg, setStatusMsg] = useState("");

  const apiKey = (process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY as string) || "";
  const center: [number, number] = [lat ?? 10.8231, lon ?? 106.6297];

  // Load RainViewer frame once on mount
  useEffect(() => {
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((r) => r.json())
      .then((json) => {
        const past = json?.radar?.past ?? [];
        if (past.length) setRadarPath(past[past.length - 1].path);
      })
      .catch(() => {});
  }, []);

  // Init Leaflet map once
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center,
      zoom: 6,
      minZoom: 3,
      maxZoom: 12,
      zoomControl: true,
    });

    // Sáng basemap (Light/Colorful) từ CartoDB
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com">CARTO</a>',
        maxZoom: 19,
      }
    ).addTo(map);

    leafletMap.current = map;
    setStatus("ready");

    return () => {
      map.remove();
      leafletMap.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recenter when coords change
  useEffect(() => {
    if (!leafletMap.current) return;
    leafletMap.current.setView(center, leafletMap.current.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon]);

  // Switch weather layer when activeId or radarPath changes
  useEffect(() => {
    if (!leafletMap.current || status !== "ready") return;

    const layerDef = LAYERS.find((l) => l.id === activeId)!;
    const url = layerDef.getTileUrl(apiKey, radarPath ?? undefined);

    // Remove existing weather layer
    if (weatherLayer.current) {
      leafletMap.current.removeLayer(weatherLayer.current);
      weatherLayer.current = null;
    }

    if (!url) {
      setStatusMsg(
        activeId === "radar" && !radarPath
          ? "Đang tải radar mưa..."
          : !apiKey
          ? "Cần NEXT_PUBLIC_OPENWEATHER_API_KEY để hiển thị lớp này"
          : ""
      );
      return;
    }

    setStatusMsg("");
    const newLayer = L.tileLayer(url, {
      opacity: layerDef.opacity,
      zIndex: 500,
    });
    newLayer.addTo(leafletMap.current);
    weatherLayer.current = newLayer;
  }, [activeId, radarPath, status, apiKey]);

  return (
    <div className="space-y-3">
      {/* Layer selector tabs */}
      <div className="flex flex-wrap gap-1.5">
        {LAYERS.map((layer) => (
          <button
            key={layer.id}
            onClick={() => setActiveId(layer.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              activeId === layer.id
                ? "bg-sky-500/25 border-sky-400/60 text-sky-200 shadow-inner"
                : "bg-slate-800/50 border-white/10 text-slate-400 hover:text-white hover:border-slate-500"
            }`}
          >
            <span>{layer.emoji}</span>
            <span>{layer.label}</span>
          </button>
        ))}
      </div>

      {/* Info + legend bar */}
      {(() => {
        const def = LAYERS.find((l) => l.id === activeId)!;
        return (
          <div className="flex items-center justify-between gap-4 min-h-[20px]">
            <p className="text-xs text-slate-400 flex-1">{def.description}</p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] text-slate-500 whitespace-nowrap">{def.colorMin}</span>
              <div
                className="h-1.5 w-24 rounded-full"
                style={{ background: `linear-gradient(to right, ${def.colorFrom}, ${def.colorTo})` }}
              />
              <span className="text-[10px] text-slate-500 whitespace-nowrap">{def.colorMax}</span>
            </div>
          </div>
        );
      })()}

      {/* Status message (overlay info) */}
      {statusMsg && (
        <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-xl px-3 py-2">
          ⚠️ {statusMsg}
        </p>
      )}

      {/* Map container */}
      <div
        ref={mapRef}
        className="h-[450px] w-full rounded-2xl overflow-hidden shadow-xl border border-white/10"
        style={{ minHeight: 450 }}
      />
    </div>
  );
}
