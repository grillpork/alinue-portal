import Link from "next/link";
import { cn } from "@/utils/cn";
import Skeleton from "./Skeleton";

/**
 * StatCard — one metric per card: icon tile, label, value, optional hint.
 * Values use tabular-nums so columns of cards stay visually aligned.
 */
export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  hintClass,
  href,
  loading = false,
}) {
  const body = (
    <>
      <div className="flex items-center gap-2">
        <span className="inline-flex size-6 items-center justify-center rounded-md bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {Icon ? <Icon size={13} /> : null}
        </span>
        <span className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
      </div>

      {loading ? (
        <Skeleton className="mt-3 h-8 w-24" />
      ) : (
        <p className="mt-2 text-[28px] leading-none font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-zinc-50">
          {value}
        </p>
      )}

      {hint && !loading && (
        <p
          className={cn(
            "mt-2 text-[11px] font-medium text-zinc-400 dark:text-zinc-500",
            hintClass,
          )}
        >
          {hint}
        </p>
      )}
    </>
  );

  const shell =
    "rounded-lg border border-zinc-200/80 bg-white p-4 transition-colors dark:border-zinc-800 dark:bg-zinc-900";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          shell,
          "block hover:border-zinc-300 dark:hover:border-zinc-700",
        )}
      >
        {body}
      </Link>
    );
  }

  return <div className={shell}>{body}</div>;
}
