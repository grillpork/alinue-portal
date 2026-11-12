import { Search, X } from "lucide-react";
import { cn } from "@/utils/cn";

export default function SearchInput({
  value,
  onChange,
  placeholder = "ค้นหา...",
  className = "",
}) {
  return (
    <div className={cn("relative flex-1 sm:max-w-xs", className)}>
      <Search
        size={15}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-8 w-full rounded-md border border-zinc-200/90 bg-white pr-8 pl-8 text-xs text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-[#1b64f2] focus:ring-2 focus:ring-[#1b64f2]/15 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="ล้างคำค้นหา"
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
