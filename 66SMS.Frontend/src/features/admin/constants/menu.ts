import {
  LayoutDashboard,
  Users,
  Calendar,
  SoapDispenserDroplet,
  Stethoscope,
  Clock,
  Leaf,
  Armchair,
  Box,
  MapPin,
  CalendarHeart,
  Wallet,
  CreditCard,
  Crown,
  Building2,
  ShieldCheck,
  History,
  Award,
  Receipt,
  CalendarCheck,
  Tag,
  ShoppingCart,
  User,
  Settings,
} from "lucide-react";

export interface SubMenuItem {
  label: string;
  path: string;
  icon?: React.ElementType;
  /** Danh sách role được phép truy cập sub-menu này.
   *  Nếu không khai báo → kế thừa quyền từ parent MenuItem. */
  allowedRoles?: string[];
}

export interface MenuItem {
  label: string;
  path?: string;
  icon: React.ElementType;
  children?: SubMenuItem[];
  /** Danh sách role được phép nhìn thấy menu này.
   *  Nếu không khai báo → chỉ Admin mới thấy (mặc định hạn chế nhất). */
  allowedRoles?: string[];
}

/** Nhóm menu sidebar — title nhỏ phía trên các item. */
export interface MenuGroup {
  title?: string;
  items: MenuItem[];
}

export const MENU_GROUPS: MenuGroup[] = [
  {
    items: [
      {
        label: "Tổng quan",
        path: "/admin",
        icon: LayoutDashboard,
        allowedRoles: ["Admin", "Manager"],
      },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      {
        label: "Chi nhánh",
        path: "/admin/salons",
        icon: Building2,
        allowedRoles: ["Admin"],
      },
      {
        label: "Phân quyền",
        path: "/admin/roles",
        icon: ShieldCheck,
        allowedRoles: ["Admin"],
      },
    ],
  },
  {
    title: "Dịch vụ",
    items: [
      {
        label: "Phòng",
        icon: Armchair,
        allowedRoles: ["Admin", "Manager"],
        children: [
          { label: "Phòng dịch vụ", path: "/admin/rooms/list", icon: Armchair },
          { label: "Vị trí dịch vụ", path: "/admin/rooms/positions", icon: MapPin },
        ],
      },
      {
        label: "Dịch vụ",
        icon: Leaf,
        allowedRoles: ["Admin", "Manager"],
        children: [
          { label: "Dịch vụ", path: "/admin/services", icon: Leaf },
          { label: "Nhóm dịch vụ", path: "/admin/services/categories", icon: Box },
        ],
      },
      {
        label: "Sản phẩm",
        icon: SoapDispenserDroplet,
        allowedRoles: ["Admin", "Manager"],
        children: [
          {
            label: "Sản phẩm",
            path: "/admin/products/list",
            icon: SoapDispenserDroplet,
          },
          {
            label: "Nhóm sản phẩm",
            path: "/admin/products/categories",
            icon: Box,
          },
        ],
      },
      {
        label: "Liệu trình",
        path: "/admin/treatments",
        icon: History,
        allowedRoles: ["Admin", "Manager"],
      },
    ],
  },
  {
    title: "Nhân viên",
    items: [
      {
        label: "Danh sách nhân viên",
        path: "/admin/staff/list",
        icon: Stethoscope,
        allowedRoles: ["Admin", "Manager"],
      },
      {
        label: "Chấm công",
        path: "/admin/attendance",
        icon: CalendarCheck,
        allowedRoles: ["Admin", "Manager", "Staff", "Receptionist"],
      },
      {
        label: "Lương",
        icon: Wallet,
        allowedRoles: ["Admin", "Manager", "Staff"],
        children: [
          {
            label: "Danh sách",
            path: "/admin/payroll",
            icon: Wallet,
            allowedRoles: ["Admin", "Manager"],
          },
          {
            label: "Thống kê lương",
            path: "/admin/payroll/stats",
            icon: Receipt,
            allowedRoles: ["Admin", "Manager", "Staff"],
          },
        ],
      },
      {
        label: "Chứng chỉ",
        icon: Award,
        allowedRoles: ["Admin", "Manager"],
        children: [
          {
            label: "Chứng chỉ nhân viên",
            path: "/admin/staff-certificates",
            icon: ShieldCheck,
          },
          {
            label: "Loại chứng chỉ",
            path: "/admin/certificate-types",
            icon: Award,
          },
        ],
      },
      {
        label: "Lịch làm việc",
        icon: Calendar,
        allowedRoles: ["Admin", "Manager", "Staff", "Receptionist"],
        children: [
          {
            label: "Phân ca",
            path: "/admin/staff/schedule",
            icon: Calendar,
            allowedRoles: ["Admin", "Manager", "Staff", "Receptionist"],
          },
          {
            label: "Quản lý ca",
            path: "/admin/shifts",
            icon: Clock,
            allowedRoles: ["Admin", "Manager"],
          },
          {
            label: "Khung giờ",
            path: "/admin/timeslots",
            icon: Clock,
            allowedRoles: ["Admin", "Manager"],
          },
        ],
      },
      {
        label: "Lịch hẹn của tôi",
        path: "/admin/staff/appointments",
        icon: CalendarHeart,
        allowedRoles: ["Staff"],
      },
    ],
  },
  {
    title: "Khách hàng",
    items: [
      {
        label: "Khách hàng",
        icon: Users,
        allowedRoles: ["Admin", "Manager", "Receptionist"],
        children: [
          {
            label: "Khách hàng",
            path: "/admin/customers/list",
            icon: Users,
            allowedRoles: ["Admin", "Manager", "Receptionist"],
          },
          {
            label: "Ví khách hàng",
            path: "/admin/customers/wallets",
            icon: Wallet,
            allowedRoles: ["Admin"],
          },
          {
            label: "Thẻ thành viên",
            path: "/admin/customers/membership-cards",
            icon: CreditCard,
            allowedRoles: ["Admin", "Manager", "Receptionist"],
          },
          {
            label: "Loại thẻ",
            path: "/admin/customers/membership-tiers",
            icon: Crown,
            allowedRoles: ["Admin"],
          },
        ],
      },
      {
        label: "Khuyến mãi",
        path: "/admin/marketing/promotions",
        icon: Tag,
        allowedRoles: ["Admin", "Manager"],
      },
      {
        label: "Hóa đơn",
        path: "/admin/invoices",
        icon: Receipt,
        allowedRoles: ["Admin", "Manager", "Receptionist"],
      },
    ],
  },
  {
    title: "Thiết lập",
    items: [
      {
        label: "Tài khoản",
        path: "/admin/accounts",
        icon: User,
        allowedRoles: ["Admin"],
      }
    ]
  }
];

