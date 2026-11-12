/** Formatting helpers shared by every admin table, card and chip. */

export function formatBaht(amount) {
  return `฿${Number(amount || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** 12847 -> "12,847" */
export function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

/** 842000 -> "842K" (stat cards keep one readable line) */
export function formatCompact(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

/** 0.982 | 98.2 -> "98.2%" */
export function formatPercent(value, fractionDigits = 1) {
  const num = Number(value || 0);
  const normalized = num <= 1 ? num * 100 : num;
  return `${normalized.toFixed(fractionDigits)}%`;
}

/** Relative time in Thai, used for "Last run" style cells. */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "—";

  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "เมื่อสักครู่";
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชม.ที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  if (days < 30) return `${Math.floor(days / 7)} สัปดาห์ที่แล้ว`;

  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Short English relative time e.g. "9mo ago", "3d ago", "2h ago" */
export function formatCompactRelativeTime(dateInput) {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "—";

  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "just now";
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

/** Fixed calendar date for the page header clock. */
export function formatFullDate(dateInput = new Date()) {
  return new Date(dateInput).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Percentage colouring: green healthy, amber warning, red critical. */
export function rateTone(value) {
  const num = Number(value || 0);
  if (num >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (num >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

/** Trailing window label like Cloudflare's "September 18 - October 18" (th-TH, short months). */
export function formatUsagePeriod(days = 30, endDate = new Date()) {
  const end = new Date(endDate);
  const start = new Date(end.getTime() - days * 86_400_000);
  const fmt = (d) =>
    d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  return `${fmt(start)} – ${fmt(end)}`;
}
