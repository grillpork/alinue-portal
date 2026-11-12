import { cn } from "@/utils/cn";

/** Fixed palette; the tint is derived from the label so a row keeps its colour across renders. */
const TINTS = [
  "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
  "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400",
  "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
];

function tintFor(label) {
  let hash = 0;
  for (const char of String(label))
    hash = (hash * 31 + char.codePointAt(0)) % 997;
  return TINTS[hash % TINTS.length];
}

/** Square icon tile used in table rows and list items (replaces avatar images). */
export default function InitialTile({ label, icon: Icon, className = "" }) {
  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
        tintFor(label),
        className,
      )}
      aria-hidden="true"
    >
      {Icon ? (
        <Icon size={15} strokeWidth={2} />
      ) : (
        String(label).slice(0, 2).toUpperCase()
      )}
    </span>
  );
}
