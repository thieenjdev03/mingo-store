import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Layers,
  Palette,
  Ruler,
  Briefcase,
  Store,
  FileText,
  Images,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  heading: string;
  items: AdminNavItem[];
}

/** Điều hướng sidebar admin. Mỗi mục = một module CRUD. */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    heading: 'Tổng quan',
    items: [{ label: 'Bảng điều khiển', href: '/admin', icon: LayoutDashboard }],
  },
  {
    heading: 'Sản phẩm',
    items: [
      { label: 'Sản phẩm', href: '/admin/products', icon: Package },
      { label: 'Danh mục', href: '/admin/categories', icon: FolderTree },
      { label: 'Bộ sưu tập', href: '/admin/collections', icon: Layers },
      { label: 'Màu sắc', href: '/admin/colors', icon: Palette },
      { label: 'Quy cách', href: '/admin/sizes', icon: Ruler },
    ],
  },
  {
    heading: 'Vận hành',
    items: [
      { label: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Nhà phân phối', href: '/admin/distributors', icon: Store },
      { label: 'Tuyển dụng', href: '/admin/careers', icon: Briefcase },
    ],
  },
  {
    heading: 'Nội dung',
    items: [
      { label: 'Banner trang chủ', href: '/admin/homepage-banners', icon: Images },
      { label: 'Chính sách', href: '/admin/policies', icon: FileText },
    ],
  },
  {
    heading: 'Hệ thống',
    items: [{ label: 'Người dùng', href: '/admin/users', icon: Users }],
  },
];
