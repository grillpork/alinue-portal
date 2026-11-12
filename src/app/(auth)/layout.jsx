export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 select-none">
      <main className="w-full flex items-center justify-center">
        {children}
      </main>
    </div>
  );
}
