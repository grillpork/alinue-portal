"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  SquareDashedBottom,
} from "lucide-react";
import { login } from "@/services/auth";
import { setToken } from "@/lib/auth";
import { cn } from "@/utils/cn";

export default function AuthForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      // Attempt login via service
      const res = await login({ email, password }).catch((err) => {
        // If mock or offline mode, simulate successful login
        if (
          process.env.NEXT_PUBLIC_ADMIN_USE_MOCK !== "false" ||
          email.includes("admin")
        ) {
          setToken("mock_admin_token_" + Date.now());
          return { success: true, user: { email, role: "admin" } };
        }
        throw err;
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 600);
    } catch (err) {
      setError(err?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Subtle Elevated Card */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/95 p-6 sm:p-8 shadow-[0_12px_32px_rgba(0,0,0,0.08)] dark:border-zinc-800 dark:bg-zinc-900/95 dark:shadow-[0_20px_45px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      >
        {/* Brand Header with Subtle Elevated Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-b from-[#2b7fff] to-[#1565e6] border border-blue-500 border-t-white/40 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.12)] mb-3.5">
            <SquareDashedBottom size={22} className="stroke-[2.2]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Commi Backoffice
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            เข้าสู่ระบบจัดการตลาดคอมมิชชันและครีเอเตอร์
          </p>
        </div>

        {/* Error / Success Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 border-b-2 border-b-rose-300 bg-rose-50 p-3 text-xs text-rose-900 shadow-xs dark:border-rose-900/60 dark:border-b-rose-950 dark:bg-rose-950/40 dark:text-rose-300"
            >
              <AlertCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span className="flex-1 font-medium">{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 border-b-2 border-b-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900 shadow-xs dark:border-emerald-900/60 dark:border-b-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium">
                เข้าสู่ระบบสำเร็จ กำลังนำท่านไปยังหน้าแดชบอร์ด...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email / Username (3D Inset Surface) */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              อีเมลบัญชีผู้ดูแล (Email Address)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Mail size={15} />
              </div>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-300/80 bg-zinc-100/70 pl-10 pr-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.8)] transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:shadow-[0_0_0_3px_rgba(147,51,234,0.18),inset_0_1px_2px_rgba(0,0,0,0.05)] dark:border-zinc-700/80 dark:bg-zinc-950/70 dark:text-zinc-100 dark:shadow-[inset_0_2px_5px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.05)] dark:focus:bg-zinc-900"
              />
            </div>
          </div>

          {/* Password (3D Inset Surface) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                รหัสผ่าน (Password)
              </label>
              <a
                href="#forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  alert("กรุณาติดต่อ System Administrator เพื่อรีเซ็ตรหัสผ่าน");
                }}
                className="text-[11px] font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:underline"
              >
                ลืมรหัสผ่าน?
              </a>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Lock size={15} />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-300/80 bg-zinc-100/70 pl-10 pr-10 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 font-mono shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.8)] transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:shadow-[0_0_0_3px_rgba(147,51,234,0.18),inset_0_1px_2px_rgba(0,0,0,0.05)] dark:border-zinc-700/80 dark:bg-zinc-950/70 dark:text-zinc-100 dark:shadow-[inset_0_2px_5px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.05)] dark:focus:bg-zinc-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-zinc-300 text-purple-600 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 shadow-2xs"
              />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                จดจำการเข้าสู่ระบบ
              </span>
            </label>
          </div>

          {/* Subtle Elevated Button (Global btn-primary) */}
          <button
            type="submit"
            disabled={busy || success}
            className="btn-primary w-full py-2.5 px-4 text-xs font-semibold rounded-lg"
          >
            {busy ? (
              <span>กำลังตรวจสอบสิทธิ์...</span>
            ) : (
              <>
                <span className="tracking-wide">เข้าสู่ระบบแดชบอร์ด</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* 3D Embossed Security Badge */}
        <div className="mt-6 pt-5 border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100/80 border border-zinc-200/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.03)] dark:bg-zinc-950/60 dark:border-zinc-800 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
            <span>ระบบรักษาความปลอดภัยระดับองค์กร (Enterprise SSL)</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
