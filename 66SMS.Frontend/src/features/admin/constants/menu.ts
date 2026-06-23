import {
  LayoutDashboard,
  //MessageSquare,
  Users,
  //Send,
  //History,
  //FileText,
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

export const MENU_ITEMS: MenuItem[] = [
  {
    label: "Tổng quan",
    path: "/admin",
    icon: LayoutDashboard,
    allowedRoles: ["Admin", "Manager"],
  },
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
  // {
  //   label: "Quản lý Spa",
  //   icon: MessageSquare,
  //   allowedRoles: ["Admin"],
  //   children: [
  //     { label: "Đặt lịch hẹn", path: "/admin/appointments", icon: Send },
  //     { label: "Liệu trình", path: "/admin/treatments", icon: History },
  //     { label: "Gói dịch vụ", path: "/admin/packages", icon: FileText },
  //   ],
  // },
  {
    label: "Nhân viên",
    path: "/admin/staff/list",
    icon: Stethoscope,
    allowedRoles: ["Admin", "Manager"],
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
        allowedRoles: ["Admin", "Manager"],
      },
      {
        label: "Quản lý ca",
        path: "/admin/shifts",
        icon: Clock,
        allowedRoles: ["Admin", "Manager", "Staff", "Receptionist"],
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
  {
    label: "Khách hàng",
    icon: Users,
    allowedRoles: ["Admin", "Manager"],
    children: [
      { label: "Khách hàng", path: "/admin/customers/list", icon: Users },
      {
        label: "Ví khách hàng",
        path: "/admin/customers/wallets",
        icon: Wallet,
      },
      {
        label: "Thẻ thành viên",
        path: "/admin/customers/membership-cards",
        icon: CreditCard,
      },
      {
        label: "Loại thẻ",
        path: "/admin/customers/membership-tiers",
        icon: Crown,
      },
    ],
  },
];
