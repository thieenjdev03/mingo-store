import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  FolderTree,
  Layers,
  Ruler,
  Briefcase,
  Store,
  FileText,
  Images,
  Users,
  UserRoundCheck,
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
      { label: 'Thương hiệu', href: '/admin/brands', icon: Tags },
      { label: 'Danh mục', href: '/admin/categories', icon: FolderTree },
      { label: 'Bộ sưu tập', href: '/admin/collections', icon: Layers },
      { label: 'Quy cách', href: '/admin/sizes', icon: Ruler },
    ],
  },
  {
    heading: 'Vận hành',
    items: [
      { label: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Nhà phân phối', href: '/admin/distributors', icon: Store },
      { label: 'Tuyển dụng', href: '/admin/careers', icon: Briefcase },
      { label: 'Đơn ứng tuyển', href: '/admin/career-applications', icon: UserRoundCheck },
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
