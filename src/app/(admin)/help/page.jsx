"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Code2,
  ExternalLink,
  FileQuestion,
  Headphones,
  Keyboard,
  LifeBuoy,
  Mail,
  MessageCircle,
  MessageSquare,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { storefrontUrl } from "@/lib/links";
import { cn } from "@/utils/cn";

const FAQS = [
  {
    category: "Marketplace & Products",
    questions: [
      {
        q: "การอนุมัติใบสมัครศิลปิน (Creator Applications) มีเกณฑ์อย่างไร?",
        a: "ระบบจะแสดงรายการใบสมัครในหน้า 'ใบสมัครศิลปิน' โดยตรวจสอบชื่อร้าน, ตัวอย่างผลงาน, และช่องทางโซเชียลมีเดีย แอดมินสามารถกด 'อนุมัติ' หรือ 'ปฏิเสธ' พร้อมระบุเหตุผลได้ทันที",
      },
      {
        q: "หากพบสินค้าผิดลิขสิทธิ์หรือละเมิดนโยบายต้องจัดการอย่างไร?",
        a: "สามารถเข้าไปที่หน้า 'รายการถูกรายงาน (Reports)' หรือ 'คลังสินค้า (Products)' เพื่อทำการระงับการมองเห็น (Hide) หรือลบสินค้าออกจากระบบ โดยระบบจะบันทึก Audit Log ไว้อัตโนมัติ",
      },
      {
        q: "การจัดการหมวดหมู่หลักและหมวดหมู่ย่อย (Categories) ทำงานอย่างไร?",
        a: "ไปที่หน้า 'หมวดหมู่สินค้า' แอดมินสามารถสร้างหมวดหมู่หลักพร้อมอัปโหลดรูปภาพด้วย Drag & Drop หรือเพิ่มหมวดหมู่ย่อยในแต่ละหมวดได้โดยไม่ต้องกรอกคำอธิบาย",
      },
    ],
  },
  {
    category: "Financial & Security",
    questions: [
      {
        q: "ขั้นตอนการดำเนินการคิวถอนเงินของศิลปิน (Withdrawals)",
        a: "ไปที่หน้า 'คิวถอนเงินศิลปิน' ตรวจสอบยอดเงินและบัญชีปลายทาง จากนั้นกดอัปเดตสถานะเป็น 'โอนเงินแล้ว' พร้อมแนบเลขอ้างอิงการโอนเงิน",
      },
      {
        q: "การตรวจสอบประวัติการทำงานและสิทธิ์ (Audit Log)",
        a: "ทุกการกระทำที่สำคัญ เช่น การแก้ไขสินค้า, อนุมัติผู้ใช้งาน, หรือการลบข้อมูล จะถูกบันทึกเป็น Audit Event พร้อม IP, User Agent, และสถานะความสำเร็จในหน้า Audit Log",
      },
      {
        q: "กรณีระบบเกิดปัญหา หรือต้องการรีเซ็ตแคชตาราง",
        a: "สามารถไปที่หน้า 'Settings' > แท็บ 'ขั้นสูง & แคช' แล้วกดปุ่ม 'Purge Cache' เพื่อให้ React Query ดึงข้อมูลล่าสุดจาก API ทันที",
      },
    ],
  },
];

const SHORTCUTS = [
  { key: "Ctrl / ⌘ + K", description: "เปิดกล่องค้นหาแบบด่วน (Global Search)" },
  { key: "Esc", description: "ปิดหน้าต่าง Modal / Dialog ที่เปิดอยู่" },
  { key: "Tab", description: "เลื่อนโฟกัสไปยังช่องกรอกหรือปุ่มถัดไป" },
  { key: "Shift + Click", description: "เลือกแถวข้อมูลหลายรายการพร้อมกันในตาราง" },
];

