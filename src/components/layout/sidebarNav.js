import {
  BadgePercent,
  Banknote,
  CircleHelp,
  Flag,
  FolderTree,
  HeartHandshake,
  Image as ImageIcon,
  Landmark,
  LayoutDashboard,
  MessageSquare,
  Package,
  ReceiptText,
  ScrollText,
  Settings,
  ShieldAlert,
  ShieldQuestion,
  ShoppingBag,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";

/**
 * sidebarNav — single source of truth for the admin navigation.
 * `badgeKey` maps to a value on the overview payload, so counts stay live without
 * the sidebar knowing anything about the query itself.
 */
export const SIDEBAR_NAV = [
  {
    label: "ภาพรวม",
    labelEn: "Overview",
    items: [
      {
        href: "/dashboard",
        label: "แดชบอร์ด",
        labelEn: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        href: "/financial",
        label: "การเงินและบัญชี",
        labelEn: "Financial",
        icon: Landmark,
      },
      {
        href: "/analytics",
        label: "สถิติและรายงาน",
        labelEn: "Analytics",
        icon: ShoppingBag,
        soon: true,
      },
    ],
  },
  {
    label: "ตลาดสินค้า",
    labelEn: "Marketplace",
    items: [
      {
        href: "/products",
        label: "คลังสินค้า",
        labelEn: "Products",
        icon: Package,
        badgeKey: "totalProducts",
      },
      {
        href: "/categories",
        label: "หมวดหมู่สินค้า",
        labelEn: "Categories",
        icon: FolderTree,
      },
      {
        href: "/orders",
        label: "คำสั่งซื้อ",
        labelEn: "Orders",
        icon: ReceiptText,
        badgeKey: "pendingOrders",
        tone: "warning",
      },
      {
        href: "/support-metrics",
        label: "สถิติให้กำลังใจ",
        labelEn: "Support metrics",
        icon: HeartHandshake,
      },
      {
        href: "/withdrawals",
        label: "คิวถอนเงินศิลปิน",
        labelEn: "Withdrawals",
        icon: Banknote,
        tone: "warning",
      },
      {
        href: "/promotions",
        label: "โปรโมชั่น",
        labelEn: "Promotions",
        icon: BadgePercent,
      },
      {
        href: "/banners",
        label: "แบนเนอร์หน้าแรก",
        labelEn: "Hero Banners",
        icon: ImageIcon,
      },
    ],
  },
  {
    label: "คอมมูนิตี้",
    labelEn: "Community",
    items: [
      {
        href: "/users",
        label: "ผู้ใช้งาน",
        labelEn: "Users",
        icon: Users,
        badgeKey: "newUsers7d",
        tone: "info",
      },
      {
        href: "/creator-applications",
        label: "ใบสมัครศิลปิน",
        labelEn: "Creator applications",
        icon: UserPlus,
        badgeKey: "pendingApplications",
        tone: "warning",
      },
      { href: "/posts", label: "โพสต์", labelEn: "Posts", icon: MessageSquare },
      {
        href: "/disputes",
        label: "ข้อพิพาท / คืนเงิน",
        labelEn: "Disputes",
        icon: ShieldQuestion,
        tone: "danger",
      },
      {
        href: "/reports",
        label: "รายการถูกรายงาน",
        labelEn: "Reports",
        icon: Flag,
        badgeKey: "reportedItems",
        tone: "danger",
      },
      {
        href: "/moderation",
        label: "ตรวจภาพและอุทธรณ์",
        labelEn: "Moderation & Appeals",
        icon: ShieldAlert,
        badgeKey: "pendingAppeals",
        tone: "warning",
      },
    ],
  },
  {
    label: "ตั้งค่าระบบ",
    labelEn: "System",
    items: [
      {
        href: "/employees",
        label: "พนักงานและสิทธิ์",
        labelEn: "Employees",
        icon: UserCog,
      },
      {
        href: "/audit",
        label: "Audit Log",
        labelEn: "Audit Log",
        icon: ScrollText,
      },
      {
        href: "/settings",
        label: "การตั้งค่า",
        labelEn: "Settings",
        icon: Settings,
      },
      {
        href: "/help",
        label: "ศูนย์ช่วยเหลือ",
        labelEn: "Help & Support",
        icon: CircleHelp,
      },
    ],
  },
];

/** Flattened list — used by the topbar breadcrumb to resolve the active route. */
export const FLAT_NAV = SIDEBAR_NAV.flatMap((group) =>
  group.items.map((item) => ({ ...item, groupLabel: group.label })),
);

export const ADMIN_QUOTA = {
  label: "โควตา AI สร้างคำบรรยายสินค้า",
  used: 891,
  total: 1000,
};
