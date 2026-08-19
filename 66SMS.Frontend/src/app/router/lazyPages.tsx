import { lazy } from "react";

export const ProfilePage = lazy(() =>
  import("@/features/profile/pages/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  })),
);
export const AdminDashboard = lazy(() =>
  import("@/features/admin/pages/AdminDashboard").then((m) => ({
    default: m.AdminDashboard,
  })),
);
export const AdminProfilePage = lazy(() =>
  import("@/features/admin/pages/AdminProfilePage").then((m) => ({
    default: m.AdminProfilePage,
  })),
);
export const RolePermissionPage = lazy(
  () => import("@/features/auth/pages/RolePermissionPage"),
);
export const BookingPage = lazy(() =>
  import("@/features/booking/pages/BookingPage").then((m) => ({
    default: m.BookingPage,
  })),
);
export const CashierPage = lazy(() =>
  import("@/features/cashier/pages/CashierPage").then((m) => ({
    default: m.CashierPage,
  })),
);
export const VnPayReturnPage = lazy(() =>
  import("@/features/cashier/pages/VnPayReturnPage").then((m) => ({
    default: m.VnPayReturnPage,
  })),
);
export const AccountListPage = lazy(() =>
  import("@/features/users/pages/AccountListPage").then((m) => ({
    default: m.AccountListPage,
  })),
);
export const UsersPage = lazy(() =>
  import("@/features/users/pages/UserListPage").then((m) => ({
    default: m.UserListPage,
  })),
);
export const StaffListPage = lazy(() =>
  import("@/features/staffs/pages/StaffListPage").then((m) => ({
    default: m.StaffListPage,
  })),
);
export const MyStaffServicesPage = lazy(() =>
  import("@/features/staffs/pages/MyStaffServicesPage").then((m) => ({
    default: m.MyStaffServicesPage,
  })),
);
export const StaffAppointmentsPage = lazy(() =>
  import("@/features/staff_appointments/pages/StaffAppointmentsPage").then(
    (m) => ({ default: m.StaffAppointmentsPage }),
  ),
);
export const CustomerListPage = lazy(() =>
  import("@/features/customers/pages/CustomerListPage").then((m) => ({
    default: m.CustomerListPage,
  })),
);
export const MembershipCardListPage = lazy(() =>
  import("@/features/customers/pages/MembershipCardListPage").then((m) => ({
    default: m.MembershipCardListPage,
  })),
);
export const MembershipTierListPage = lazy(() =>
  import("@/features/customers/pages/MembershipTierListPage").then((m) => ({
    default: m.MembershipTierListPage,
  })),
);
export const ProductListPage = lazy(() =>
  import("@/features/products/pages/ProductListPage").then((m) => ({
    default: m.ProductListPage,
  })),
);
export const ProductCategoryListPage = lazy(() =>
  import("@/features/product-categories/pages/ProductCategoryListPage").then(
    (m) => ({ default: m.ProductCategoryListPage }),
  ),
);
export const ServiceListPage = lazy(() =>
  import("@/features/services/pages/ServiceListPage").then((m) => ({
    default: m.ServiceListPage,
  })),
);
export const ServiceCategoryListPage = lazy(() =>
  import("@/features/service_categories/pages/ServiceCategoryListPage").then(
    (m) => ({ default: m.ServiceCategoryListPage }),
  ),
);
export const ShiftListPage = lazy(() =>
  import("@/features/shifts/pages/ShiftListPage").then((m) => ({
    default: m.ShiftListPage,
  })),
);
export const WorkSchedulePage = lazy(() =>
  import("@/features/schedules/pages/WorkSchedulePage").then((m) => ({
    default: m.WorkSchedulePage,
  })),
);
export const BookingRoomListPage = lazy(() =>
  import("@/features/booking_rooms/pages/BookingRoomListPage").then((m) => ({
    default: m.BookingRoomListPage,
  })),
);
export const BookingPositionListPage = lazy(() =>
  import("@/features/booking_positions/pages/BookingPositionListPage").then(
    (m) => ({ default: m.BookingPositionListPage }),
  ),
);
export const TimeSlotListPage = lazy(() =>
  import("@/features/time_slots/pages/TimeSlotListPage").then((m) => ({
    default: m.TimeSlotListPage,
  })),
);
export const ConfigAppointmentListPage = lazy(() =>
  import("@/features/config_appointments/pages/ConfigAppointmentListPage").then(
    (m) => ({ default: m.ConfigAppointmentListPage }),
  ),
);
export const WalletManagementPage = lazy(() =>
  import("@/features/wallet/pages/WalletManagementPage").then((m) => ({
    default: m.WalletManagementPage,
  })),
);
export const SalonListPage = lazy(() =>
  import("@/features/salons/pages/SalonListPage").then((m) => ({
    default: m.SalonListPage,
  })),
);
export const LandingBannerListPage = lazy(() =>
  import("@/features/landing-banners/pages/LandingBannerListPage").then(
    (m) => ({ default: m.LandingBannerListPage }),
  ),
);
export const TreatmentCourseListPage = lazy(() =>
  import("@/features/treatment_courses/pages/TreatmentCourseListPage").then(
    (m) => ({ default: m.TreatmentCourseListPage }),
  ),
);
export const InvoiceListPage = lazy(() =>
  import("@/features/invoices/pages/InvoiceListPage").then((m) => ({
    default: m.InvoiceListPage,
  })),
);
export const AttendanceListPage = lazy(() =>
  import("@/features/attendance/pages/AttendanceListPage").then((m) => ({
    default: m.AttendanceListPage,
  })),
);
export const PayrollListPage = lazy(() =>
  import("@/features/payroll/pages/PayrollListPage").then((m) => ({
    default: m.PayrollListPage,
  })),
);
export const PayrollStatsPage = lazy(() =>
  import("@/features/payroll/pages/PayrollStatsPage").then((m) => ({
    default: m.PayrollStatsPage,
  })),
);
export const CertificateTypesPage = lazy(() =>
  import("@/features/certificates/pages/CertificateTypesPage").then((m) => ({
    default: m.CertificateTypesPage,
  })),
);
export const StaffCertificatesPage = lazy(() =>
  import("@/features/certificates/pages/StaffCertificatesPage").then((m) => ({
    default: m.StaffCertificatesPage,
  })),
);
export const PromotionListPage = lazy(() =>
  import("@/features/promotions/pages/PromotionListPage").then((m) => ({
    default: m.PromotionListPage,
  })),
);
export const RevenueByDayPage = lazy(() =>
  import("@/features/revenue/pages/RevenueByDayPage").then((m) => ({
    default: m.RevenueByDayPage,
  })),
);
export const RevenueBySalonPage = lazy(() =>
  import("@/features/revenue/pages/RevenueBySalonPage").then((m) => ({
    default: m.RevenueBySalonPage,
  })),
);
export const RevenueByServicePage = lazy(() =>
  import("@/features/revenue/pages/RevenueByServicePage").then((m) => ({
    default: m.RevenueByServicePage,
  })),
);
export const RevenueByStaffPage = lazy(() =>
  import("@/features/revenue/pages/RevenueByStaffPage").then((m) => ({
    default: m.RevenueByStaffPage,
  })),
);

export const SettingsHomePage = lazy(() =>
  import("@/features/setttings/pages/SettingsHomePage").then((m) => ({
    default: m.SettingsHomePage,
  })),
);
export const ButtonsPage = lazy(() =>
  import("@/features/setttings/pages/elements/ButtonsPage").then((m) => ({
    default: m.ButtonsPage,
  })),
);
export const DropdownsPage = lazy(() =>
  import("@/features/setttings/pages/elements/DropdownsPage").then((m) => ({
    default: m.DropdownsPage,
  })),
);
export const IconsPage = lazy(() =>
  import("@/features/setttings/pages/elements/IconsPage").then((m) => ({
    default: m.IconsPage,
  })),
);
export const BadgesPage = lazy(() =>
  import("@/features/setttings/pages/elements/BadgesPage").then((m) => ({
    default: m.BadgesPage,
  })),
);
export const CardsPage = lazy(() =>
  import("@/features/setttings/pages/elements/CardsPage").then((m) => ({
    default: m.CardsPage,
  })),
);
export const ListGroupsPage = lazy(() =>
  import("@/features/setttings/pages/elements/ListGroupsPage").then((m) => ({
    default: m.ListGroupsPage,
  })),
);
export const NavigationPage = lazy(() =>
  import("@/features/setttings/pages/elements/NavigationPage").then((m) => ({
    default: m.NavigationPage,
  })),
);
export const UtilitiesPage = lazy(() =>
  import("@/features/setttings/pages/elements/UtilitiesPage").then((m) => ({
    default: m.UtilitiesPage,
  })),
);
export const TabsPage = lazy(() =>
  import("@/features/setttings/pages/components/TabsPage").then((m) => ({
    default: m.TabsPage,
  })),
);
export const AccordionsPage = lazy(() =>
  import("@/features/setttings/pages/components/AccordionsPage").then((m) => ({
    default: m.AccordionsPage,
  })),
);
export const NotificationsPage = lazy(() =>
  import("@/features/setttings/pages/components/NotificationsPage").then(
    (m) => ({ default: m.NotificationsPage }),
  ),
);
export const ModalsPage = lazy(() =>
  import("@/features/setttings/pages/components/ModalsPage").then((m) => ({
    default: m.ModalsPage,
  })),
);
export const ProgressPage = lazy(() =>
  import("@/features/setttings/pages/components/ProgressPage").then((m) => ({
    default: m.ProgressPage,
  })),
);
export const TooltipsPage = lazy(() =>
  import("@/features/setttings/pages/components/TooltipsPage").then((m) => ({
    default: m.TooltipsPage,
  })),
);
export const CarouselPage = lazy(() =>
  import("@/features/setttings/pages/components/CarouselPage").then((m) => ({
    default: m.CarouselPage,
  })),
);
export const CalendarPage = lazy(() =>
  import("@/features/setttings/pages/components/CalendarPage").then((m) => ({
    default: m.CalendarPage,
  })),
);
export const PaginationPage = lazy(() =>
  import("@/features/setttings/pages/components/PaginationPage").then((m) => ({
    default: m.PaginationPage,
  })),
);
export const ScrollablePage = lazy(() =>
  import("@/features/setttings/pages/components/ScrollablePage").then((m) => ({
    default: m.ScrollablePage,
  })),
);
export const MapsPage = lazy(() =>
  import("@/features/setttings/pages/components/MapsPage").then((m) => ({
    default: m.MapsPage,
  })),
);
export const ControlsPage = lazy(() =>
  import("@/features/setttings/pages/forms/ControlsPage").then((m) => ({
    default: m.ControlsPage,
  })),
);
export const LayoutsPage = lazy(() =>
  import("@/features/setttings/pages/forms/LayoutsPage").then((m) => ({
    default: m.LayoutsPage,
  })),
);
export const ValidationPage = lazy(() =>
  import("@/features/setttings/pages/forms/ValidationPage").then((m) => ({
    default: m.ValidationPage,
  })),
);
export const RegularPage = lazy(() =>
  import("@/features/setttings/pages/tables/RegularPage").then((m) => ({
    default: m.RegularPage,
  })),
);
export const DataTablePage = lazy(() =>
  import("@/features/setttings/pages/tables/DataTablePage").then((m) => ({
    default: m.DataTablePage,
  })),
);
export const BoxesPage = lazy(() =>
  import("@/features/setttings/pages/widgets/BoxesPage").then((m) => ({
    default: m.BoxesPage,
  })),
);
export const RechartsPage = lazy(() =>
  import("@/features/setttings/pages/charts/RechartsPage").then((m) => ({
    default: m.RechartsPage,
  })),
);
export const DashboardExample1Page = lazy(() =>
  import("@/features/setttings/pages/dashboards/DashboardExample1Page").then(
    (m) => ({ default: m.DashboardExample1Page }),
  ),
);
