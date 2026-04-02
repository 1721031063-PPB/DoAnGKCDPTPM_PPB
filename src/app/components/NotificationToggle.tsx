"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, CheckCircle } from "lucide-react";

// Danh sách điều kiện nguy hiểm cần alert
const DANGER_CONDITIONS = ["thunderstorm", "rain", "drizzle", "snow"];
const DANGER_KEYWORDS = ["dông", "mưa to", "bão", "tuyết", "lốc"];

function checkWeatherDanger(condition: string, description: string): boolean {
  return (
    DANGER_CONDITIONS.includes(condition) ||
    DANGER_KEYWORDS.some((kw) => description.toLowerCase().includes(kw))
  );
}

export default function NotificationToggle({
  condition,
  description,
  city,
}: {
  condition: string;
  description: string;
  city: string;
}) {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if ("Notification" in window && "serviceWorker" in navigator) {
      setSupported(true);
      setPermission(Notification.permission);
      setSubscribed(Notification.permission === "granted");

      // Đăng ký Service Worker
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("SW registration failed:", err));
    }
  }, []);

  // Khi thời tiết nguy hiểm và đã đăng ký → tự động phát thông báo
  useEffect(() => {
    if (!subscribed || !condition) return;

    if (checkWeatherDanger(condition, description)) {
      const lastAlert = localStorage.getItem("skycast_last_alert");
      const now = Date.now();
      // Chỉ alert tối đa 1 lần / 30 phút
      if (!lastAlert || now - parseInt(lastAlert) > 30 * 60 * 1000) {
        localStorage.setItem("skycast_last_alert", String(now));
        new Notification(`⚠️ Cảnh báo thời tiết — ${city.split(",")[0]}`, {
          body: `Phát hiện ${description}. Hãy chú ý an toàn khi ra ngoài!`,
          icon: "/icon-192.png",
          tag: "weather-danger",
          requireInteraction: true,
        });
      }
    }
  }, [condition, description, subscribed, city]);

  const handleToggle = async () => {
    if (!supported) return;

    if (subscribed) {
      // Không thể revoke programmatically — hướng dẫn user
      alert(
        'Để tắt thông báo, vào Cài đặt trình duyệt → Quyền → Thông báo → Chặn trang này.'
      );
      return;
    }

    // Xin quyền
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      setSubscribed(true);
      new Notification("✅ SKYCAST AI — Đã bật thông báo!", {
        body: "Bạn sẽ nhận cảnh báo khi có dông/mưa to/bão tại thành phố đang theo dõi.",
        icon: "/icon-192.png",
      });
    }
  };

  if (!supported) return null;

  return (
    <button
      onClick={handleToggle}
      title={subscribed ? "Đang bật thông báo thời tiết" : "Bật thông báo cảnh báo thời tiết"}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition border backdrop-blur-md
        ${subscribed
          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30"
          : "bg-slate-800/50 border-white/10 text-slate-400 hover:text-white hover:border-sky-500/50"
        }`}
    >
      {subscribed ? (
        <>
          <CheckCircle className="w-3.5 h-3.5" />
          Đang nhận cảnh báo
        </>
      ) : (
        <>
          <Bell className="w-3.5 h-3.5" />
          Bật cảnh báo mưa/bão
        </>
      )}
    </button>
  );
}
