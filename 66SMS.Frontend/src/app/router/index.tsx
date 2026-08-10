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
import { ProtectedRoute } from "./ProtectedRoute";
import { WithPageSuspense } from "./WithPageSuspense";
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
  TimeSlotListPage,
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
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
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
        path: "/users",
        element: (
          <WithPageSuspense>
            <UsersPage />
          </WithPageSuspense>
        ),
      },
      {
        path: "/profile",
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
            path: "profile",
            element: (
              <WithPageSuspense>
                <AdminProfilePage />
              </WithPageSuspense>
            ),
          },
          {
            path: "staff/list",
            element: (
              <WithPageSuspense>
                <StaffListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "staff/appointments",
            element: (
              <WithPageSuspense>
                <StaffAppointmentsPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "customers/list",
            element: (
              <WithPageSuspense>
                <CustomerListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "customers/membership-cards",
            element: (
              <WithPageSuspense>
                <MembershipCardListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "customers/membership-tiers",
            element: (
              <WithPageSuspense>
                <MembershipTierListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "products/list",
            element: (
              <WithPageSuspense>
                <ProductListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "products/categories",
            element: (
              <WithPageSuspense>
                <ProductCategoryListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "services",
            element: (
              <WithPageSuspense>
                <ServiceListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "rooms/list",
            element: (
              <WithPageSuspense>
                <BookingRoomListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "rooms/positions",
            element: (
              <WithPageSuspense>
                <BookingPositionListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "timeslots",
            element: (
              <WithPageSuspense>
                <TimeSlotListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "config-appointments",
            element: (
              <WithPageSuspense>
                <ConfigAppointmentListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "services/categories",
            element: (
              <WithPageSuspense>
                <ServiceCategoryListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "shifts",
            element: (
              <WithPageSuspense>
                <ShiftListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "staff/schedule",
            element: (
              <WithPageSuspense>
                <WorkSchedulePage />
              </WithPageSuspense>
            ),
          },
          {
            path: "customers/wallets",
            element: (
              <WithPageSuspense>
                <WalletManagementPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "salons",
            element: (
              <WithPageSuspense>
                <SalonListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "landing-banners",
            element: (
              <WithPageSuspense>
                <LandingBannerListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "roles",
            element: (
              <WithPageSuspense>
                <RolePermissionPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "treatments",
            element: (
              <WithPageSuspense>
                <TreatmentCourseListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "invoices",
            element: (
              <WithPageSuspense>
                <InvoiceListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "certificate-types",
            element: (
              <WithPageSuspense>
                <CertificateTypesPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "staff-certificates",
            element: (
              <WithPageSuspense>
                <StaffCertificatesPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "attendance",
            element: (
              <WithPageSuspense>
                <AttendanceListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "payroll",
            element: (
              <WithPageSuspense>
                <PayrollListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "payroll/stats",
            element: (
              <WithPageSuspense>
                <PayrollStatsPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "marketing/promotions",
            element: (
              <WithPageSuspense>
                <PromotionListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "accounts",
            element: (
              <WithPageSuspense>
                <AccountListPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "reports/revenue/by-day",
            element: (
              <WithPageSuspense>
                <RevenueByDayPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "reports/revenue/by-salon",
            element: (
              <WithPageSuspense>
                <RevenueBySalonPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "reports/revenue/by-staff",
            element: (
              <WithPageSuspense>
                <RevenueByStaffPage />
              </WithPageSuspense>
            ),
          },
          {
            path: "reports/revenue/by-service",
            element: (
              <WithPageSuspense>
                <RevenueByServicePage />
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