/** Flat list — dùng cho breadcrumb / tìm title trang. */
export const MENU_ITEMS: MenuItem[] = MENU_GROUPS.flatMap(
  (group: MenuGroup) => group.items,
);
// Top Nav Mega Menu Types & Configuration
export interface MegaMenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
  allowedRoles?: string[];
}

export interface MegaMenuColumn {
  title: string;
  items: MegaMenuItem[];
}

export interface ParentTab {
  label: string;
  path?: string;
  columns?: MegaMenuColumn[];
  allowedRoles?: string[];
  icon?: React.ElementType;
}

export const TOP_NAV_TABS: ParentTab[] = [
  // 1. TỔNG QUAN
  {
    label: "Tổng quan",
    path: "/admin",
    allowedRoles: ["Admin", "Manager"],
    icon: LayoutDashboard,
  },
  // 2. DỊCH VỤ & SẢN PHẨM
  {
    label: "Dịch vụ",
    allowedRoles: ["Admin", "Manager"],
    icon: Leaf,
    columns: [
      {
        title: "DỊCH VỤ",
        items: [
          { label: "Dịch vụ", path: "/admin/services", icon: Leaf, allowedRoles: ["Admin", "Manager"] },
          { label: "Nhóm dịch vụ", path: "/admin/services/categories", icon: Box, allowedRoles: ["Admin", "Manager"] },
          { label: "Liệu trình", path: "/admin/treatments", icon: History, allowedRoles: ["Admin", "Manager"] },
        ],
      },
      {
        title: "SẢN PHẨM",
        items: [
          { label: "Sản phẩm", path: "/admin/products/list", icon: SoapDispenserDroplet, allowedRoles: ["Admin", "Manager"] },
          { label: "Nhóm sản phẩm", path: "/admin/products/categories", icon: Box, allowedRoles: ["Admin", "Manager"] },
        ],
      },
      {
        title: "CƠ SỞ VẬT CHẤT",
        items: [
          { label: "Phòng dịch vụ", path: "/admin/rooms/list", icon: Armchair, allowedRoles: ["Admin", "Manager"] },
          { label: "Vị trí dịch vụ", path: "/admin/rooms/positions", icon: MapPin, allowedRoles: ["Admin", "Manager"] },
        ],
      },
    ],
  },
  // 3. NHÂN VIÊN
  {
    label: "Nhân viên",
    allowedRoles: ["Admin", "Manager", "Staff", "Receptionist"],
    icon: User,
    columns: [
      {
        title: "QUẢN LÝ NHÂN SỰ",
        items: [
          { label: "Danh sách nhân viên", path: "/admin/staff/list", icon: User, allowedRoles: ["Admin", "Manager"] },
        ],
      },
      {
        title: "CHỨNG CHỈ",
        items: [
          { label: "Chứng chỉ nhân viên", path: "/admin/staff-certificates", icon: ShieldCheck, allowedRoles: ["Admin", "Manager"] },
          { label: "Loại chứng chỉ", path: "/admin/certificate-types", icon: Award, allowedRoles: ["Admin", "Manager"] },
        ],
      },
      {
        title: "LỊCH LÀM VIỆC",
        items: [
          { label: "Phân ca", path: "/admin/staff/schedule", icon: Calendar, allowedRoles: ["Admin", "Manager", "Staff", "Receptionist"] },
          { label: "Quản lý ca", path: "/admin/shifts", icon: Clock, allowedRoles: ["Admin", "Manager"] },
          { label: "Khung giờ", path: "/admin/timeslots", icon: Clock, allowedRoles: ["Admin", "Manager"] },
          { label: "Lịch hẹn của tôi", path: "/admin/staff/appointments", icon: CalendarHeart, allowedRoles: ["Staff"] },
        ],
      },
      {
        title: "CHẤM CÔNG & LƯƠNG",
        items: [
          { label: "Chấm công", path: "/admin/attendance", icon: CalendarCheck, allowedRoles: ["Admin", "Manager", "Staff", "Receptionist"] },
          { label: "Danh sách lương", path: "/admin/payroll", icon: Wallet, allowedRoles: ["Admin", "Manager"] },
          { label: "Thống kê lương", path: "/admin/payroll/stats", icon: Receipt, allowedRoles: ["Admin", "Manager", "Staff"] },
        ],
      },
    ],
  },
  // 4. KHÁCH HÀNG & BÁN HÀNG
  {
    label: "Khách hàng",
    allowedRoles: ["Admin", "Manager", "Receptionist"],
    icon: Users,
    columns: [
      {
        title: "KHÁCH HÀNG",
        items: [
          { label: "Danh sách khách hàng", path: "/admin/customers/list", icon: Users, allowedRoles: ["Admin", "Manager", "Receptionist"] },
          { label: "Ví khách hàng", path: "/admin/customers/wallets", icon: Wallet, allowedRoles: ["Admin"] },
        ],
      },
      {
        title: "THẺ THÀNH VIÊN",
        items: [
          { label: "Thẻ thành viên", path: "/admin/customers/membership-cards", icon: CreditCard, allowedRoles: ["Admin", "Manager", "Receptionist"] },
          { label: "Loại thẻ", path: "/admin/customers/membership-tiers", icon: Crown, allowedRoles: ["Admin"] },
        ],
      },
      {
        title: "GIAO DỊCH & MARKETING",
        items: [
          { label: "Hóa đơn", path: "/admin/invoices", icon: Receipt, allowedRoles: ["Admin", "Manager", "Receptionist"] },
          { label: "Khuyến mãi", path: "/admin/marketing/promotions", icon: Tag, allowedRoles: ["Admin", "Manager"] },
          { label: "Thu ngân", path: "/thu-ngan", icon: ShoppingCart, allowedRoles: ["Admin", "Receptionist"] },
        ],
      },
    ],
  },
  // 5. THIẾT LẬP
  {
    label: "Thiết lập",
    allowedRoles: ["Admin", "Manager"],
    icon: Settings,
    columns: [
      {
        title: "HỆ THỐNG",
        items: [
          { label: "Chi nhánh", path: "/admin/salons", icon: Building2, allowedRoles: ["Admin"] },
          { label: "Phân quyền", path: "/admin/roles", icon: ShieldCheck, allowedRoles: ["Admin"] },
          { label: "Tài khoản", path: "/admin/accounts", icon: User, allowedRoles: ["Admin"] },
        ],
      },
      {
        title: "TÀI KHOẢN",
        items: [
          { label: "Hồ sơ cá nhân", path: "/admin/profile", icon: User, allowedRoles: ["Admin", "Manager", "Staff", "Receptionist"] },
        ],
      },
    ],
  },
];
