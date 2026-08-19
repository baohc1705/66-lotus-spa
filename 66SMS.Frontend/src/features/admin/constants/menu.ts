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
  PanelsTopLeft,
  BarChart,
  Calendar1Icon,
  Home,
  Scissors,
  TestTube,
} from "lucide-react";

export interface SubMenuItem {
  label: string;
  path: string;
  icon?: React.ElementType;
  allowedRoles?: string[];
}

export interface MenuItem {
  label: string;
  path?: string;
  icon: React.ElementType;
  children?: SubMenuItem[];
  allowedRoles?: string[];
}

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
    title: "Báo cáo",
    items: [
      {
        label: "Doanh thu",
        icon: BarChart,
        allowedRoles: ["Admin", "Manager"],
        children: [
          {
            label: "Theo ngày",
            path: "/admin/bao-cao/doanh-thu/theo-ngay",
            icon: Calendar1Icon,
            allowedRoles: ["Admin", "Manager"],
          },
          {
            label: "Theo chi nhánh",
            path: "/admin/bao-cao/doanh-thu/theo-chi-nhanh",
            icon: Home,
            allowedRoles: ["Admin"],
          },
          {
            label: "Theo nhân viên",
            path: "/admin/bao-cao/doanh-thu/theo-nhan-vien",
            icon: Users,
            allowedRoles: ["Admin", "Manager"],
          },
          {
            label: "Theo dịch vụ",
            path: "/admin/bao-cao/doanh-thu/theo-dich-vu",
            icon: Leaf,
            allowedRoles: ["Admin", "Manager"],
          },
        ],
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
          { label: "Phòng dịch vụ", path: "/admin/phong-dich-vu", icon: Armchair },
          {
            label: "Vị trí dịch vụ",
            path: "/admin/phong-dich-vu/vi-tri",
            icon: MapPin,
          },
        ],
      },
      {
        label: "Dịch vụ",
        icon: Leaf,
        allowedRoles: ["Admin", "Manager"],
        children: [
          { label: "Dịch vụ", path: "/admin/dich-vu", icon: Leaf },
          {
            label: "Nhóm dịch vụ",
            path: "/admin/dich-vu/danh-muc",
            icon: Box,
          },
        ],
      },
      {
        label: "Sản phẩm",
        icon: SoapDispenserDroplet,
        allowedRoles: ["Admin", "Manager"],
        children: [
          {
            label: "Sản phẩm",
            path: "/admin/san-pham",
            icon: SoapDispenserDroplet,
          },
          {
            label: "Nhóm sản phẩm",
            path: "/admin/san-pham/danh-muc",
            icon: Box,
          },
        ],
      },
      // {
      //   label: "Liệu trình",
      //   path: "/admin/lieu-trinh",
      //   icon: History,
      //   allowedRoles: ["Admin", "Manager"],
      // },
    ],
  },
  {
    title: "Nhân viên",
    items: [
      {
        label: "Danh sách nhân viên",
        path: "/admin/nhan-vien",
        icon: Stethoscope,
        allowedRoles: ["Admin", "Manager"],
      },
      {
        label: "Dịch vụ của tôi",
        path: "/admin/nhan-vien/dich-vu",
        icon: Scissors,
        allowedRoles: ["Staff"],
      },
      {
        label: "Chấm công",
        path: "/admin/cham-cong",
        icon: CalendarCheck,
        allowedRoles: ["Admin", "Manager", "Staff", "Receptionist"],
      },
      {
        label: "Lương",
        icon: Wallet,
        allowedRoles: ["Admin", "Manager", "Staff", "Receptionist"],
        children: [
          {
            label: "Danh sách",
            path: "/admin/bang-luong",
            icon: Wallet,
            allowedRoles: ["Admin", "Manager", "Staff", "Receptionist"],
          },
          {
            label: "Thống kê lương",
            path: "/admin/bang-luong/thong-ke",
            icon: Receipt,
            allowedRoles: ["Admin", "Manager", "Staff"],
          },
        ],
      },
      {
        label: "Chứng chỉ",
        icon: Award,
        allowedRoles: ["Admin", "Manager", "Staff"],
        children: [
          {
            label: "Chứng chỉ nhân viên",
            path: "/admin/chung-chi-nhan-vien",
            icon: ShieldCheck,
            allowedRoles: ["Admin", "Manager"],
          },
          {
            label: "Nộp chứng chỉ",
            path: "/admin/chung-chi-cua-toi",
            icon: Award,
            allowedRoles: ["Staff"],
          },
          {
            label: "Loại chứng chỉ",
            path: "/admin/loai-chung-chi",
            icon: Award,
            allowedRoles: ["Admin", "Manager"],
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
            path: "/admin/nhan-vien/lich-lam-viec",
            icon: Calendar,
            allowedRoles: ["Admin", "Manager", "Staff", "Receptionist"],
          },
          {
            label: "Quản lý ca",
            path: "/admin/ca-lam-viec",
            icon: Clock,
            allowedRoles: ["Admin", "Manager"],
          },
        ],
      },
      {
        label: "Lịch hẹn của tôi",
        path: "/admin/nhan-vien/lich-hen",
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
            path: "/admin/khach-hang",
            icon: Users,
            allowedRoles: ["Admin", "Manager", "Receptionist"],
          },
          {
            label: "Ví khách hàng",
            path: "/admin/khach-hang/vi",
            icon: Wallet,
            allowedRoles: ["Admin"],
          },
          {
            label: "Thẻ thành viên",
            path: "/admin/khach-hang/the-thanh-vien",
            icon: CreditCard,
            allowedRoles: ["Admin", "Manager", "Receptionist"],
          },
          {
            label: "Loại thẻ",
            path: "/admin/khach-hang/hang-thanh-vien",
            icon: Crown,
            allowedRoles: ["Admin"],
          },
        ],
      },
      {
        label: "Khuyến mãi",
        path: "/admin/khuyen-mai",
        icon: Tag,
        allowedRoles: ["Admin", "Manager"],
      },
      {
        label: "Hóa đơn",
        path: "/admin/hoa-don",
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
        path: "/admin/tai-khoan",
        icon: User,
        allowedRoles: ["Admin"],
      },
      {
        label: "Chi nhánh",
        path: "/admin/chi-nhanh",
        icon: Building2,
        allowedRoles: ["Admin"],
      },
      {
        label: "Banner trang chủ",
        path: "/admin/banner-trang-chu",
        icon: PanelsTopLeft,
        allowedRoles: ["Admin"],
      },
      {
        label: "Phân quyền",
        path: "/admin/phan-quyen",
        icon: ShieldCheck,
        allowedRoles: ["Admin"],
      },
      {
        label: "Cấu hình lịch hẹn",
        path: "/admin/cau-hinh-dat-lich",
        icon: Settings,
        allowedRoles: ["Admin", "Manager"],
      },
    ],
  },
  {
    title: "DEMO",
    items: [
      {
        label: "Danh mục sản phẩm v2",
        path: "/admin/danh-muc-san-pham-v2",
        icon: Box,
        allowedRoles: ["Admin"],
      },
    ],
  },
];

