"use client";

import { useEffect, useState } from "react";
import { MapContainer as OriginalMapContainer, TileLayer as OriginalTileLayer } from "react-leaflet";
const MapContainer = OriginalMapContainer as any;
const TileLayer = OriginalTileLayer as any;
import "leaflet/dist/leaflet.css";

interface Props {
  lat?: number;
  lon?: number;
}

interface RainViewerFrame {
  path: string;
  time: number;
}

export default function RainRadarMap({ lat, lon }: Props) {
  const [frame, setFrame] = useState<RainViewerFrame | null>(null);
  const [error, setError] = useState<string | null>(null);

  const center: [number, number] = [
    lat ?? 10.8231,
    lon ?? 106.6297
  ];

  useEffect(() => {
    let cancelled = false;

    async function loadFrames() {
      try {
        setError(null);
        const res = await fetch(
          "https://api.rainviewer.com/public/weather-maps.json"
        );
        if (!res.ok) throw new Error("Không tải được RainViewer");

        const json = await res.json();
        const past: RainViewerFrame[] = json?.radar?.past ?? [];

        if (!past.length) throw new Error("Không có dữ liệu radar");

        const last = past[past.length - 1];
        if (!cancelled) setFrame(last);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Lỗi RainViewer");
      }
    }

    loadFrames();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-[11px] text-rose-300/80 px-4 text-center">
        {error}
      </div>
    );
  }

  if (!frame) {
    return (
      <div className="h-full flex items-center justify-center text-[11px] text-slate-300/80">
        Đang tải radar mưa...
      </div>
    );
  }

  const radarTileUrl = `https://tilecache.rainviewer.com/v2/radar/${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;

  return (
    <MapContainer
      key={`map-${center[0]}-${center[1]}-${frame.path}`}
      center={center}
      zoom={6}
      minZoom={3}
      maxZoom={12}
      scrollWheelZoom
      className="h-full w-full relative z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {frame.path && (
        <TileLayer
          key={`radar-${frame.path}`}
          url={radarTileUrl}
          opacity={0.7}
          zIndex={500}
        />
      )}
    </MapContainer>
  );
}
