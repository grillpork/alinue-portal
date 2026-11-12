import { cn } from "@/utils/cn";

const VARIANTS = {
  primary: "btn-primary rounded-lg",
  secondary: "btn-secondary rounded-lg",
  ghost:
    "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 rounded-lg",
  danger: "btn-danger rounded-lg",
};

const SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-3.5 text-xs sm:text-sm gap-2",
  lg: "h-10 px-4 text-sm gap-2.5",
};

/** Design-system elevated 3D tactile button */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  as: Component = "button",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <Component
      type={Component === "button" ? type : undefined}
      className={cn(
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
