import { Anuphan, Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/QueryProvider";
import { ToastProvider } from "@/components/ui/Toast";

const anuphan = Anuphan({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-anuphan",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Commi Admin | หลังร้านผู้ดูแลระบบ",
  description:
    "ระบบหลังร้านสำหรับจัดการสินค้า คำสั่งซื้อ ครีเอเตอร์ และโพสต์บน Commi",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="th"
      className={`${anuphan.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Apply persisted theme before hydration to prevent a flash of the wrong palette */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const s=localStorage.getItem("commi-admin-theme");const m=JSON.parse(s)?.state?.mode||"system";const d=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}`,
          }}
        />
      </head>
      <body
        className="flex min-h-full flex-col bg-zinc-100 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
        suppressHydrationWarning
      >
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
