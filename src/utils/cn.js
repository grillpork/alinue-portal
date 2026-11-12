import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes conditionally (cn("a", cond && "b")) */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
