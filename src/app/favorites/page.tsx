"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, Trash2, MapPin } from "lucide-react";

interface FavoriteLocation {
  label: string;
  lat: number;
  lon: number;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run when session status is known ('authenticated' or 'unauthenticated')
    if (status === "loading") return;

    if (session) {
      fetch("/api/favorites")
        .then((res) => res.json())
        .then((data) => {
          if (data.favorites) {
            setFavorites(data.favorites);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      const local = localStorage.getItem("skycast_favorites");
      if (local) {
        try {
          setFavorites(JSON.parse(local));
        } catch {}
      }
      setLoading(false);
    }
  }, [session, status]);

  const removeFavorite = async (label: string) => {
    if (session) {
      const res = await fetch(`/api/favorites?label=${encodeURIComponent(label)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.favorites) setFavorites(data.favorites);
    } else {
      const updated = favorites.filter((f) => f.label !== label);
      setFavorites(updated);
      localStorage.setItem("skycast_favorites", JSON.stringify(updated));
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50 overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_#38bdf81a,_transparent_55%),radial-gradient(circle_at_bottom_left,_#6366f11a,_transparent_55%)]" />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <Link href="/" className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="space-y-1">
            <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-indigo-300">
              <Star className="w-7 h-7 text-yellow-400" /> Địa Điểm Đã Lưu
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">Quản lý danh sách các địa điểm yêu thích của bạn</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-10">Đang tải danh sách...</div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5">
              <Star className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400">Bạn chưa lưu địa điểm nào.</p>
            <Link href="/" className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-sm font-medium shadow-lg transition-colors">
              Tìm kiếm địa điểm
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {favorites.map((fav, i) => (
              <motion.div
                key={fav.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl hover:border-sky-500/40 hover:bg-slate-800/80 transition-all"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-sm sm:text-base font-medium truncate text-slate-200">
                    <MapPin className="inline-w-4 w-4 h-4 text-sky-400 mr-1.5 -mt-1" />
                    {fav.label.split(",")[0]}
                  </h3>
                  <p className="text-xs text-slate-400 truncate mt-0.5 ml-6">
                    {fav.label.split(",").slice(1).join(",").trim() || fav.label}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => router.push(`/?city=${encodeURIComponent(fav.label)}`)}
                    className="px-3 py-1.5 text-xs font-medium bg-sky-500/10 text-sky-300 hover:bg-sky-500 hover:text-white rounded-lg border border-sky-500/20 hover:border-sky-500 transition-colors"
                  >
                    Xem
                  </button>
                  <button
                    onClick={() => removeFavorite(fav.label)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Xóa khỏi danh sách"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
