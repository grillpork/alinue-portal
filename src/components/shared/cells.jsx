import InitialTile from "@/components/ui/InitialTile";
import StatusChip from "@/components/ui/StatusChip";
import { formatBaht, formatNumber, formatPercent, formatRelativeTime, rateTone } from "@/lib/formatters";
import { cn } from "@/utils/cn";

/**
 * Table cell renderers shared by every admin list.
 * Keeping them here means a product row looks like a user row by construction,
 * and a change to one cell shape updates all four screens at once.
 */

export function NameCell({ label, meta, icon, avatarUrl }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {icon ? (
        <InitialTile label={label} icon={icon} />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={avatarUrl || "/no-image-user-v1.jpg"}
          alt={label}
          onError={(e) => {
            e.currentTarget.src = "/no-image-user-v1.jpg";
          }}
          className="size-8 rounded-lg object-cover shrink-0 shadow-2xs border border-zinc-200/80 dark:border-zinc-750"
        />
      )}
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-zinc-900 dark:text-zinc-50">{label}</p>
        {meta && <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">{meta}</p>}
      </div>
    </div>
  );
}

export function PersonCell({ name, username, avatarUrl }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatarUrl || "/no-image-user-v1.jpg"}
        alt={name}
        onError={(e) => {
          e.currentTarget.src = "/no-image-user-v1.jpg";
        }}
        className="size-6.5 rounded-full object-cover shrink-0 shadow-2xs border border-zinc-200/80 dark:border-zinc-750"
      />
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-zinc-800 dark:text-zinc-200">{name}</p>
        {username && <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">@{username}</p>}
      </div>
    </div>
  );
}

export function MoneyCell({ amount, hint }) {
  return (
    <div className="text-right">
      <p className="text-[13px] font-semibold text-zinc-900 tabular-nums dark:text-zinc-50">{formatBaht(amount)}</p>
      {hint && <p className="text-[11px] text-zinc-400 tabular-nums dark:text-zinc-500">{hint}</p>}
    </div>
  );
}

export function CountCell({ value, suffix }) {
  return (
    <span className="text-[13px] text-zinc-700 tabular-nums dark:text-zinc-300">
      {formatNumber(value)}
      {suffix && <span className="ml-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">{suffix}</span>}
    </span>
  );
}

export function RateCell({ value }) {
  return (
    <span className={cn("text-[13px] font-semibold tabular-nums", rateTone(value))}>{formatPercent(value)}</span>
  );
}

export function TimeCell({ value }) {
  return <span className="text-[12px] whitespace-nowrap text-zinc-500 dark:text-zinc-400">{formatRelativeTime(value)}</span>;
}

export function StatusCell({ status }) {
  return <StatusChip status={status} />;
}

export function MonoCell({ value }) {
  return <span className="font-mono text-[12px] text-zinc-500 dark:text-zinc-400">{value}</span>;
}

export function PaymentChannelCell({ channel }) {
  const norm = String(channel || "").toLowerCase().trim();

  let logoSrc = null;
  let label = channel || "—";

  if (norm.includes("mastercard") || norm === "card") {
    logoSrc = "/mastercard.png";
    label = norm === "card" ? "Mastercard" : channel;
  } else if (norm.includes("apple") || norm.includes("apple pay") || norm.includes("apple-pay")) {
    logoSrc = "/apple-pay.png";
    label = "Apple Pay";
  } else if (norm.includes("paypal")) {
    logoSrc = "/paypal.png";
    label = "PayPal";
  } else if (norm.includes("promptpay") || norm.includes("prompt")) {
    logoSrc = "/promptpay.png";
    label = "PromptPay";
  }

  return (
    <div className="inline-flex items-center gap-2.5">
      {logoSrc ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={logoSrc}
          alt={label}
          className="h-5.5 max-w-9 w-auto object-contain shrink-0"
        />
      ) : (
        <span className="text-[11px] font-mono font-bold text-zinc-400">QR</span>
      )}
      <span className="text-[12px] font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </span>
    </div>
  );
}