const CONTACT_CHANNELS = [
  {
    icon: MessageSquare,
    title: "Discord Community",
    desc: "ช่องทางพูดคุย ปรึกษาปัญหากับทีมผู้พัฒนาและแอดมิน",
    actionText: "Join Discord",
    href: "https://discord.gg/commi",
    tag: "แนะนำ",
    tagColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60",
  },
  {
    icon: Mail,
    title: "Email Support",
    desc: "ติดต่อทีมงานฝ่ายสนับสนุนทางอีเมล support@commi.market",
    actionText: "Send Email",
    href: "mailto:support@commi.market",
    tag: "24-48 ชม.",
    tagColor: "bg-blue-50 text-[#1b64f2] dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60",
  },
  {
    icon: Code2,
    title: "API & Developer Docs",
    desc: "คู่มือการเชื่อมต่อ REST API, Webhooks และ Schema",
    actionText: "View Documentation",
    href: storefrontUrl("/docs"),
    tag: "v1.0 Live",
    tagColor: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Filter FAQs based on search
  const filteredFaqs = FAQS.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (item) =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  })).filter((category) => category.questions.length > 0);

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-12 select-none">
      {/* 1. Page Header */}
      <PageHeader
        title="ศูนย์ช่วยเหลือ & เอกสาร (Help & Support)"
        description="คู่มือการใช้งานระบบจัดการหลังบ้าน, ช่องทางติดต่อทีมพัฒนา, และคำถามที่พบบ่อย"
        showDate={false}
        actions={
          <div className="flex items-center gap-2">
            <a
              href="https://discord.gg/commi"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer shadow-2xs"
            >
              <MessageSquare size={13} className="text-[#1b64f2]" />
              <span>Discord Support</span>
            </a>

            <a
              href={storefrontUrl("/")}
              target="_blank"
              rel="noreferrer"
              className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
            >
              <BookOpen size={13} />
              <span>หน้าร้านค้า Commi</span>
            </a>
          </div>
        }
      />

      {/* 2. Contact & Support Channels (Two-Tone Layered Inset Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {CONTACT_CHANNELS.map((channel) => {
          const Icon = channel.icon;
          return (
            <div
              key={channel.title}
              className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70 flex flex-col justify-between"
            >
              {/* Layer 1: Header Bar */}
              <div className="px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-md border border-zinc-200/80 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 shadow-2xs">
                    <Icon size={13} />
                  </span>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {channel.title}
                  </span>
                </div>
                <span
                  className={cn(
                    "rounded border px-2 py-0.5 text-[10px] font-semibold",
                    channel.tagColor,
                  )}
                >
                  {channel.tag}
                </span>
              </div>

              {/* Layer 2: Inner Content Canvas */}
              <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-between flex-1 gap-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {channel.desc}
                </p>

                <a
                  href={channel.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors shadow-2xs cursor-pointer"
                >
                  <span>{channel.actionText}</span>
                  <ExternalLink size={12} className="text-zinc-400" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. FAQ Section with Search Box (Two-Tone Layered Inset Style) */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
        {/* Layer 1: Header Bar */}
        <div className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <FileQuestion size={13} className="text-[#1b64f2] dark:text-[#3b82f6]" />
              <span>คำถามที่พบบ่อย (Frequently Asked Questions)</span>
            </h2>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              คำแนะนำและวิธีแก้ไขปัญหาสำหรับการดูแลระบบหลังบ้าน
            </p>
          </div>

          {/* Search FAQ Input */}
          <div className="relative w-full sm:w-64">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาคำถามหรือหัวข้อ..."
              className="w-full rounded-md border border-zinc-200 bg-white pl-7 pr-3 py-1 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400 transition-colors shadow-2xs"
            />
          </div>
        </div>

        {/* Layer 2: Inner Canvas */}
        <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              ไม่พบคำถามที่ตรงกับ "{searchQuery}"
            </div>
          ) : (
            filteredFaqs.map((cat, catIdx) => (
              <div key={cat.category} className="space-y-2">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  {cat.category}
                </span>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200/80 dark:border-zinc-800/80 rounded-md overflow-hidden">
                  {cat.questions.map((item, qIdx) => {
                    const uniqueId = `${catIdx}-${qIdx}`;
                    const isExpanded = expandedFaq === uniqueId;
                    return (
                      <div key={item.q} className="transition-colors">
                        <button
                          type="button"
                          onClick={() => toggleFaq(uniqueId)}
                          className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors"
                        >
                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                            {item.q}
                          </span>
                          {isExpanded ? (
                            <ChevronUp size={14} className="text-zinc-400 shrink-0" />
                          ) : (
                            <ChevronDown size={14} className="text-zinc-400 shrink-0" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-3.5 pb-3 pt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed bg-zinc-50/40 dark:bg-zinc-900/20 border-t border-zinc-100 dark:border-zinc-800">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Keyboard Shortcuts & Quick Operations (Two-Tone Layered Inset Style) */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
        {/* Layer 1: Header Bar */}
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Keyboard size={13} className="text-purple-600 dark:text-purple-400" />
              <span>คีย์ลัดสำหรับผู้ดูแลระบบ (Keyboard Shortcuts)</span>
            </h2>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              เพิ่มความเร็วในการใช้งานด้วยคีย์ลัดมาตรฐาน
            </p>
          </div>
        </div>

        {/* Layer 2: Inner Canvas */}
        <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SHORTCUTS.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between rounded-md border border-zinc-200/80 bg-zinc-50/50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/40"
            >
              <span className="text-xs text-zinc-600 dark:text-zinc-300">
                {sc.description}
              </span>
              <kbd className="rounded border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-mono font-semibold text-zinc-800 shadow-2xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
