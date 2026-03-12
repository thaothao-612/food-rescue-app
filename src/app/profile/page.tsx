"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

interface Stats {
  followedStores: number;
  rescuedItems: number;
  totalSavings: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats>({
    followedStores: 0,
    rescuedItems: 0,
    totalSavings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth");
        return;
      }

      // 1. Lấy thông tin cá nhân từ bảng users
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (userData) {
        setProfile(userData as UserProfile);
      }

      // 2. Lấy số lượng cửa hàng đã theo dõi
      const { count: followCount } = await supabase
        .from("follows")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);

      // 3. Lấy số hàng đã cứu (đơn Completed) và tính tiền tiết kiệm
      const { data: reservations } = await supabase
        .from("reservations")
        .select(`
          quantity,
          products (
            original_price,
            sale_price
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "Completed");

      let rescuedItems = 0;
      let totalSavings = 0;

      reservations?.forEach(r => {
        rescuedItems += r.quantity;
        const savingsPerItem = (r.products?.original_price ?? 0) - (r.products?.sale_price ?? 0);
        totalSavings += savingsPerItem * r.quantity;
      });

      setStats({
        followedStores: followCount ?? 0,
        rescuedItems,
        totalSavings,
      });

      setLoading(false);
    };

    loadData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF8]">
      <header className="flex items-center justify-between px-4 pb-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"
        >
          ←
        </button>
        <h1 className="text-base font-bold text-gray-900">Cá nhân</h1>
        <div className="h-8 w-8" />
      </header>

      <main className="flex-1 space-y-4 px-4 pt-2">
        {/* Header Profile */}
        <div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl shadow-inner">
            👤
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold text-gray-900">
              {profile?.full_name ?? "Người dùng"}
            </div>
            <div className="text-xs text-gray-500">{profile?.email}</div>
            <div className="mt-1 inline-block rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-[#FF6B00]">
              {profile?.role === 'store_owner' ? 'Chủ cửa hàng' : 'Người mua'}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-orange-50">
            <div className="text-[11px] font-medium text-gray-500">Hàng đã cứu</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-[#FF6B00]">{stats.rescuedItems}</span>
              <span className="text-[10px] text-gray-400">suất</span>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-orange-50">
            <div className="text-[11px] font-medium text-gray-500">Đã tiết kiệm</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-emerald-600">{stats.totalSavings.toLocaleString('vi-VN')}</span>
              <span className="text-[10px] text-gray-400">₫</span>
            </div>
          </div>
        </div>

        {/* Action List */}
        <div className="rounded-3xl bg-white p-2 shadow-sm">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Hoạt động
          </div>
          
          <button
            type="button"
            onClick={() => router.push("/my-orders?tab=completed")}
            className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm hover:bg-orange-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-base">🛒</span>
              <span className="font-medium text-gray-700">Lịch sử đơn hàng</span>
            </div>
            <span className="text-gray-300">›</span>
          </button>

          <button
            type="button"
            className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm hover:bg-orange-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-base">❤️</span>
              <div className="flex flex-col items-start">
                <span className="font-medium text-gray-700">Cửa hàng đã theo dõi</span>
                <span className="text-[10px] text-gray-400">{stats.followedStores} cửa hàng</span>
              </div>
            </div>
            <span className="text-gray-300">›</span>
          </button>

          {profile?.role === 'store_owner' && (
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm hover:bg-orange-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-base">🏪</span>
                <span className="font-medium text-gray-700">Dashboard cửa hàng</span>
              </div>
              <span className="text-gray-300">›</span>
            </button>
          )}
        </div>

        {/* Settings & Support */}
        <div className="rounded-3xl bg-white p-2 shadow-sm">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Cài đặt
          </div>
          
          <button
            type="button"
            onClick={() => router.push("/profile/settings")}
            className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm hover:bg-orange-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-base">⚙️</span>
              <span className="font-medium text-gray-700">Thiết lập tài khoản</span>
            </div>
            <span className="text-gray-300">›</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-base">🚪</span>
              <span className="font-medium text-red-500">Đăng xuất</span>
            </div>
          </button>
        </div>

        <div className="py-4 text-center text-[10px] text-gray-300">
          Food Rescue v1.0.0
        </div>
      </main>
    </div>
  );
}

