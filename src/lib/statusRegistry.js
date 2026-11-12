/**
 * STATUS_REGISTRY — single source of truth for every status shown in the admin.
 * Adding a status here makes it render consistently in chips, filters and tables;
 * no page hard-codes a status colour or icon.
 */
import {
  Circle,
  CircleAlert,
  CircleCheck,
  CircleCheckBig,
  CircleDashed,
  CircleDot,
  CircleSlash,
  CircleX,
  Clock,
  Search,
  Send,
  TriangleAlert,
  Undo2,
} from "lucide-react";

export function ClockFading(props) {
  return <Clock className="animate-pulse opacity-90 shrink-0" {...props} />;
}

export const STATUS_REGISTRY = {
  // Product / post lifecycle
  active: {
    label: "Active",
    labelTh: "เผยแพร่",
    tone: "success",
    icon: CircleCheck,
  },
  published: {
    label: "Published",
    labelTh: "เผยแพร่",
    tone: "success",
    icon: CircleCheck,
  },
  succeeded: {
    label: "Success",
    labelTh: "สำเร็จ",
    tone: "success",
    icon: CircleCheck,
  },
  success: {
    label: "Success",
    labelTh: "สำเร็จ",
    tone: "success",
    icon: CircleCheck,
  },
  draft: {
    label: "Draft",
    labelTh: "ฉบับร่าง",
    tone: "neutral",
    icon: Circle,
  },
  paused: {
    label: "Paused",
    labelTh: "พักชั่วคราว",
    tone: "warning",
    icon: ClockFading,
  },
  scheduled: {
    label: "Scheduled",
    labelTh: "ตั้งเวลาไว้",
    tone: "info",
    icon: Clock,
  },
  pending: {
    label: "Pending",
    labelTh: "รอดำเนินการ",
    tone: "warning",
    icon: TriangleAlert,
  },
  progress: {
    label: "Progress",
    labelTh: "กำลังดำเนินการ",
    tone: "info",
    icon: CircleDashed,
  },
  in_progress: {
    label: "Progress",
    labelTh: "กำลังดำเนินการ",
    tone: "info",
    icon: CircleDashed,
  },
  processing: {
    label: "Progress",
    labelTh: "กำลังดำเนินการ",
    tone: "info",
    icon: CircleDashed,
  },
  review: {
    label: "In Review",
    labelTh: "รอตรวจสอบ",
    tone: "orange",
    icon: Search,
  },
  in_review: {
    label: "In Review",
    labelTh: "รอตรวจสอบ",
    tone: "orange",
    icon: Search,
  },
  submitted: {
    label: "Submitted",
    labelTh: "ส่งแล้ว",
    tone: "purple",
    icon: Send,
  },
  failed: {
    label: "Failed",
    labelTh: "ล้มเหลว",
    tone: "danger",
    icon: CircleX,
  },
  reported: {
    label: "Reported",
    labelTh: "ถูกรายงาน",
    tone: "danger",
    icon: CircleAlert,
  },
  expired: {
    label: "Expire",
    labelTh: "หมดอายุ",
    tone: "neutral",
    icon: Clock,
  },
  expire: {
    label: "Expire",
    labelTh: "หมดอายุ",
    tone: "neutral",
    icon: Clock,
  },
  canceled: {
    label: "Canceled",
    labelTh: "ยกเลิก",
    tone: "danger",
    icon: CircleX,
  },
  suspended: {
    label: "Suspended",
    labelTh: "ระงับบัญชี",
    tone: "danger",
    icon: CircleAlert,
  },
  inactive: {
    label: "Inactive",
    labelTh: "ไม่พร้อมใช้งาน / พักงาน",
    tone: "muted",
    icon: CircleSlash,
  },
  on_leave: {
    label: "On Leave",
    labelTh: "ลาพักงาน",
    tone: "warning",
    icon: Clock,
  },
  archived: {
    label: "Archived",
    labelTh: "เก็บถาวร",
    tone: "muted",
    icon: CircleSlash,
  },
  // Creator application lifecycle
  approved: {
    label: "Success",
    labelTh: "อนุมัติแล้ว",
    tone: "success",
    icon: CircleCheck,
  },
  rejected: {
    label: "Failed",
    labelTh: "ปฏิเสธ",
    tone: "danger",
    icon: CircleX,
  },
  // Dispute / refund lifecycle
  refund_requested: {
    label: "Refund Requested",
    labelTh: "ขอคืนเงิน",
    tone: "warning",
    icon: TriangleAlert,
  },
  refunded: {
    label: "Refunded",
    labelTh: "คืนเงินแล้ว",
    tone: "danger",
    icon: Undo2,
  },
  // Report (moderation) lifecycle
  action_taken: {
    label: "Action Taken",
    labelTh: "ดำเนินการแล้ว",
    tone: "success",
    icon: CircleCheckBig,
  },
  dismissed: {
    label: "Dismissed",
    labelTh: "ตีกลับ",
    tone: "muted",
    icon: CircleSlash,
  },
};

/**
 * Tone styles — soft filled style (matching reference image)
 */
export const TONE_STYLES = {
  success:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  warning:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  orange:
    "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  danger:
    "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  info:
    "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
  purple:
    "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  neutral:
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  muted:
    "bg-zinc-50 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500",
};

/**
 * Tone outline styles — bordered pill style (matching reference image)
 */
export const TONE_OUTLINE_STYLES = {
  success:
    "border border-emerald-500/80 bg-emerald-50/20 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/5 dark:text-emerald-400",
  warning:
    "border border-amber-400/90 bg-amber-50/20 text-amber-600 dark:border-amber-500/40 dark:bg-amber-500/5 dark:text-amber-400",
  orange:
    "border border-orange-400/90 bg-orange-50/20 text-orange-600 dark:border-orange-500/40 dark:bg-orange-500/5 dark:text-orange-400",
  danger:
    "border border-rose-300 bg-rose-50/20 text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/5 dark:text-rose-400",
  info:
    "border border-sky-400 bg-sky-50/20 text-sky-600 dark:border-sky-500/40 dark:bg-sky-500/5 dark:text-sky-400",
  purple:
    "border border-purple-400 bg-purple-50/20 text-purple-600 dark:border-purple-500/40 dark:bg-purple-500/5 dark:text-purple-400",
  neutral:
    "border border-zinc-400 bg-zinc-50/40 text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-300",
  muted:
    "border border-zinc-300 bg-zinc-50/30 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-500",
};

export const TONE_DOT_STYLES = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  orange: "bg-orange-500",
  danger: "bg-rose-500",
  info: "bg-sky-500",
  purple: "bg-purple-500",
  neutral: "bg-zinc-400",
  muted: "bg-zinc-300 dark:bg-zinc-600",
};

export function getStatus(code) {
  return (
    STATUS_REGISTRY[code] || {
      label: code,
      labelTh: code,
      tone: "neutral",
      icon: CircleDot,
    }
  );
}

/** Build <select> options from a subset of registry keys. */
export function statusOptions(keys, { allLabel = "ทุกสถานะ" } = {}) {
  return [
    { value: "all", label: allLabel },
    ...keys.map((key) => ({
      value: key,
      label: `${getStatus(key).labelTh} · ${getStatus(key).label}`,
    })),
  ];
}
