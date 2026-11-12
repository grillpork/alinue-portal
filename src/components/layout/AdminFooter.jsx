"use client";

import Link from "next/link";
import { cn } from "@/utils/cn";

export default function AdminFooter({ className = "" }) {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: "Support", href: "/help" },
    { label: "System Status", href: "/support-metrics" },
    { label: "Careers", href: "#" },
    { label: "Terms of Use", href: "#" },
    { label: "Report Security Issues", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ];

  return (
    <footer
      className={cn(
        "mt-auto border-t border-zinc-200/80 bg-white/60 px-6 py-3.5 text-xs text-zinc-500 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 text-[11px] sm:text-xs">
        {footerLinks.map((link, idx) => (
          <div key={link.label} className="flex items-center gap-3">
            <Link
              href={link.href}
              className="hover:text-zinc-900 hover:underline dark:hover:text-zinc-100 transition-colors"
            >
              {link.label}
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700 select-none">|</span>
          </div>
        ))}

        {/* Cookie Preferences with Privacy Toggle Icon */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                alert("การตั้งค่าคุกกี้ (Cookie Preferences): ระบบบันทึกความยินยอมของท่านเรียบร้อยแล้ว");
              }
            }}
            className="inline-flex items-center gap-1.5 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            {/* Standard Privacy / Cookie Icon [✓ ✕] */}
            <svg
              className="h-3 w-6 text-blue-600 dark:text-blue-500 shrink-0"
              viewBox="0 0 30 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="0.5"
                y="0.5"
                width="29"
                height="13"
                rx="6.5"
                fill="currentColor"
                stroke="currentColor"
              />
              <path
                d="M7 7.5L9.5 10L14.5 4.5"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.5 4.5L24.5 9.5M24.5 4.5L19.5 9.5"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <span>Cookie Preferences</span>
          </button>
          <span className="text-zinc-300 dark:text-zinc-700 select-none">|</span>
        </div>

        {/* Copyright */}
        <span className="text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
          © {currentYear} Commi, Inc.
        </span>
      </div>
    </footer>
  );
}
