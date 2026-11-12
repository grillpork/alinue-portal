import {
  getStatus,
  TONE_STYLES,
  TONE_OUTLINE_STYLES,
} from "@/lib/statusRegistry";
import { cn } from "@/utils/cn";

/**
 * StatusChip — Pill status badge driven entirely by STATUS_REGISTRY.
 * Matches design with soft filled or outlined pill style and semantic icons.
 *
 * @param {string} status - Key for status (e.g. "pending", "progress", "expired", "submitted", "failed", "success", "review")
 * @param {boolean} showIcon - Whether to display the icon (default true)
 * @param {'soft'|'outline'} variant - Badge style variant ('soft' or 'outline', default 'soft')
 * @param {boolean} useEn - Render English label instead of Thai (default false)
 * @param {'sm'|'md'} size - Size variant (default 'sm')
 * @param {string} className - Additional CSS class names
 */
export default function StatusChip({
  status,
  showIcon = true,
  variant = "soft",
  useEn = false,
  size = "sm",
  className = "",
}) {
  const { labelTh, label, tone, icon: Icon } = getStatus(status);
  const toneStyle =
    variant === "outline" ? TONE_OUTLINE_STYLES[tone] : TONE_STYLES[tone];

  const sizeClasses =
    size === "md"
      ? "px-3.5 py-1.5 text-xs gap-1.5"
      : "px-3 py-1 text-[11px] gap-1.5";

  const isProgress =
    status === "progress" ||
    status === "in_progress" ||
    status === "processing";

  return (
    <span
      title={`${label} · ${labelTh}`}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full font-semibold tracking-tight transition-colors select-none",
        sizeClasses,
        toneStyle || TONE_STYLES.neutral,
        className,
      )}
    >
      {showIcon && Icon && (
        <Icon
          size={size === "md" ? 14 : 12.5}
          strokeWidth={2.2}
          className={cn(
            "shrink-0",
            isProgress && "animate-spin",
            tone === "warning" && !isProgress && "opacity-95",
          )}
        />
      )}
      <span>{useEn ? label : labelTh}</span>
    </span>
  );
}
