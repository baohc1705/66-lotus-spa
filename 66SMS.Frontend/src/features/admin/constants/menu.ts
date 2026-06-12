import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Send,
  History,
  FileText,
  Calendar,
  SoapDispenserDroplet,
  Stethoscope,
  Clock,
  Leaf,
  Armchair,
  Box,
  MapPin,
  CalendarHeart,
} from "lucide-react";

export interface SubMenuItem {
  label: string;
  path: string;
  icon?: React.ElementType;
}

export interface MenuItem {
  label: string;
  path?: string;
  icon: React.ElementType;
  children?: SubMenuItem[];
}

export const MENU_ITEMS: MenuItem[] = [
  { label: "Tổng quan", path: "/admin", icon: LayoutDashboard },
  {
    label: "Phòng",
    icon: Armchair,
    children: [
      { label: "Phòng dịch vụ", path: "/admin/rooms/list", icon: Armchair },
      { label: "Vị trí dịch vụ", path: "/admin/rooms/positions", icon: MapPin },
    ],
  },
  {
    label: "Dịch vụ",
    icon: Leaf,
    children: [
      { label: "Dịch vụ", path: "/admin/services", icon: Leaf },
      { label: "Nhóm dịch vụ", path: "/admin/services/categories", icon: Box },
    ],
  },
  {
    label: "Sản phẩm",
    icon: SoapDispenserDroplet,
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
    label: "Quản lý Spa",
    icon: MessageSquare,
    children: [
      { label: "Đặt lịch hẹn", path: "/admin/appointments", icon: Send },
      { label: "Liệu trình", path: "/admin/treatments", icon: History },
      { label: "Gói dịch vụ", path: "/admin/packages", icon: FileText },
    ],
  },
  { label: "Nhân viên", path: "/admin/staff/list", icon: Stethoscope },
  {
    label: "Lịch làm việc",
    icon: Calendar,
    children: [
      { label: "Phân ca", path: "/admin/staff/schedule", icon: Calendar },
      { label: "Quản lý ca", path: "/admin/shifts", icon: Clock },
      { label: "Khung giờ", path: "/admin/timeslots", icon: Clock },
    ],
  },
  {
    label: "Lịch hẹn của tôi",
    path: "/admin/staff/appointments",
    icon: CalendarHeart,
  },
  { label: "Khách hàng", path: "/admin/customers/list", icon: Users },
];
