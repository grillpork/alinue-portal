"use client";

import { Suspense, useState } from "react";
import {
  ChevronDown,
  FolderTree,
  Layers,
  Pencil,
  Plus,
  Tags,
  Trash2,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AdminTableSkeleton from "@/components/shared/AdminTableSkeleton";
import CategoryFormModal from "@/components/categories/CategoryFormModal";
import { useCategories, useCategoryMutations } from "@/hooks/useAdminData";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/utils/cn";

const errText = (err) =>
  err?.error || err?.message || "บันทึกไม่สำเร็จ กรุณาลองใหม่";

function CountPill({ value, label }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200/90 bg-zinc-100/80 px-2 py-0.5 text-[11px] font-semibold text-zinc-600 tabular-nums dark:border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-300">
      {value.toLocaleString()} {label}
    </span>
  );
}

function SubCategoryRow({ sub, categoryId, onEdit, onDelete }) {
  const blocked = sub.productCount > 0;
  return (
    <div className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
          {sub.name}
        </p>
        <p className="truncate font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
          /{sub.slug}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <CountPill value={sub.productCount} label="สินค้า" />
        <button
          type="button"
          onClick={() => onEdit(sub)}
          aria-label={`แก้ไข ${sub.name}`}
          className="cursor-pointer rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          disabled={blocked}
          title={
            blocked
              ? "มีสินค้าอยู่ในหมวดนี้ — ย้าย/ลบสินค้าก่อน"
              : "ลบหมวดหมู่ย่อย"
          }
          onClick={() => onDelete(sub)}
          aria-label={`ลบ ${sub.name}`}
          className="cursor-pointer rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-rose-500/10"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function CategoryCard({ category, expanded, onToggle, handlers }) {
  const { onEdit, onDelete, onEditSub, onDeleteSub, onCreateSub } = handlers;
  const blocked = category.productCount > 0;
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50/90 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/70">
      {/* Layer 1: Header / Category Info (Tinted Gray Background) */}
      <div className="flex items-start justify-between gap-3 p-3.5 sm:p-4">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left"
        >
          {category.imageUrl || category.image ? (
            <div className="mt-0.5 size-10 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 shadow-2xs">
              <img
                src={category.imageUrl || category.image}
                alt={category.name}
                className="size-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          ) : (
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-purple-200/60 bg-purple-50 text-purple-600 dark:border-purple-800/40 dark:bg-purple-500/10 dark:text-purple-400">
              <Tags size={16} />
            </span>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-50">
                {category.name}
              </h3>
              <ChevronDown
                size={14}
                className={cn(
                  "shrink-0 text-zinc-400 transition-transform duration-200",
                  expanded && "rotate-180 text-zinc-700 dark:text-zinc-200",
                )}
              />
            </div>
            <p className="truncate font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
              /{category.slug}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <CountPill value={category.productCount} label="สินค้า" />
              <CountPill
                value={category.subCategories?.length ?? 0}
                label="หมวดย่อย"
              />
            </div>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onCreateSub(category)}
            className="cursor-pointer rounded-md border border-purple-200/80 bg-purple-50/70 px-2.5 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-800/50 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60 transition-colors"
          >
            + หมวดย่อย
          </button>
          <button
            type="button"
            onClick={() => onEdit(category)}
            aria-label={`แก้ไข ${category.name}`}
            className="cursor-pointer rounded-md p-1.5 text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            disabled={blocked}
            title={
              blocked
                ? "มีสินค้าอยู่ในหมวดนี้ — ย้าย/ลบสินค้าก่อน"
                : "ลบหมวดหมู่"
            }
            onClick={() => onDelete(category)}
            aria-label={`ลบ ${category.name}`}
            className="cursor-pointer rounded-md p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Layer 2: Inner Canvas for Subcategories (Crisp White with Rounded Top & Top Border) */}
      {expanded && (
        <div className="rounded-t-lg border-t border-zinc-200/90 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          {category.subCategories?.length ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
              {category.subCategories.map((sub) => (
                <SubCategoryRow
                  key={sub.id}
                  sub={sub}
                  categoryId={category.id}
                  onEdit={(s) => onEditSub(category, s)}
                  onDelete={(s) => onDeleteSub(category, s)}
                />
              ))}
            </div>
          ) : (
            <p className="px-3 py-3 text-[12px] text-zinc-400 dark:text-zinc-500 text-center">
              ยังไม่มีหมวดหมู่ย่อย — กด “+ หมวดย่อย” เพื่อเพิ่ม
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function CategoriesScreen() {
  const { data, isLoading, isError, error, refetch } = useCategories();
  const m = useCategoryMutations();
  const categories = data ?? [];

  const [collapsed, setCollapsed] = useState(() => new Set());
  const [formTarget, setFormTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const toggle = (id) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const formBusy =
    m.createCategory.isPending ||
    m.updateCategory.isPending ||
    m.createSubCategory.isPending ||
    m.updateSubCategory.isPending;
  const deleteBusy =
    m.deleteCategory.isPending || m.deleteSubCategory.isPending;

  const submitForm = (payload) => {
    const t = formTarget;
    const done = (msg) => {
      toast.success(msg);
      setFormTarget(null);
    };
    const fail = (err) => toast.error("บันทึกไม่สำเร็จ", errText(err));

    if (t.type === "category") {
      if (t.mode === "edit")
        m.updateCategory.mutate(
          { id: t.id, ...payload },
          { onSuccess: () => done("อัปเดตหมวดหมู่แล้ว"), onError: fail },
        );
      else
        m.createCategory.mutate(payload, {
          onSuccess: () => done("เพิ่มหมวดหมู่หลักแล้ว"),
          onError: fail,
        });
    } else {
      if (t.mode === "edit")
        m.updateSubCategory.mutate(
          { categoryId: t.categoryId, subId: t.subId, ...payload },
          { onSuccess: () => done("อัปเดตหมวดหมู่ย่อยแล้ว"), onError: fail },
        );
      else
        m.createSubCategory.mutate(
          { categoryId: t.categoryId, ...payload },
          { onSuccess: () => done("เพิ่มหมวดหมู่ย่อยแล้ว"), onError: fail },
        );
    }
  };

  const confirmDelete = () => {
    const t = deleteTarget;
    const fail = (err) => toast.error("ลบไม่สำเร็จ", errText(err));
    if (t.type === "category") {
      m.deleteCategory.mutate(t.id, {
        onSuccess: () => {
          toast.success("ลบหมวดหมู่แล้ว");
          setDeleteTarget(null);
        },
        onError: (err) => {
          fail(err);
          setDeleteTarget(null);
        },
      });
    } else {
      m.deleteSubCategory.mutate(
        { categoryId: t.categoryId, subId: t.subId },
        {
          onSuccess: () => {
            toast.success("ลบหมวดหมู่ย่อยแล้ว");
            setDeleteTarget(null);
          },
          onError: (err) => {
            fail(err);
            setDeleteTarget(null);
          },
        },
      );
    }
  };

  const handlers = {
    onEdit: (cat) =>
      setFormTarget({
        type: "category",
        mode: "edit",
        id: cat.id,
        initial: cat,
      }),
    onDelete: (cat) =>
      setDeleteTarget({ type: "category", id: cat.id, name: cat.name }),
    onCreateSub: (cat) =>
      setFormTarget({
        type: "sub",
        mode: "create",
        categoryId: cat.id,
        initial: {},
      }),
    onEditSub: (cat, sub) =>
      setFormTarget({
        type: "sub",
        mode: "edit",
        categoryId: cat.id,
        subId: sub.id,
        initial: sub,
      }),
    onDeleteSub: (cat, sub) =>
      setDeleteTarget({
        type: "sub",
        categoryId: cat.id,
        subId: sub.id,
        name: sub.name,
      }),
  };

  const totalSubs = categories.reduce(
    (sum, c) => sum + (c.subCategories?.length ?? 0),
    0,
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="หมวดหมู่สินค้า"
        description="จัดการหมวดหมู่หลักและหมวดหมู่ย่อยที่ศิลปินใช้จัดวางผลงาน"
        actions={
          <Button
            size="sm"
            onClick={() =>
              setFormTarget({ type: "category", mode: "create", initial: {} })
            }
          >
            <Plus size={15} />
            เพิ่มหมวดหมู่หลัก
          </Button>
        }
      />

      {isLoading ? (
        <AdminTableSkeleton rows={4} />
      ) : isError ? (
        <EmptyState
          icon={FolderTree}
          title="โหลดข้อมูลหมวดหมู่ไม่สำเร็จ"
          description={errText(error)}
          action={
            <Button size="sm" variant="secondary" onClick={() => refetch()}>
              ลองใหม่
            </Button>
          }
        />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="ยังไม่มีหมวดหมู่"
          description="เพิ่มหมวดหมู่หลักหมวดแรกเพื่อให้ศิลปินเลือกใช้ตอนลงสินค้า"
          action={
            <Button
              size="sm"
              onClick={() =>
                setFormTarget({ type: "category", mode: "create", initial: {} })
              }
            >
              <Plus size={15} />
              เพิ่มหมวดหมู่หลัก
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex items-center gap-4 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <FolderTree size={14} /> {categories.length} หมวดหมู่หลัก
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers size={14} /> {totalSubs} หมวดหมู่ย่อย
            </span>
          </div>

          <div className="grid gap-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                expanded={!collapsed.has(category.id)}
                onToggle={() => toggle(category.id)}
                handlers={handlers}
              />
            ))}
          </div>
        </>
      )}

      {formTarget && (
        <CategoryFormModal
          key={`${formTarget.type}-${formTarget.mode}-${formTarget.id ?? formTarget.subId ?? "new"}`}
          target={formTarget}
          busy={formBusy}
          onClose={() => setFormTarget(null)}
          onSubmit={submitForm}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        destructive
        busy={deleteBusy}
        title={
          deleteTarget?.type === "sub"
            ? "ลบหมวดหมู่ย่อยนี้?"
            : "ลบหมวดหมู่หลักนี้?"
        }
        description={
          deleteTarget
            ? `“${deleteTarget.name}” จะถูกลบถาวร (ทำได้เฉพาะหมวดที่ไม่มีสินค้าอยู่เท่านั้น)`
            : ""
        }
        confirmLabel="ลบหมวดหมู่"
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <CategoriesScreen />
    </Suspense>
  );
}
