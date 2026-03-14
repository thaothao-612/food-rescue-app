"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth");
        return;
      }

      setEmail(user.email ?? "");

      const { data: userData } = await supabase
        .from("users")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();
      
      if (userData) {
        setFullName(userData.full_name ?? "");
        setPhone(userData.phone ?? "");
      }
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("users")
        .update({ 
          full_name: fullName,
          phone: phone
        })
        .eq("id", user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: "Cập nhật thông tin thành công!" });
    } catch (err: any) {
      setMessage({ type: 'error', text: "Có lỗi xảy ra: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FFFDF8] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

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
        <h1 className="text-base font-bold text-gray-900">Thiết lập tài khoản</h1>
        <div className="h-8 w-8" />
      </header>

      <main className="flex-1 space-y-6 px-4 pt-4">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
              Email (Không thể thay đổi)
            </label>
            <input
              type="text"
              value={email}
              disabled
              className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
              Họ và tên
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ tên của bạn"
              className="w-full rounded-2xl bg-white border border-orange-100 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại của bạn"
              className="w-full rounded-2xl bg-white border border-orange-100 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
          </div>

          {message && (
            <div className={`rounded-xl px-4 py-2 text-xs font-medium ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-[#FF6B00] py-3.5 text-sm font-bold text-white shadow-md shadow-orange-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Đang lưu...</span>
              </div>
            ) : (
              "Lưu thay đổi"
            )}
          </button>
        </form>

        <div className="rounded-2xl bg-white p-4 border border-orange-50 space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase">Thông tin khác</h3>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Mọi thay đổi về thông tin cá nhân sẽ được áp dụng ngay lập tức cho các đơn hàng và tương tác sau này của bạn trên ứng dụng EcoEat.
          </p>
        </div>
      </main>
    </div>
  );
}
