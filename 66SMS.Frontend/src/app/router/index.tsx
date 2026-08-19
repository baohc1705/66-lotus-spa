import { createBrowserRouter, Navigate } from "react-router-dom";
import { HomePage } from "@/features/landing/pages/HomePage";
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from "@/features/auth";
import { AdminLayout } from "@/features/admin/AdminLayout";
import { SettingsLayout } from "@/features/setttings/components/SettingsLayout";
import { ProtectedRoute, WithPageSuspense } from "./routeElements";
import {
  ProfilePage,
  AdminDashboard,
  AdminProfilePage,
  RolePermissionPage,
  BookingPage,
  CashierPage,
  VnPayReturnPage,
  AccountListPage,
  UsersPage,
  StaffListPage,
  StaffServiceListPage,
  StaffAppointmentsPage,
  CustomerListPage,
  MembershipCardListPage,
  MembershipTierListPage,
  ProductListPage,
  ProductCategoryListPage,
  ServiceListPage,
  ServiceCategoryListPage,
  ShiftListPage,
  WorkSchedulePage,
  BookingRoomListPage,
  BookingPositionListPage,
  ConfigAppointmentListPage,
  WalletManagementPage,
  SalonListPage,
  LandingBannerListPage,
  TreatmentCourseListPage,
  InvoiceListPage,
  AttendanceListPage,
  PayrollListPage,
  PayrollStatsPage,
  CertificateTypesPage,
  StaffCertificatesPage,
  PromotionListPage,
  RevenueByDayPage,
  RevenueBySalonPage,
  RevenueByServicePage,
  RevenueByStaffPage,
  SettingsHomePage,
  ButtonsPage,
  DropdownsPage,
  IconsPage,
  BadgesPage,
  CardsPage,
  ListGroupsPage,
  NavigationPage,
  UtilitiesPage,
  TabsPage,
  AccordionsPage,
  NotificationsPage,
  ModalsPage,
  ProgressPage,
  TooltipsPage,
  CarouselPage,
  CalendarPage,
  PaginationPage,
  ScrollablePage,
  MapsPage,
  ControlsPage,
  LayoutsPage,
  ValidationPage,
  RegularPage,
  DataTablePage,
  BoxesPage,
  RechartsPage,
  DashboardExample1Page,
} from "./lazyPages";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/dang-nhap", element: <LoginPage /> },
  { path: "/dang-ky", element: <RegisterPage /> },
  { path: "/quen-mat-khau", element: <ForgotPasswordPage /> },
  { path: "/dat-lai-mat-khau", element: <ResetPasswordPage /> },
  {
    path: "/thanh-toan/vnpay-return",
    element: (
      <WithPageSuspense>
        <VnPayReturnPage />
      </WithPageSuspense>
    ),
  },
  {
    path: "/dat-lich",
    element: (
      <WithPageSuspense>
        <BookingPage />
      </WithPageSuspense>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/dashboard", element: <div className="p-6">Dashboard</div> },
      {
        path: "/tai-khoan",
        element: (
          <WithPageSuspense>
            <UsersPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "/ho-so",
        element: (
          <WithPageSuspense>
            <ProfilePage />
          </WithPageSuspense>
        ),
      },
      {
        path: "/thu-ngan",
        element: (
          <WithPageSuspense>
            <CashierPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: (
              <WithPageSuspense>
                <AdminDashboard />
              </WithPageSuspense>
            ),
          },
          {
            path: "ho-so",
            element: (
              <WithPageSuspense>
                <AdminProfilePage />
              </WithPageSuspense>
            ),
          },
          {
            path: "nhan-vien",
            element: (
              <WithPageSuspense>
                <StaffListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "nhan-vien/dich-vu",
            element: (
              <WithPageSuspense>
                <StaffServiceListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "nhan-vien/lich-hen",
            element: (
              <WithPageSuspense>
                <StaffAppointmentsPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "khach-hang",
            element: (
              <WithPageSuspense>
                <CustomerListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "khach-hang/the-thanh-vien",
            element: (
              <WithPageSuspense>
                <MembershipCardListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "khach-hang/hang-thanh-vien",
            element: (
              <WithPageSuspense>
                <MembershipTierListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "san-pham",
            element: (
              <WithPageSuspense>
                <ProductListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "san-pham/danh-muc",
            element: (
              <WithPageSuspense>
                <ProductCategoryListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "dich-vu",
            element: (
              <WithPageSuspense>
                <ServiceListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "phong-dich-vu",
            element: (
              <WithPageSuspense>
                <BookingRoomListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "phong-dich-vu/vi-tri",
            element: (
              <WithPageSuspense>
                <BookingPositionListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "khung-gio",
            element: <Navigate to="/admin/cau-hinh-dat-lich" replace />,
          },
          {
            path: "cau-hinh-dat-lich",
            element: (
              <WithPageSuspense>
                <ConfigAppointmentListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "dich-vu/danh-muc",
            element: (
              <WithPageSuspense>
                <ServiceCategoryListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "ca-lam-viec",
            element: (
              <WithPageSuspense>
                <ShiftListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "nhan-vien/lich-lam-viec",
            element: (
              <WithPageSuspense>
                <WorkSchedulePage />
              </WithPageSuspense>
            ),
          },
          {
            path: "khach-hang/vi",
            element: (
              <WithPageSuspense>
                <WalletManagementPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "chi-nhanh",
            element: (
              <WithPageSuspense>
                <SalonListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "banner-trang-chu",
            element: (
              <WithPageSuspense>
                <LandingBannerListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "phan-quyen",
            element: (
              <WithPageSuspense>
                <RolePermissionPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "lieu-trinh",
            element: (
              <WithPageSuspense>
                <TreatmentCourseListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "hoa-don",
            element: (
              <WithPageSuspense>
                <InvoiceListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "loai-chung-chi",
            element: (
              <WithPageSuspense>
                <CertificateTypesPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "chung-chi-nhan-vien",
            element: (
              <WithPageSuspense>
                <StaffCertificatesPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "chung-chi-cua-toi",
            element: (
              <WithPageSuspense>
                <StaffCertificatesPage submitMode />
              </WithPageSuspense>
            ),
          },
          {
            path: "cham-cong",
            element: (
              <WithPageSuspense>
                <AttendanceListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "bang-luong",
            element: (
              <WithPageSuspense>
                <PayrollListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "bang-luong/thong-ke",
            element: (
              <WithPageSuspense>
                <PayrollStatsPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "khuyen-mai",
            element: (
              <WithPageSuspense>
                <PromotionListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "tai-khoan",
            element: (
              <WithPageSuspense>
                <AccountListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "bao-cao/doanh-thu/theo-ngay",
            element: (
              <WithPageSuspense>
                <RevenueByDayPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "bao-cao/doanh-thu/theo-chi-nhanh",
            element: (
              <WithPageSuspense>
                <RevenueBySalonPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "bao-cao/doanh-thu/theo-nhan-vien",
            element: (
              <WithPageSuspense>
                <RevenueByStaffPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "bao-cao/doanh-thu/theo-dich-vu",
            element: (
              <WithPageSuspense>
                <RevenueByServicePage />
              </WithPageSuspense>
            ),
          },
          {
            path: "danh-muc-san-pham-v2",
            element: (
              <WithPageSuspense>
                <ProductCategoryListPage />
              </WithPageSuspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "/demo",
    element: <SettingsLayout />,
    children: [
      {
        index: true,
        element: (
          <WithPageSuspense>
            <SettingsHomePage />
          </WithPageSuspense>
        ),
      },
      {
        path: "dashboards/example-1",
        element: (
          <WithPageSuspense>
            <DashboardExample1Page />
          </WithPageSuspense>
        ),
      },
      {
        path: "elements/buttons",
        element: (
          <WithPageSuspense>
            <ButtonsPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "elements/dropdowns",
        element: (
          <WithPageSuspense>
            <DropdownsPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "elements/icons",
        element: (
          <WithPageSuspense>
            <IconsPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "elements/badges",
        element: (
          <WithPageSuspense>
            <BadgesPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "elements/cards",
        element: (
          <WithPageSuspense>
            <CardsPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "elements/list-groups",
        element: (
          <WithPageSuspense>
            <ListGroupsPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "elements/navigation",
        element: (
          <WithPageSuspense>
            <NavigationPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "elements/utilities",
        element: (
          <WithPageSuspense>
            <UtilitiesPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "components/tabs",
        element: (
          <WithPageSuspense>
            <TabsPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "components/accordions",
        element: (
          <WithPageSuspense>
            <AccordionsPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "components/notifications",
        element: (
          <WithPageSuspense>
            <NotificationsPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "components/modals",
        element: (
          <WithPageSuspense>
            <ModalsPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "components/progress",
        element: (
          <WithPageSuspense>
            <ProgressPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "components/tooltips",
        element: (
          <WithPageSuspense>
            <TooltipsPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "components/carousel",
        element: (
          <WithPageSuspense>
            <CarouselPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "components/calendar",
        element: (
          <WithPageSuspense>
            <CalendarPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "components/pagination",
        element: (
          <WithPageSuspense>
            <PaginationPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "components/scrollable",
        element: (
          <WithPageSuspense>
            <ScrollablePage />
          </WithPageSuspense>
        ),
      },
      {
        path: "components/maps",
        element: (
          <WithPageSuspense>
            <MapsPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "forms/controls",
        element: (
          <WithPageSuspense>
            <ControlsPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "forms/layouts",
        element: (
          <WithPageSuspense>
            <LayoutsPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "forms/validation",
        element: (
          <WithPageSuspense>
            <ValidationPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "tables/regular",
        element: (
          <WithPageSuspense>
            <RegularPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "tables/datatable",
        element: (
          <WithPageSuspense>
            <DataTablePage />
          </WithPageSuspense>
        ),
      },
      {
        path: "widgets/boxes",
        element: (
          <WithPageSuspense>
            <BoxesPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "charts/recharts",
        element: (
          <WithPageSuspense>
            <RechartsPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "charts/chartjs",
        element: <Navigate to="/demo/charts/recharts" replace />,
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