export const MENU_ITEMS: MenuItem[] = MENU_GROUPS.flatMap(
  (group: MenuGroup) => group.items,
);
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
  {
    label: "Tổng quan",
    path: "/admin",
    allowedRoles: ["Admin", "Manager"],
    icon: LayoutDashboard,
  },
  {
    label: "Dịch vụ",
    allowedRoles: ["Admin", "Manager"],
    icon: Leaf,
    columns: [
      {
        title: "DỊCH VỤ",
        items: [
          {
            label: "Dịch vụ",
            path: "/admin/dich-vu",
            icon: Leaf,
            allowedRoles: ["Admin", "Manager"],
          },
          {
            label: "Nhóm dịch vụ",
            path: "/admin/dich-vu/danh-muc",
            icon: Box,
            allowedRoles: ["Admin", "Manager"],
          },
          {
            label: "Liệu trình",
            path: "/admin/lieu-trinh",
            icon: History,
            allowedRoles: ["Admin", "Manager"],
          },
        ],
      },
      {
        title: "SẢN PHẨM",
        items: [
          {
            label: "Sản phẩm",
            path: "/admin/san-pham",
            icon: SoapDispenserDroplet,
            allowedRoles: ["Admin", "Manager"],
          },
          {
            label: "Nhóm sản phẩm",
            path: "/admin/san-pham/danh-muc",
            icon: Box,
            allowedRoles: ["Admin", "Manager"],
          },
        ],
      },
      {
        title: "CƠ SỞ VẬT CHẤT",
        items: [
          {
            label: "Phòng dịch vụ",
            path: "/admin/phong-dich-vu",
            icon: Armchair,
            allowedRoles: ["Admin", "Manager"],
          },
          {
            label: "Vị trí dịch vụ",
            path: "/admin/phong-dich-vu/vi-tri",
            icon: MapPin,
            allowedRoles: ["Admin", "Manager"],
          },
        ],
      },
    ],
  },
  {
    label: "Nhân viên",
    allowedRoles: ["Admin", "Manager", "Staff", "Receptionist"],
    icon: User,
    columns: [
      {
        title: "QUẢN LÝ NHÂN SỰ",
        items: [
          {
            label: "Danh sách nhân viên",
            path: "/admin/nhan-vien",
            icon: User,
            allowedRoles: ["Admin", "Manager"],
          },
          {
            label: "Dịch vụ của tôi",
            path: "/admin/nhan-vien/dich-vu",
            icon: Scissors,
            allowedRoles: ["Staff"],
          },
        ],
      },
      {
        title: "CHỨNG CHỈ",
        items: [
          {
            label: "Chứng chỉ nhân viên",
            path: "/admin/chung-chi-nhan-vien",
            icon: ShieldCheck,
            allowedRoles: ["Admin", "Manager"],
          },
          {
            label: "Nộp chứng chỉ",
            path: "/admin/chung-chi-cua-toi",
            icon: Award,
            allowedRoles: ["Staff"],
          },
          {
            label: "Loại chứng chỉ",
            path: "/admin/loai-chung-chi",
            icon: Award,
            allowedRoles: ["Admin", "Manager"],
          },
        ],
      },
      {
        title: "LỊCH LÀM VIỆC",
        items: [
          {
            label: "Phân ca",
            path: "/admin/nhan-vien/lich-lam-viec",
            icon: Calendar,
            allowedRoles: ["Admin", "Manager", "Staff", "Receptionist"],
          },
          {
            label: "Quản lý ca",
            path: "/admin/ca-lam-viec",
            icon: Clock,
            allowedRoles: ["Admin", "Manager"],
          },

          {
            label: "Lịch hẹn của tôi",
            path: "/admin/nhan-vien/lich-hen",
            icon: CalendarHeart,
            allowedRoles: ["Staff"],
          },
        ],
      },
      {
        title: "CHẤM CÔNG & LƯƠNG",
        items: [
          {
            label: "Chấm công",
            path: "/admin/cham-cong",
            icon: CalendarCheck,
            allowedRoles: ["Admin", "Manager", "Staff", "Receptionist"],
          },
          {
            label: "Danh sách lương",
            path: "/admin/bang-luong",
            icon: Wallet,
            allowedRoles: ["Admin", "Manager"],
          },
          {
            label: "Thống kê lương",
            path: "/admin/bang-luong/thong-ke",
            icon: Receipt,
            allowedRoles: ["Admin", "Manager", "Staff"],
          },
        ],
      },
    ],
  },
  {
    label: "Khách hàng",
    allowedRoles: ["Admin", "Manager", "Receptionist"],
    icon: Users,
    columns: [
      {
        title: "KHÁCH HÀNG",
        items: [
          {
            label: "Danh sách khách hàng",
            path: "/admin/khach-hang",
            icon: Users,
            allowedRoles: ["Admin", "Manager", "Receptionist"],
          },
          {
            label: "Ví khách hàng",
            path: "/admin/khach-hang/vi",
            icon: Wallet,
            allowedRoles: ["Admin"],
          },
        ],
      },
      {
        title: "THẺ THÀNH VIÊN",
        items: [
          {
            label: "Thẻ thành viên",
            path: "/admin/khach-hang/the-thanh-vien",
            icon: CreditCard,
            allowedRoles: ["Admin", "Manager", "Receptionist"],
          },
          {
            label: "Loại thẻ",
            path: "/admin/khach-hang/hang-thanh-vien",
            icon: Crown,
            allowedRoles: ["Admin"],
          },
        ],
      },
      {
        title: "GIAO DỊCH & MARKETING",
        items: [
          {
            label: "Hóa đơn",
            path: "/admin/hoa-don",
            icon: Receipt,
            allowedRoles: ["Admin", "Manager", "Receptionist"],
          },
          {
            label: "Khuyến mãi",
            path: "/admin/khuyen-mai",
            icon: Tag,
            allowedRoles: ["Admin", "Manager"],
          },
          {
            label: "Thu ngân",
            path: "/thu-ngan",
            icon: ShoppingCart,
            allowedRoles: ["Admin", "Receptionist"],
          },
        ],
      },
    ],
  },
  {
    label: "Thiết lập",
    allowedRoles: ["Admin", "Manager"],
    icon: Settings,
    columns: [
      {
        title: "HỆ THỐNG",
        items: [
          {
            label: "Chi nhánh",
            path: "/admin/chi-nhanh",
            icon: Building2,
            allowedRoles: ["Admin"],
          },
          {
            label: "Banner trang chủ",
            path: "/admin/banner-trang-chu",
            icon: PanelsTopLeft,
            allowedRoles: ["Admin"],
          },
          {
            label: "Phân quyền",
            path: "/admin/phan-quyen",
            icon: ShieldCheck,
            allowedRoles: ["Admin"],
          },

          {
            label: "Cấu hình lịch hẹn",
            path: "/admin/cau-hinh-dat-lich",
            icon: Settings,
            allowedRoles: ["Admin", "Manager"],
          },
        ],
      },
      {
        title: "TÀI KHOẢN",
        items: [
          {
            label: "Danh sách tài khoản",
            path: "/admin/tai-khoan",
            icon: User,
            allowedRoles: ["Admin"],
          },
          {
            label: "Hồ sơ cá nhân",
            path: "/admin/ho-so",
            icon: User,
            allowedRoles: ["Admin", "Manager", "Staff", "Receptionist"],
          },
        ],
      },
    ],
  },
  {
    label: "Demo",
    allowedRoles: ["Admin"],
    icon: TestTube,
    columns: [
      {
        title: "Sản phẩm",
        items: [
          {
            label: "Danh mục sản phẩm",
            path: "/admin/danh-muc-san-pham-v2",
            icon: Box,
            allowedRoles: ["Admin"],
          },
        ],
      },
    ],
  },
];
