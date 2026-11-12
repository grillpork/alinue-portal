export default function SettingsCard({ title, description, children, footer }) {
  return (
    <section className="rounded-lg border border-zinc-200/80 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <header>
        <h2 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        )}
      </header>
      <div className="mt-3">{children}</div>
      {footer && (
        <footer className="mt-4 border-t border-zinc-100 pt-3 text-[11px] text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
          {footer}
        </footer>
      )}
    </section>
  );
}
