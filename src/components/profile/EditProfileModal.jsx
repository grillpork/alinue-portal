"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  Pencil,
  X,
  Upload,
  User,
  Check,
  Globe,
  Briefcase,
  Mail,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { authKeys, useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/utils/cn";

const TIMEZONES = [
  { value: "GMT-8", label: "GMT-8 (Pacific Time)" },
  { value: "GMT-5", label: "GMT-5 (Eastern Time)" },
  { value: "GMT+0", label: "GMT+0 (UTC / London)" },
  { value: "GMT+7", label: "GMT+7 (Asia/Bangkok)" },
  { value: "GMT+8", label: "GMT+8 (Singapore / Beijing)" },
  { value: "GMT+9", label: "GMT+9 (Tokyo / Seoul)" },
];

const SAMPLE_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
];

export default function EditProfileModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

  // Form State (Always guaranteed to be strings)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState("GMT+7");
  const [workingHours, setWorkingHours] = useState("10 AM – 6 PM");
  const [title, setTitle] = useState("Project manager");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [lastUpdated, setLastUpdated] = useState("Dec 24, 2025");
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Sync state safely when user changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const rawName =
        typeof user?.name === "string"
          ? user.name
          : typeof user?.username === "string"
            ? user.username
            : "James Carter";

      const rawEmail =
        typeof user?.email === "string" ? user.email : "jamescarter1930@gmail.com";

      const rawTimezone =
        typeof user?.timezone === "string" ? user.timezone : "GMT+7";

      const rawWorkingHours =
        typeof user?.workingHours === "string"
          ? user.workingHours
          : "10 AM – 6 PM";

      const rawTitle =
        typeof user?.title === "string"
          ? user.title
          : typeof user?.role === "string"
            ? user.role
            : typeof user?.role?.name === "string"
              ? user.role.name
              : "Project manager";

      const rawAvatar =
        typeof user?.avatarUrl === "string"
          ? user.avatarUrl
          : typeof user?.image === "string"
            ? user.image
            : SAMPLE_AVATARS[0];

      const rawLastUpdated =
        typeof user?.lastUpdated === "string" ? user.lastUpdated : "Dec 24, 2025";

      setFullName(rawName);
      setEmail(rawEmail);
      setTimezone(rawTimezone);
      setWorkingHours(rawWorkingHours);
      setTitle(rawTitle);
      setAvatarUrl(rawAvatar);
      setLastUpdated(rawLastUpdated);
      setShowAvatarPicker(false);
    }
  }, [isOpen, user]);

  // Handle Save Profile
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      const updatedUser = {
        ...user,
        name: fullName,
        email: email,
        timezone: timezone,
        workingHours: workingHours,
        title: title,
        avatarUrl: avatarUrl,
        lastUpdated: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };

      // Update cache in React Query so all UI updates instantly
      queryClient.setQueryData(authKeys.currentUser, updatedUser);

      setIsSaving(false);
      toast.success("บันทึกโปรไฟล์เรียบร้อย", `อัปเดตข้อมูล ${fullName} สำเร็จ`);
      onClose();
    }, 400);
  };

  const safeFullName = typeof fullName === "string" ? fullName : "James Carter";
  const safeTitle = typeof title === "string" ? title : "Project manager";
  const safeWorkingHours =
    typeof workingHours === "string" ? workingHours : "10 AM – 6 PM";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container (Two-Tone Layered Inset Style) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            className="relative w-full max-w-xl rounded-2xl bg-zinc-50/95 dark:bg-zinc-900/80 shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-10"
          >
            {/* Layer 1: Header Bar (Tinted Gray Background) */}
            <div className="flex items-center justify-between px-6 pt-4 pb-3">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Edit your profile
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Layer 2: Inner Canvas (Crisp White Background with Rounded Top & Top Border) */}
            <div className="rounded-t-xl border-t border-zinc-200/90 bg-white px-6 py-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="grid grid-cols-1 md:grid-cols-[1.2fr_auto_1fr] gap-6 items-start">
                {/* Left Column: Form Fields */}
                <div className="space-y-3.5">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={safeFullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 font-medium placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-750 dark:bg-zinc-800/60 dark:text-zinc-100 dark:focus:border-zinc-400 transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 font-medium placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-750 dark:bg-zinc-800/60 dark:text-zinc-100 dark:focus:border-zinc-400 transition-colors"
                    />
                  </div>

                  {/* Timezone & Working Hours in one row */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Timezone */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Timezone
                      </label>
                      <div className="relative">
                        <select
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-750 dark:bg-zinc-800/60 dark:text-zinc-100 pr-7 transition-colors"
                        >
                          {TIMEZONES.map((tz) => (
                            <option key={tz.value} value={tz.value}>
                              {tz.value}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px]">
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* Working Hours */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Working hours
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={safeWorkingHours}
                          onChange={(e) => setWorkingHours(e.target.value)}
                          placeholder="10 AM – 6 PM"
                          className="w-full rounded-xl border border-zinc-200 bg-white pl-3 pr-8 py-2 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-750 dark:bg-zinc-800/60 dark:text-zinc-100 transition-colors"
                        />
                        <Clock
                          size={13}
                          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Title
                    </label>
                    <input
                      type="text"
                      value={safeTitle}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Project manager"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 font-medium placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-750 dark:bg-zinc-800/60 dark:text-zinc-100 dark:focus:border-zinc-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Middle Vertical Dashed Divider */}
                <div className="hidden md:block w-px h-full border-l border-dashed border-zinc-200 dark:border-zinc-800 self-stretch my-2" />

                {/* Right Column: Live Preview */}
                <div className="flex flex-col items-center justify-center pt-2">
                  <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-3">
                    Preview
                  </span>

                  {/* Avatar Container with Edit Pencil Badge */}
                  <div className="relative">
                    <div className="size-28 rounded-full overflow-hidden border-2 border-amber-100 dark:border-zinc-700 bg-amber-50 shadow-sm flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatarUrl || "/no-image-user-v1.jpg"}
                        alt={safeFullName}
                        className="size-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/no-image-user-v1.jpg";
                        }}
                      />
                    </div>

                    {/* Edit Pencil Button */}
                    <button
                      type="button"
                      onClick={() => setShowAvatarPicker((prev) => !prev)}
                      title="Change avatar photo"
                      className="absolute bottom-0 right-0 flex size-7 cursor-pointer items-center justify-center rounded-full bg-white text-zinc-700 shadow-md border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 transition-all hover:scale-105"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>

                  {/* Avatar Selector Dropdown */}
                  {showAvatarPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-center gap-1.5 p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                    >
                      {SAMPLE_AVATARS.map((src, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAvatarUrl(src);
                            setShowAvatarPicker(false);
                          }}
                          className={cn(
                            "size-6 rounded-full overflow-hidden ring-1 transition-all cursor-pointer",
                            avatarUrl === src
                              ? "ring-2 ring-blue-500 scale-110"
                              : "ring-transparent hover:opacity-80",
                          )}
                        >
                          <img src={src} alt="avatar option" className="size-full object-cover" />
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {/* Live Name Preview */}
                  <h3 className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-100 text-center truncate max-w-[170px]">
                    {safeFullName}
                  </h3>

                  {/* Live Title Preview */}
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 text-center truncate max-w-[170px]">
                    {safeTitle}
                  </p>

                  {/* Working Hours Pill */}
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300">
                    <Clock size={12} className="text-zinc-400" />
                    <span>{safeWorkingHours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Layer 3: Footer Bar (Tinted Gray Background) */}
            <div className="flex items-center justify-between border-t border-zinc-200/80 bg-zinc-50/95 px-6 py-3.5 dark:border-zinc-800 dark:bg-zinc-900/80">
              <span className="text-[11px] text-zinc-400">
                Last updated: {lastUpdated}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-750 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-full bg-zinc-900 px-5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
