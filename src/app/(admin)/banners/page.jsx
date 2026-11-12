"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  UploadCloud,
  Link2,
  ExternalLink,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Eye,
  MousePointerClick,
  Sparkles,
  AlertCircle,
  X,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusChip from "@/components/ui/StatusChip";
import { toast } from "@/components/ui/Toast";
import {
  useAdminHeroBanners,
  useAdminBannersList,
  useBannerMutations,
} from "@/hooks/useAdminBanners";
import { uploadBannerImage } from "@/services/banners";
import { cn } from "@/utils/cn";

function BannersContent() {
  const { data: heroData, isLoading: isHeroLoading, refetch: refetchHero } = useAdminHeroBanners();
  const { data: listData, isLoading: isListLoading, refetch: refetchList } = useAdminBannersList();
  const { saveHero, create, update, toggleStatus, remove } = useBannerMutations();

  // Form states for Hero Banners
  const [mainTitle, setMainTitle] = useState("");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [mainTargetUrl, setMainTargetUrl] = useState("");
  const [mainImgError, setMainImgError] = useState(false);
  const [isUploadingMain, setIsUploadingMain] = useState(false);

  const [secondaryTitle, setSecondaryTitle] = useState("");
  const [secondaryImageUrl, setSecondaryImageUrl] = useState("");
  const [secondaryTargetUrl, setSecondaryTargetUrl] = useState("");
  const [secondaryImgError, setSecondaryImgError] = useState(false);
  const [isUploadingSecondary, setIsUploadingSecondary] = useState(false);

  const [isSavingHero, setIsSavingHero] = useState(false);

  // Modal & Table states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const mainFileInputRef = useRef(null);
  const secondaryFileInputRef = useRef(null);

  // Sync hero data from API
  useEffect(() => {
    if (heroData?.main) {
      setMainTitle(heroData.main.title || "");
      setMainImageUrl(heroData.main.imageUrl || heroData.main.image || "");
      setMainTargetUrl(heroData.main.targetUrl || heroData.main.slug || "");
      setMainImgError(false);
    }
    if (heroData?.secondary) {
      setSecondaryTitle(heroData.secondary.title || "");
      setSecondaryImageUrl(heroData.secondary.imageUrl || heroData.secondary.image || "");
      setSecondaryTargetUrl(heroData.secondary.targetUrl || heroData.secondary.slug || "");
      setSecondaryImgError(false);
    }
  }, [heroData]);

  // Handle direct file upload for Main Banner
  const handleUploadMain = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingMain(true);
    try {
      const res = await uploadBannerImage(file);
      const url = res?.data?.url || res?.url;
      if (url) {
        setMainImageUrl(url);
        setMainImgError(false);
        toast.success("อัปโหลดรูปโปรโมทหลักสำเร็จ", file.name);
      } else {
        throw new Error(res?.error || "ไม่พบ URL หลังการอัปโหลด");
      }
    } catch (err) {
      toast.error("อัปโหลดไม่สำเร็จ", err?.message);
    } finally {
      setIsUploadingMain(false);
      if (mainFileInputRef.current) mainFileInputRef.current.value = "";
    }
  };

  // Handle direct file upload for Secondary Banner
  const handleUploadSecondary = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingSecondary(true);
    try {
      const res = await uploadBannerImage(file);
      const url = res?.data?.url || res?.url;
      if (url) {
        setSecondaryImageUrl(url);
        setSecondaryImgError(false);
        toast.success("อัปโหลดรูปโปรโมทรองสำเร็จ", file.name);
      } else {
        throw new Error(res?.error || "ไม่พบ URL หลังการอัปโหลด");
      }
    } catch (err) {
      toast.error("อัปโหลดไม่สำเร็จ", err?.message);
    } finally {
      setIsUploadingSecondary(false);
      if (secondaryFileInputRef.current) secondaryFileInputRef.current.value = "";
    }
  };

  // Save Hero Banners
  const handleSaveHero = async () => {
    setIsSavingHero(true);
    try {
      await saveHero.mutateAsync({
        mainTitle: mainTitle.trim(),
        mainImageUrl: mainImageUrl.trim(),
        mainTargetUrl: mainTargetUrl.trim(),
        secondaryTitle: secondaryTitle.trim(),
        secondaryImageUrl: secondaryImageUrl.trim(),
        secondaryTargetUrl: secondaryTargetUrl.trim(),
      });
      toast.success("บันทึกรูปโปรโมทหน้าแรกเรียบร้อยแล้ว", "ข้อมูลได้รับการอัปเดตและแสดงผลทันที");
      refetchHero();
      refetchList();
    } catch (err) {
      toast.error("บันทึกไม่สำเร็จ", err?.message);
    } finally {
      setIsSavingHero(false);
    }
  };

  // Filter banner items
  const allBanners = Array.isArray(listData?.data) ? listData.data : (Array.isArray(listData) ? listData : []);
  const filteredBanners = allBanners.filter((item) => {
    const matchSearch =
      !search ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.targetUrl?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header */}
      <PageHeader
        title="จัดการแบนเนอร์และภาพโปรโมท"
        description="ตั้งค่ารูปโปรโมทหลัก (Main Hero) และรูปโปรโมทรอง (Secondary) ที่แสดงผลหน้าแรกของเว็บไซต์"
        breadcrumbs={[
          { label: "แดชบอร์ด", href: "/dashboard" },
          { label: "แบนเนอร์และภาพโปรโมท" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              ดูหน้าเว็บจริง
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchHero();
                refetchList();
                toast.success("รีเฟรชข้อมูลแล้ว");
              }}
              icon={RefreshCw}
            >
              รีเฟรช
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveHero}
              busy={isSavingHero}
              icon={Save}
            >
              บันทึกรูปโปรโมทหน้าแรก
            </Button>
          </div>
        }
      />

      {/* 2. Hero Banners Configurator Section */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                รูปโปรโมทหน้าแรก (Hero Banners)
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              แสดงผลที่ด้านบนสุดของหน้าแรก แบ่งเป็นฝั่งซ้าย (รูปหลัก 7 ส่วน) และฝั่งขวาบน (รูปรอง 5 ส่วน)
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveHero}
            busy={isSavingHero}
            icon={Save}
          >
            บันทึกการเปลี่ยนแปลง
          </Button>
        </div>

        {/* Live Grid Previews & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Main Left Featured Banner (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                รูปโปรโมทหลัก (Main Banner #1 - ซ้าย)
              </span>
              <span className="text-[11px] font-medium text-zinc-400">ขนาดแนะนำ: 1200 x 600px (2:1)</span>
            </div>

            {/* Preview Box */}
            <div className="relative group overflow-hidden h-[240px] sm:h-[280px] rounded-2xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center shadow-inner">
              {mainImageUrl && !mainImgError ? (
                <img
                  src={mainImageUrl}
                  alt={mainTitle || "Main Banner Preview"}
                  onError={() => setMainImgError(true)}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-500 select-none">
                  <ImageIcon className="w-10 h-10 opacity-30" />
                  <span className="text-sm font-medium">no image</span>
                </div>
              )}
              {/* Badge overlay */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                Preview: กล่องหลัก (ซ้าย)
              </div>
            </div>

            {/* Input Controls */}
            <div className="space-y-3 bg-zinc-50/70 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  หัวข้อรูปโปรโมทหลัก (Title / Alt Text)
                </label>
                <input
                  type="text"
                  value={mainTitle}
                  onChange={(e) => setMainTitle(e.target.value)}
                  placeholder="เช่น Summer Beach Party Live2D & Anime Event"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  URL ของรูปภาพโปรโมทหลัก
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      value={mainImageUrl}
                      onChange={(e) => {
                        setMainImageUrl(e.target.value);
                        setMainImgError(false);
                      }}
                      placeholder="https://... หรือ /banner1.png"
                      className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <input
                    type="file"
                    ref={mainFileInputRef}
                    accept="image/*"
                    onChange={handleUploadMain}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    busy={isUploadingMain}
                    onClick={() => mainFileInputRef.current?.click()}
                    icon={UploadCloud}
                  >
                    อัปโหลดรูป
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  ลิงก์ปลายทางเมื่อคลิก (Target URL)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Link2 className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={mainTargetUrl}
                    onChange={(e) => setMainTargetUrl(e.target.value)}
                    placeholder="เช่น /events/summer-beach-party หรือ /products"
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Top Right Artwork Banner (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                รูปโปรโมทรอง (Secondary Banner #2 - ขวาบน)
              </span>
              <span className="text-[11px] font-medium text-zinc-400">ขนาดแนะนำ: 800 x 500px</span>
            </div>

            {/* Preview Box */}
            <div className="relative group overflow-hidden h-[240px] sm:h-[280px] rounded-2xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center shadow-inner">
              {secondaryImageUrl && !secondaryImgError ? (
                <img
                  src={secondaryImageUrl}
                  alt={secondaryTitle || "Secondary Banner Preview"}
                  onError={() => setSecondaryImgError(true)}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-500 select-none">
                  <ImageIcon className="w-10 h-10 opacity-30" />
                  <span className="text-sm font-medium">no image</span>
                </div>
              )}
              {/* Badge overlay */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                Preview: กล่องรอง (ขวาบน)
              </div>
            </div>

            {/* Input Controls */}
            <div className="space-y-3 bg-zinc-50/70 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  หัวข้อรูปโปรโมทรอง (Title / Alt Text)
                </label>
                <input
                  type="text"
                  value={secondaryTitle}
                  onChange={(e) => setSecondaryTitle(e.target.value)}
                  placeholder="เช่น Featured Illustration หรือ Weekly Creator"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  URL ของรูปภาพโปรโมทรอง
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      value={secondaryImageUrl}
                      onChange={(e) => {
                        setSecondaryImageUrl(e.target.value);
                        setSecondaryImgError(false);
                      }}
                      placeholder="https://... หรือ /banner2.png"
                      className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <input
                    type="file"
                    ref={secondaryFileInputRef}
                    accept="image/*"
                    onChange={handleUploadSecondary}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    busy={isUploadingSecondary}
                    onClick={() => secondaryFileInputRef.current?.click()}
                    icon={UploadCloud}
                  >
                    อัปโหลดรูป
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  ลิงก์ปลายทางเมื่อคลิก (Target URL)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Link2 className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={secondaryTargetUrl}
                    onChange={(e) => setSecondaryTargetUrl(e.target.value)}
                    placeholder="เช่น /products?category=live2d"
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. All Banners Table Section */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              รายการแบนเนอร์ทั้งหมดในระบบ
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              จัดการแบนเนอร์ทั้งหมด ตรวจสอบสถิติจำนวนคนเห็น (Impressions) และจำนวนคลิก (Clicks)
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <input
              type="text"
              placeholder="ค้นหาชื่อ หรือ ลิงก์ปลายทาง..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 w-full sm:w-56"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingBanner(null);
                setModalOpen(true);
              }}
            >
              เพิ่มแบนเนอร์
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">รูปภาพ</th>
                <th className="py-3.5 px-4">ชื่อแบนเนอร์</th>
                <th className="py-3.5 px-4">ตำแหน่ง</th>
                <th className="py-3.5 px-4">ลิงก์ปลายทาง</th>
                <th className="py-3.5 px-4 text-center">สถิติ (วิว/คลิก)</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {filteredBanners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10">
                    <EmptyState
                      title="ไม่พบรายการแบนเนอร์"
                      description="ยังไม่มีแบนเนอร์ในระบบ หรือไม่ตรงกับเงื่อนไขการค้นหา"
                    />
                  </td>
                </tr>
              ) : (
                filteredBanners.map((banner) => (
                  <tr
                    key={banner.id}
                    className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="w-16 h-10 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center flex-shrink-0">
                        {banner.imageUrl || banner.image ? (
                          <img
                            src={banner.imageUrl || banner.image}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <div className={`text-[10px] text-zinc-400 ${banner.imageUrl || banner.image ? "hidden" : ""}`}>
                          no image
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      {banner.title}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {banner.placement || "Hero Banner"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 font-mono text-[11px] truncate max-w-[200px]">
                      {banner.targetUrl || banner.slug || "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1" title="Impressions">
                          <Eye className="w-3.5 h-3.5 text-zinc-400" />
                          {banner.impressions || 0}
                        </span>
                        <span className="inline-flex items-center gap-1" title="Clicks">
                          <MousePointerClick className="w-3.5 h-3.5 text-blue-500" />
                          {banner.clicks || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={async () => {
                          const next = banner.status === "active" ? "inactive" : "active";
                          try {
                            await toggleStatus.mutateAsync({ id: banner.id, status: next });
                            toast.success(`เปลี่ยนสถานะเป็น ${next} สำเร็จ`);
                          } catch (err) {
                            toast.error("เปลี่ยนสถานะไม่สำเร็จ", err?.message);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <StatusChip status={banner.status || "active"} />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingBanner(banner);
                            setModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(banner)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Create / Edit Banner Modal */}
      {modalOpen && (
        <BannerFormModal
          isOpen={modalOpen}
          initialData={editingBanner}
          onClose={() => {
            setModalOpen(false);
            setEditingBanner(null);
          }}
          onSubmit={async (payload) => {
            try {
              if (editingBanner?.id) {
                await update.mutateAsync({ id: editingBanner.id, payload });
                toast.success("แก้ไขแบนเนอร์เรียบร้อยแล้ว");
              } else {
                await create.mutateAsync(payload);
                toast.success("สร้างแบนเนอร์ใหม่เรียบร้อยแล้ว");
              }
              setModalOpen(false);
              setEditingBanner(null);
              refetchList();
              refetchHero();
            } catch (err) {
              toast.error("บันทึกไม่สำเร็จ", err?.message);
            }
          }}
        />
      )}

      {/* 5. Delete Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="ยืนยันการลบแบนเนอร์?"
        description={`คุณแน่ใจหรือไม่ว่าต้องการลบแบนเนอร์ "${deleteTarget?.title}" ออกจากระบบ?`}
        confirmText="ลบแบนเนอร์"
        cancelText="ยกเลิก"
        danger
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await remove.mutateAsync(deleteTarget.id);
            toast.success("ลบแบนเนอร์เรียบร้อยแล้ว");
            refetchList();
            refetchHero();
          } catch (err) {
            toast.error("ลบไม่สำเร็จ", err?.message);
          } finally {
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}

// Modal component for creating/editing a banner
function BannerFormModal({ isOpen, initialData, onClose, onSubmit }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || initialData?.image || "");
  const [targetUrl, setTargetUrl] = useState(initialData?.targetUrl || initialData?.slug || "");
  const [placement, setPlacement] = useState(initialData?.placement || "Hero Banner #1 (Main)");
  const [status, setStatus] = useState(initialData?.status || "active");
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadBannerImage(file);
      const url = res?.data?.url || res?.url;
      if (url) {
        setImageUrl(url);
        toast.success("อัปโหลดสำเร็จ", file.name);
      }
    } catch (err) {
      toast.error("อัปโหลดไม่สำเร็จ", err?.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      toast.error("กรุณาระบุชื่อแบนเนอร์และ URL รูปภาพ");
      return;
    }
    onSubmit({
      title: title.trim(),
      imageUrl: imageUrl.trim(),
      targetUrl: targetUrl.trim(),
      slug: targetUrl.trim(),
      placement,
      status,
      sortOrder: Number(sortOrder) || 0,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {initialData ? "แก้ไขข้อมูลแบนเนอร์" : "เพิ่มแบนเนอร์ใหม่"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              ชื่อแบนเนอร์ *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น Summer Promotion 2026"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              ตำแหน่งการแสดงผล *
            </label>
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="Hero Banner #1 (Main)">Hero Banner #1 (Main - ฝั่งซ้ายหน้าแรก)</option>
              <option value="Hero Banner #2 (Top Right)">Hero Banner #2 (Top Right - ฝั่งขวาบนหน้าแรก)</option>
              <option value="General Promotion">General Promotion (โปรโมชั่นทั่วไป)</option>
              <option value="Popup Banner">Popup Banner (ป๊อปอัป)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              URL รูปภาพ *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... หรือ /banner1.png"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                busy={isUploading}
                onClick={() => fileInputRef.current?.click()}
                icon={UploadCloud}
              >
                อัปโหลด
              </Button>
            </div>
            {imageUrl && (
              <div className="mt-2 w-full h-28 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              ลิงก์ปลายทาง (Target URL)
            </label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="เช่น /products?category=illustration-2d"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                สถานะ
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                <option value="active">Active (เปิดใช้งาน)</option>
                <option value="inactive">Inactive (ปิดใช้งาน)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                ลำดับ (Sort Order)
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Save}>
              บันทึกข้อมูล
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BannersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-zinc-400 text-xs">
          กำลังโหลดหน้าจัดการแบนเนอร์...
        </div>
      }
    >
      <BannersContent />
    </Suspense>
  );
}
