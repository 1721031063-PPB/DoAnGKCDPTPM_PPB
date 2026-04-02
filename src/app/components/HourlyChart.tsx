"use client";

import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export interface HourlyData {
  time: string;
  temp: number;
  rainProb: number;
}

export default function HourlyChart({ data }: { data: HourlyData[] }) {
  if (!data || data.length === 0) return <div className="text-slate-400 text-sm">Chưa có dữ liệu theo giờ.</div>;

  return (
    <div className="h-44 w-full mt-4 -ml-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            stroke="#64748b" 
            tick={{ fill: "#94a3b8", fontSize: 11 }} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.7)", borderColor: "rgba(255, 255, 255, 0.1)", borderRadius: "12px", backdropFilter: "blur(12px)" }}
            itemStyle={{ color: "#38bdf8", fontWeight: "bold" }}
            labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
            formatter={(val: any) => [`${val}°C`, "Nhiệt độ"]}
            labelFormatter={(label) => `Lúc ${label}`}
          />
          <Area 
            type="monotone" 
            dataKey="temp" 
            stroke="#38bdf8" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorTemp)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
