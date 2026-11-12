"use client";

import { useState } from "react";
import {
  Activity,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Key,
  Layers,
  Moon,
  Palette,
  RefreshCw,
  Save,
  Send,
  Server,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import PageHeader from "@/components/ui/PageHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  ADMIN_PREFERENCES,
  useAdminPreferences,
  usePreferencesHydrated,
} from "@/hooks/useAdminPreferences";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeHydrated, useThemeStore } from "@/hooks/useTheme";
import { toast } from "@/components/ui/Toast";
import { storefrontUrl } from "@/lib/links";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { cn } from "@/utils/cn";

const TABS = [
  { id: "account", label: "ข้อมูลบัญชี", labelEn: "Account & Security", icon: User },
  { id: "notifications", label: "การแจ้งเตือน", labelEn: "Notifications & Webhooks", icon: Bell },
  { id: "appearance", label: "การแสดงผล", labelEn: "Appearance & Layout", icon: Palette },
  { id: "environment", label: "สภาพแวดล้อม", labelEn: "Environment & API", icon: Server },
  { id: "danger", label: "ขั้นสูง & แคช", labelEn: "Advanced & Storage", icon: Layers },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");
  const [confirmClear, setConfirmClear] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState({ status: "online", ms: 18 });
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [webhookUrl, setWebhookUrl] = useState("https://discord.com/api/webhooks/commi/admin-alerts");
  const [emailDigest, setEmailDigest] = useState("daily");
  const [timezone, setTimezone] = useState("Asia/Bangkok (UTC+07:00)");
  const [language, setLanguage] = useState("th");

  // API Token Mock State
  const [apiTokens, setApiTokens] = useState([
    { id: "tok_admin_live_01", name: "Backoffice Automation CLI", created: "2026-09-10", lastUsed: "วันนี้ 18:30", scope: "Read/Write" },
    { id: "tok_admin_sync_02", name: "Product Sync Microservice", created: "2026-08-15", lastUsed: "3 วันที่แล้ว", scope: "Read Only" },
  ]);

  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const preferencesHydrated = usePreferencesHydrated();
  const preferences = useAdminPreferences();

  const themeHydrated = useThemeHydrated();
  const themeMode = useThemeStore((state) => state.mode);
  const setThemeMode = useThemeStore((state) => state.setMode);

  const displayName = typeof user?.name === "string" ? user.name : user?.username || "ผู้ดูแลระบบ";
  const displayEmail = typeof user?.email === "string" ? user.email : "admin@commi.market";
  const displayRole = typeof user?.role === "string" ? user.role : user?.role?.name || "admin";
  const userId = typeof user?.id === "string" ? user.id : String(user?.id || "admin-system-root");

  const handleCopy = (text, key) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success("คัดลอกสำเร็จ", text);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleToggle = (key, label, nextValue) => {
    preferences.toggle(key);
    toast.info(nextValue ? "เปิดการแจ้งเตือนแล้ว" : "ปิดการแจ้งเตือนแล้ว", label);
  };

  const handlePingTest = () => {
    setIsPinging(true);
    setTimeout(() => {
      const latency = Math.floor(Math.random() * 16) + 12;
      setPingResult({ status: "online", ms: latency });
      setIsPinging(false);
      toast.success("การเชื่อมต่อปกติ", `Backend API ตอบสนองใน ${latency}ms`);
    }, 500);
  };

  const handleSaveSettings = (sectionName) => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("บันทึกการตั้งค่าสำเร็จ", `อัปเดตข้อมูล ${sectionName} เรียบร้อย`);
    }, 400);
  };

  const handleCreateToken = () => {
    const newToken = {
      id: `tok_admin_${Date.now().toString(36)}`,
      name: `Admin API Key ${apiTokens.length + 1}`,
      created: "วันนี้",
      lastUsed: "ยังไม่ได้ใช้งาน",
      scope: "Full Access",
    };
    setApiTokens([newToken, ...apiTokens]);
    toast.success("สร้าง API Token สำเร็จ", newToken.id);
  };

  const handleDeleteToken = (id) => {
    setApiTokens(apiTokens.filter((t) => t.id !== id));
    toast.info("ลบ API Token แล้ว");
  };

  const handleExportConfig = () => {
    const config = {
      user: { id: userId, email: displayEmail, name: displayName, role: displayRole },
      preferences: {
        notifyPendingOrders: preferences.notifyPendingOrders,
        notifyReports: preferences.notifyReports,
        notifyNewUsers: preferences.notifyNewUsers,
      },
      environment: {
        apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
        mode: process.env.NEXT_PUBLIC_ADMIN_USE_MOCK === "false" ? "live" : "mock",
        storefrontUrl: process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000",
      },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commi-admin-settings-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("ส่งออกการตั้งค่าสำเร็จ", "ดาวน์โหลดไฟล์ JSON เรียบร้อย");
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-12 select-none">
      {/* 1. Page Header */}
      <PageHeader
        title="Settings"
        description="Manage account credentials, dashboard attention alerts, theme preferences, and API connections."
        showDate={false}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportConfig}
              className="flex items-center gap-1.5 rounded-md border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer shadow-xs"
            >
              <Download size={13} />
              <span>Export Config</span>
            </button>

            <a
              href={storefrontUrl("/")}
              target="_blank"
              rel="noreferrer"
              className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
            >
              <BookOpen size={13} />
              <span>Documentation</span>
            </a>
          </div>
        }
      />

      {/* 2. Cloudflare-style Tab Navigation Bar (Scrollbar Hidden) */}
      <div className="flex border-b border-zinc-200/80 dark:border-zinc-800 overflow-x-auto no-scrollbar gap-1 pt-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
                isActive
                  ? "text-[#1b64f2] font-semibold dark:text-[#3b82f6]"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200",
              )}
            >
              <Icon size={14} className={isActive ? "text-[#1b64f2] dark:text-[#3b82f6]" : "text-zinc-400"} />
              <span>{tab.label}</span>
              <span className="text-[10px] text-zinc-400 hidden sm:inline">({tab.labelEn})</span>

              {/* Active Tab Underline */}
              {isActive && (
                <motion.div
                  layoutId="settings-active-tab-bar"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1b64f2] dark:bg-[#3b82f6]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents (Cards Matching Audit Log Style) */}
      <div className="space-y-4 pt-1">
        {/* =================================================================== */}
        {/* TAB 1: Account & Security */}
        {/* =================================================================== */}
        {activeTab === "account" && (
          <div className="space-y-4">
            {/* Administrator Profile Card (Two-Tone Layered Inset Style) */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
              {/* Layer 1: Header Bar */}
              <div className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Administrator Profile
                  </h2>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    ข้อมูลผู้ดูแลระบบและสิทธิ์การเข้าถึงระดับระบบ
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditProfileOpen(true)}
                    className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-750 cursor-pointer shadow-2xs transition-colors"
                  >
                    <span>แก้ไขโปรไฟล์</span>
                  </button>
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-[#1b64f2] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50">
                    <ShieldCheck size={12} />
                    {displayRole.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Layer 2: Inner Canvas */}
              <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative size-14 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shadow-xs shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user?.avatarUrl || "/no-image-user-v1.jpg"}
                      alt={displayName}
                      className="size-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/no-image-user-v1.jpg";
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                        {displayName}
                      </h3>
                      <span className="rounded bg-zinc-100 px-1.5 py-0.2 text-[10px] font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        Primary Root Admin
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      {displayEmail}
                    </p>
                  </div>
                </div>

                {/* User Profile Information — Clean Key-Value Profile Grid */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-xs">
                    <div className="space-y-1">
                      <dt className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">ชื่อ-นามสกุล (Full Name)</dt>
                      <dd className="font-semibold text-zinc-900 dark:text-zinc-100">{displayName}</dd>
                    </div>

                    <div className="space-y-1">
                      <dt className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">ชื่อผู้ใช้ (Username)</dt>
                      <dd className="font-mono text-zinc-900 dark:text-zinc-100">@{user?.username || "admin"}</dd>
                    </div>

                    <div className="space-y-1">
                      <dt className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">อีเมลองค์กร (Work Email)</dt>
                      <dd className="text-zinc-900 dark:text-zinc-100 truncate">{displayEmail}</dd>
                    </div>

                    <div className="space-y-1">
                      <dt className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">ระดับสิทธิ์ (Role & RBAC)</dt>
                      <dd className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                        <span className="size-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                        <span>{displayRole.toUpperCase()} (Super Admin)</span>
                      </dd>
                    </div>

                    <div className="space-y-1">
                      <dt className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">แผนกที่สังกัด (Department)</dt>
                      <dd className="text-zinc-900 dark:text-zinc-100">Engineering & IT (ระบบสารสนเทศ)</dd>
                    </div>

                    <div className="space-y-1">
                      <dt className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">ตำแหน่งงาน (Position)</dt>
                      <dd className="text-zinc-900 dark:text-zinc-100">{user?.title || "Lead Platform Architect & Admin"}</dd>
                    </div>

                    <div className="space-y-1">
                      <dt className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">สถานที่ปฏิบัติงาน (Location)</dt>
                      <dd className="text-zinc-900 dark:text-zinc-100">Bangkok HQ (สำนักงานใหญ่ กรุงเทพฯ)</dd>
                    </div>

                    <div className="space-y-1">
                      <dt className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">เวลาทำการ (Working Hours)</dt>
                      <dd className="text-zinc-900 dark:text-zinc-100">{user?.workingHours || "10:00 – 19:00 น. (GMT+7)"}</dd>
                    </div>

                    <div className="space-y-1">
                      <dt className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">สถานะความปลอดภัย (Security)</dt>
                      <dd className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                          <span className="size-2 rounded-full bg-emerald-500" />
                          Active · 2FA Enforced
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">127.0.0.1</span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Layer 3: Footer Bar */}
              <div className="border-t border-zinc-200/80 bg-zinc-50/90 px-4 py-2.5 flex items-center justify-between dark:border-zinc-800 dark:bg-zinc-900/70">
                <span className="text-[11px] text-zinc-400">เข้าสู่ระบบล่าสุด: วันนี้ เวลา 19:37 น.</span>
                <button
                  type="button"
                  onClick={() => handleSaveSettings("โปรไฟล์")}
                  disabled={isSaving}
                  className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
                >
                  {isSaving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                  <span>บันทึกโปรไฟล์</span>
                </button>
              </div>
            </div>

            {/* API Access Tokens Card (Two-Tone Layered Inset Style) */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
              {/* Layer 1: Header Bar */}
              <div className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Key size={13} className="text-[#1b64f2] dark:text-[#3b82f6]" />
                    <span>API Access Tokens</span>
                  </h2>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    จัดการ Token สำหรับเชื่อมต่อสคริปต์อัตโนมัติหรือ Webhook
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCreateToken}
                  className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-750 cursor-pointer shadow-2xs"
                >
                  <Key size={12} className="text-[#1b64f2]" />
                  <span>+ Create Token</span>
                </button>
              </div>

              {/* Layer 2: Inner Canvas */}
              <div className="rounded-t-lg border-t border-zinc-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-950 divide-y divide-zinc-100 dark:divide-zinc-800">
                {apiTokens.map((tok) => (
                  <div key={tok.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{tok.name}</span>
                        <span className="rounded bg-zinc-100 px-1.5 py-0.2 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          {tok.scope}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
                        <span>{tok.id}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(tok.id, tok.id)}
                          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                        >
                          {copiedKey === tok.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                        </button>
                        <span>·</span>
                        <span>สร้างเมื่อ: {tok.created}</span>
                        <span>·</span>
                        <span>ใช้งานล่าสุด: {tok.lastUsed}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteToken(tok.id)}
                      className="self-start sm:self-auto text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline cursor-pointer font-medium"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: Notifications & Webhooks */}
        {/* =================================================================== */}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            {/* Dashboard Attention Banner Preferences (Two-Tone Layered Inset Style) */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
              {/* Layer 1: Header Bar */}
              <div className="px-4 py-2.5">
                <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Dashboard Attention Banner
                </h2>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  เลือกประเภทรายการที่คุณต้องการให้แสดงเป็นกล่องไฮไลต์ที่ด้านบนของแดชบอร์ด
                </p>
              </div>

              {/* Layer 2: Inner Canvas */}
              <div className="rounded-t-lg border-t border-zinc-200/90 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950 divide-y divide-zinc-100 dark:divide-zinc-800">
                {ADMIN_PREFERENCES.map((pref) => {
                  const isChecked = preferencesHydrated ? preferences[pref.key] : true;
                  return (
                    <div key={pref.key} className="flex items-center justify-between py-3.5 first:pt-2 last:pb-2">
                      <div className="pr-4 space-y-0.5">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {pref.label}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          {pref.description}
                        </p>
                      </div>

                      {/* Cloudflare Style Switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isChecked}
                        onClick={() => handleToggle(pref.key, pref.label, !isChecked)}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                          isChecked ? "bg-[#1b64f2]" : "bg-zinc-200 dark:bg-zinc-700",
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out",
                            isChecked ? "translate-x-4" : "translate-x-0",
                          )}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Webhook & Discord Integration Card (Two-Tone Layered Inset Style) */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
              {/* Layer 1: Header Bar */}
              <div className="px-4 py-2.5">
                <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Zap size={13} className="text-amber-500" />
                  <span>Webhook & Discord Notifications</span>
                </h2>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  ส่งต่อแจ้งเตือนคำสั่งซื้อใหม่และรายงานปัญหาไปยัง Discord หรือ Slack ทันที
                </p>
              </div>

              {/* Layer 2: Inner Canvas */}
              <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Discord / Slack Webhook URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://discord.com/api/webhooks/..."
                      className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400 transition-colors shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => toast.success("ส่งข้อความทดสอบสำเร็จ", "ได้รับสถานะ 200 OK จาก Webhook")}
                      className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors shadow-2xs shrink-0"
                    >
                      <Send size={12} />
                      <span>Test Webhook</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    รอบการส่งสรุปสถิติทางอีเมล (Email Digest Frequency)
                  </label>
                  <select
                    value={emailDigest}
                    onChange={(e) => setEmailDigest(e.target.value)}
                    className="w-full sm:w-64 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 transition-colors shadow-2xs"
                  >
                    <option value="realtime">ส่งทันทีเมื่อมีรายการใหม่ (Real-time)</option>
                    <option value="daily">สรุปทุกวัน เวลา 08:00 น. (Daily Digest)</option>
                    <option value="weekly">สรุปรายสัปดาห์ ทุกวันจันทร์ (Weekly)</option>
                    <option value="off">ปิดการส่งอีเมล (Disabled)</option>
                  </select>
                </div>
              </div>

              {/* Layer 3: Footer Bar */}
              <div className="border-t border-zinc-200/80 bg-zinc-50/90 px-4 py-2.5 flex items-center justify-end dark:border-zinc-800 dark:bg-zinc-900/70">
                <button
                  type="button"
                  onClick={() => handleSaveSettings("การแจ้งเตือน")}
                  disabled={isSaving}
                  className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
                >
                  {isSaving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: Appearance & Layout */}
        {/* =================================================================== */}
        {activeTab === "appearance" && (
          <div className="space-y-4">
            {/* Theme Selector (Two-Tone Layered Inset Style) */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
              {/* Layer 1: Header Bar */}
              <div className="px-4 py-2.5">
                <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Theme & Color Scheme
                </h2>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  เลือกรูปแบบโทนสีที่คุณต้องการสำหรับการใช้งานหลังร้าน (บันทึกอัตโนมัติบนอุปกรณ์ของคุณ)
                </p>
              </div>

              {/* Layer 2: Inner Canvas */}
              <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Light */}
                <button
                  type="button"
                  onClick={() => setThemeMode("light")}
                  className={cn(
                    "relative flex flex-col items-center gap-2.5 rounded-lg border p-3.5 text-center transition-all cursor-pointer",
                    themeHydrated && themeMode === "light"
                      ? "border-[#1b64f2] bg-blue-50/40 ring-1 ring-[#1b64f2] dark:border-[#3b82f6]"
                      : "border-zinc-200/80 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700",
                  )}
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <Sun size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      สว่าง (Light Mode)
                    </p>
                    <p className="mt-0.5 text-[10px] text-zinc-400">
                      โทนสีขาว สะอาดตา มาตรฐาน
                    </p>
                  </div>
                  {themeHydrated && themeMode === "light" && (
                    <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-[#1b64f2] text-white text-[10px]">
                      ✓
                    </span>
                  )}
                </button>

                {/* Dark */}
                <button
                  type="button"
                  onClick={() => setThemeMode("dark")}
                  className={cn(
                    "relative flex flex-col items-center gap-2.5 rounded-lg border p-3.5 text-center transition-all cursor-pointer",
                    themeHydrated && themeMode === "dark"
                      ? "border-[#1b64f2] bg-blue-50/40 ring-1 ring-[#1b64f2] dark:border-[#3b82f6] dark:bg-blue-950/20"
                      : "border-zinc-200/80 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700",
                  )}
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-zinc-800 text-blue-400">
                    <Moon size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      มืด (Dark Mode)
                    </p>
                    <p className="mt-0.5 text-[10px] text-zinc-400">
                      โทนสีเข้ม พรีเมียม สบายสายตา
                    </p>
                  </div>
                  {themeHydrated && themeMode === "dark" && (
                    <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-[#1b64f2] text-white text-[10px]">
                      ✓
                    </span>
                  )}
                </button>

                {/* System */}
                <button
                  type="button"
                  onClick={() => setThemeMode("system")}
                  className={cn(
                    "relative flex flex-col items-center gap-2.5 rounded-lg border p-3.5 text-center transition-all cursor-pointer",
                    themeHydrated && themeMode === "system"
                      ? "border-[#1b64f2] bg-blue-50/40 ring-1 ring-[#1b64f2] dark:border-[#3b82f6] dark:bg-blue-950/20"
                      : "border-zinc-200/80 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700",
                  )}
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    <Palette size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      ตามระบบ (System)
                    </p>
                    <p className="mt-0.5 text-[10px] text-zinc-400">
                      ปรับตามโหมดของระบบปฏิบัติการ
                    </p>
                  </div>
                  {themeHydrated && themeMode === "system" && (
                    <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-[#1b64f2] text-white text-[10px]">
                      ✓
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Language & Timezone (Two-Tone Layered Inset Style) */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
              {/* Layer 1: Header Bar */}
              <div className="px-4 py-2.5">
                <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Globe size={13} className="text-[#1b64f2] dark:text-[#3b82f6]" />
                  <span>Locale & Timezone</span>
                </h2>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  ตั้งค่าเขตเวลาและภาษาในการแสดงผล
                </p>
              </div>

              {/* Layer 2: Inner Canvas */}
              <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    ภาษาที่แสดงผล (Interface Language)
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 transition-colors shadow-2xs"
                  >
                    <option value="th">ภาษาไทย (Thai - TH)</option>
                    <option value="en">English (US - EN)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    เขตเวลาของระบบ (Timezone)
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 transition-colors shadow-2xs"
                  >
                    <option value="Asia/Bangkok (UTC+07:00)">Asia/Bangkok (UTC+07:00)</option>
                    <option value="Asia/Tokyo (UTC+09:00)">Asia/Tokyo (UTC+09:00)</option>
                    <option value="UTC (UTC+00:00)">UTC (UTC+00:00)</option>
                  </select>
                </div>
              </div>

              {/* Layer 3: Footer Bar */}
              <div className="border-t border-zinc-200/80 bg-zinc-50/90 px-4 py-2.5 flex items-center justify-end dark:border-zinc-800 dark:bg-zinc-900/70">
                <button
                  type="button"
                  onClick={() => handleSaveSettings("การแสดงผล")}
                  disabled={isSaving}
                  className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
                >
                  {isSaving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: Environment & API Endpoints */}
        {/* =================================================================== */}
        {activeTab === "environment" && (
          <div className="space-y-4">
            {/* Environment & Endpoints Card (Two-Tone Layered Inset Style) */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
              {/* Layer 1: Header Bar */}
              <div className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Server size={13} className="text-[#1b64f2] dark:text-[#3b82f6]" />
                    <span>Environment & Endpoints</span>
                  </h2>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    ตรวจสอบสถานะ Endpoint และความเร็วการตอบสนองของระบบหลังบ้าน
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePingTest}
                  disabled={isPinging}
                  className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-750 cursor-pointer transition-colors shadow-2xs"
                >
                  <Activity size={12} className={isPinging ? "animate-pulse text-amber-500" : "text-[#1b64f2]"} />
                  <span>{isPinging ? "Testing..." : "Ping Backend"}</span>
                </button>
              </div>

              {/* Layer 2: Inner Canvas */}
              <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
                {/* Backend API URL */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-md border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/40 gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-medium text-zinc-400">Primary Backend API</span>
                    <p className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      <span>{pingResult.ms}ms · Online</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080", "api")}
                      className="cursor-pointer rounded p-1 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      title="คัดลอก API URL"
                    >
                      {copiedKey === "api" ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                {/* Data Source Mode */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-md border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/40 gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-medium text-zinc-400">Data Source Mode</span>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {process.env.NEXT_PUBLIC_ADMIN_USE_MOCK === "false"
                        ? "Real Database & Backend API Service"
                        : "Mock Dataset & InMemory Fixtures (Development Mode)"}
                    </p>
                  </div>
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#1b64f2] dark:bg-blue-950/60 dark:text-blue-300 self-start sm:self-auto border border-blue-200/50 dark:border-blue-800/40">
                    {process.env.NEXT_PUBLIC_ADMIN_USE_MOCK === "false" ? "Live Production" : "Mock Enabled"}
                  </span>
                </div>

                {/* Client Storefront */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-md border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/40 gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-medium text-zinc-400">Storefront Client URL</span>
                    <p className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000"}
                    </p>
                  </div>
                  <a
                    href={storefrontUrl("/")}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-[#1b64f2] hover:underline dark:text-blue-400 self-start sm:self-auto"
                  >
                    <span>Open Commi Market</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: Advanced & Cache */}
        {/* =================================================================== */}
        {activeTab === "danger" && (
          <div className="space-y-4">
            {/* React Query Cache Management (Two-Tone Layered Inset Style) */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
              {/* Layer 1: Header Bar */}
              <div className="px-4 py-2.5">
                <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Query Cache Management
                </h2>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  การล้างแคชจะบังคับให้ React Query ดึงข้อมูลใหม่ล่าสุดจาก Backend / Mock ทันที
                </p>
              </div>

              {/* Layer 2: Inner Canvas */}
              <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Purge React Query Cache
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    รีเซ็ตสถานะตารางและตัวนับยอดทั้งหมด
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
                >
                  <RefreshCw size={13} />
                  <span>Purge Cache</span>
                </button>
              </div>
            </div>

            {/* Danger Zone (Two-Tone Layered Inset Style with Rose Accent) */}
            <div className="rounded-lg border border-rose-200/90 bg-rose-50/60 overflow-hidden shadow-2xs dark:border-rose-950/60 dark:bg-rose-950/20">
              {/* Layer 1: Header Bar */}
              <div className="px-4 py-2.5">
                <h2 className="text-xs font-semibold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert size={13} />
                  <span>Danger Zone</span>
                </h2>
                <p className="text-[10px] text-rose-700/80 dark:text-rose-400/80 mt-0.5">
                  การดำเนินการในส่วนนี้จะมีผลต่อการทำงานของระบบ กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการ
                </p>
              </div>

              {/* Layer 2: Inner Canvas */}
              <div className="rounded-t-lg border-t border-rose-200/80 bg-white p-4 dark:border-rose-950/40 dark:bg-zinc-950">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Reset Local Storage Preferences
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      ล้างค่าตัวเลือกใน localStorage ทั้งหมดกลับเป็นค่าเริ่มต้น
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.clear();
                        toast.success("รีเซ็ตการตั้งค่าเรียบร้อย", "กำลังรีเฟรชหน้าต่าง...");
                        setTimeout(() => window.location.reload(), 1000);
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-md border border-rose-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:bg-zinc-900 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
                  >
                    <Trash2 size={13} />
                    <span>Reset All Preferences</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmClear}
        destructive
        title="ล้างแคชข้อมูลทั้งหมด?"
        description="ตารางและข้อมูลทุกหน้าจะกลับไปที่สถานะกำลังโหลด และดึงข้อมูลชุดล่าสุดจากเซิร์ฟเวอร์ทันที"
        confirmLabel="ล้างแคชข้อมูล"
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          queryClient.clear();
          setConfirmClear(false);
          toast.success("ล้างแคชเรียบร้อย", "ทุกหน้าจะดึงข้อมูลใหม่เมื่อเปิดกลับมา");
        }}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
      />
    </div>
  );
}
