"use client";

import { Suspense } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  ExternalLink,
  FileText,
  Flag,
  Heart,
  MessageSquare,
  ShieldAlert,
  Trash2,
  Upload,
} from "lucide-react";
import AdminListScreen from "@/components/shared/AdminListScreen";
import AdminTableSkeleton from "@/components/shared/AdminTableSkeleton";
import RowActionsMenu from "@/components/shared/RowActionsMenu";
import {
  CountCell,
  NameCell,
  PersonCell,
  StatusCell,
  TimeCell,
} from "@/components/shared/cells";
import { usePosts } from "@/hooks/useAdminData";
import { statusOptions } from "@/lib/statusRegistry";
import { storefrontUrl } from "@/lib/links";
import { cn } from "@/utils/cn";

const POST_STATUSES = ["published", "draft", "review", "reported"];

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "โพสต์ล่าสุด" },
  { value: "likes:desc", label: "ไลก์สูงสุด" },
  { value: "views:desc", label: "ยอดวิวสูงสุด" },
];

function TwoToneStatCard({ icon: Icon, label, value, hint, hintClass, loading }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70 flex flex-col justify-between">
      {/* Layer 1: Header Bar */}
      <div className="flex items-center gap-2 px-3.5 py-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-zinc-200/80 bg-white text-zinc-600 dark:border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-300 shadow-2xs">
          {Icon ? <Icon size={13} /> : null}
        </span>
        <span className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          {label}
        </span>
      </div>

      {/* Layer 2: Inner Canvas */}
      <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-between flex-1">
        {loading ? (
          <div className="h-7 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        ) : (
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
            {value}
          </p>
        )}

        {hint && !loading && (
          <p className={cn("mt-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500", hintClass)}>
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

function buildColumns({ changeStatus, isPending }) {
  return [
    {
      key: "title",
      header: "โพสต์",
      cell: (post) => (
        <NameCell label={post.title} meta={`#${post.id}`} icon={Eye} />
      ),
      exportValue: (post) => post.title,
    },
    {
      key: "author",
      header: "ผู้โพสต์",
      cell: (post) => (
        <PersonCell name={post.author.name} username={post.author.username} />
      ),
      exportValue: (post) => post.author.username,
    },
    {
      key: "likes",
      header: "ไลก์",
      align: "end",
      cell: (post) => <CountCell value={post.likes} />,
      exportValue: (post) => post.likes,
    },
    {
      key: "comments",
      header: "ความคิดเห็น",
      align: "end",
      className: "hidden lg:table-cell",
      headerClassName: "hidden lg:table-cell",
      cell: (post) => <CountCell value={post.comments} />,
      exportValue: (post) => post.comments,
    },
    {
      key: "views",
      header: "ยอดเข้าชม",
      align: "end",
      className: "hidden xl:table-cell",
      headerClassName: "hidden xl:table-cell",
      cell: (post) => <CountCell value={post.views} />,
      exportValue: (post) => post.views,
    },
    {
      key: "createdAt",
      header: "เมื่อ",
      align: "end",
      className: "hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      cell: (post) => <TimeCell value={post.createdAt} />,
      exportValue: (post) => post.createdAt,
    },
    {
      key: "status",
      header: "สถานะ",
      cell: (post) => <StatusCell status={post.status} />,
      exportValue: (post) => post.status,
    },
    {
      key: "actions",
      header: "",
      align: "end",
      export: false,
      cell: (post) => (
        <RowActionsMenu
          busy={isPending}
          label={`ตัวเลือกของโพสต์ ${post.title}`}
          actions={[
            {
              key: "publish",
              label: "อนุมัติให้เผยแพร่",
              icon: Upload,
              disabled: post.status === "published",
              onSelect: () =>
                changeStatus(post, "published", {
                  successTitle: "เผยแพร่โพสต์แล้ว",
                }),
            },
            {
              key: "open",
              label: "เปิดโพสต์หน้าร้าน",
              icon: ExternalLink,
              onSelect: () =>
                window.open(
                  storefrontUrl(`/posts/${post.id}`),
                  "_blank",
                  "noopener",
                ),
            },
            {
              key: "hide",
              label: "ซ่อนโพสต์จากการละเมิด",
              icon: Trash2,
              tone: "danger",
              confirm: {
                title: "ซ่อนโพสต์นี้ถาวร?",
                description: `“${post.title}” จะถูกนำออกจากฟีดของผู้ติดตามทันที ผู้โพสต์จะได้รับการแจ้งเตือน`,
                confirmLabel: "ซ่อนโพสต์",
              },
              onSelect: () =>
                changeStatus(post, "archived", {
                  successTitle: "ซ่อนโพสต์แล้ว",
                }),
            },
          ]}
        />
      ),
    },
  ];
}

function PostsScreen() {
  return (
    <AdminListScreen
      title="โพสต์ในคอมมูนิตี้"
      description="ตรวจคิวเนื้อหาที่รออนุมัติ และจัดการโพสต์ถูกรายงานจากผู้ใช้"
      collection="posts"
      useCollectionQuery={usePosts}
      searchPlaceholder="ค้นหาหัวข้อหรือผู้โพสต์..."
      statusOptions={statusOptions(POST_STATUSES, { allLabel: "ทุกสถานะ" })}
      sortOptions={SORT_OPTIONS}
      defaultSort="createdAt:desc"
      topContent={({ data, isLoading }) => {
        const rows = data?.rows ?? [];
        const publishedCount = rows.filter((p) => p.status === "published").length;
        const reviewCount = rows.filter((p) => p.status === "review" || p.status === "draft").length;
        const reportedCount = rows.filter((p) => p.status === "reported").length;
        const totalCount = data?.total ?? rows.length;

        return (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            <TwoToneStatCard
              icon={CheckCircle2}
              label="เผยแพร่อยู่ (Published)"
              value={publishedCount}
              hint="ออนไลน์บนฟีดคอมมูนิตี้"
              hintClass="text-emerald-500 font-semibold"
              loading={isLoading}
            />
            <TwoToneStatCard
              icon={AlertTriangle}
              label="รอตรวจสอบ / ฉบับร่าง"
              value={reviewCount}
              hint="รอการตรวจสอบเนื้อหา"
              hintClass="text-amber-500 font-semibold"
              loading={isLoading}
            />
            <TwoToneStatCard
              icon={Flag}
              label="ถูกรายงาน (Reported)"
              value={reportedCount}
              hint="มีผู้ใช้งานร้องเรียน"
              hintClass="text-rose-500 font-semibold"
              loading={isLoading}
            />
            <TwoToneStatCard
              icon={MessageSquare}
              label="โพสต์ทั้งหมด"
              value={totalCount}
              hint="บันทึกในระบบ"
              loading={isLoading}
            />
          </div>
        );
      }}
      columns={buildColumns}
      exportFilename="commi-posts"
      emptyTitle="ไม่พบโพสต์ที่ตรงเงื่อนไข"
      emptyDescription="ลองเปลี่ยนสถานะหรือล้างคำค้นหา"
      minWidth="58rem"
    />
  );
}

export default function PostsPage() {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <PostsScreen />
    </Suspense>
  );
}
