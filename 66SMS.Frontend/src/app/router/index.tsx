import { createBrowserRouter, Navigate } from "react-router-dom";
import { HomePage } from "@/features/landing/pages/HomePage";
import { ProfilePage } from "@/features/profile";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminLayout, AdminDashboard, AdminProfilePage } from "@/features/admin";
import { LoginPage, RegisterPage } from "@/features/auth";
import RolePermissionPage from "@/features/auth/pages/RolePermissionPage";
import { BookingPage } from "@/features/booking";
import { CashierPage, VnPayReturnPage } from "@/features/cashier";
import { UsersPage } from "@/features/users";
import { StaffListPage } from "@/features/staffs";
import { StaffAppointmentsPage } from "@/features/staff_appointments";
import { CustomerListPage, MembershipCardListPage, MembershipTierListPage } from "@/features/customers";
import { ProductListPage } from "@/features/products";
import { ProductCategoryListPage } from "@/features/product_categories";
import { ServiceListPage } from "@/features/services";
import { ServiceCategoryListPage } from "@/features/service_categories";
import { ShiftListPage } from "@/features/shifts";
import { WorkSchedulePage } from "@/features/schedules";
import { BookingRoomListPage } from "@/features/booking_rooms";
import { BookingPositionListPage } from "@/features/booking_positions";
import { TimeSlotListPage } from "@/features/time_slots";
import { WalletManagementPage } from "@/features/wallet";
import { SalonListPage } from "@/features/salons";
import { TreatmentCourseListPage } from "@/features/treatment_courses";
import { InvoiceListPage } from "@/features/invoices";
import { AttendanceListPage } from "@/features/attendance";
import { PayrollListPage } from "@/features/payroll";
import { CertificateTypesPage, StaffCertificatesPage } from "@/features/certificates";
import { PromotionListPage } from "@/features/promotions";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/thanh-toan/vnpay-return",
    element: <VnPayReturnPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dat-lich",
        element: <BookingPage />,
      },
      {
        path: "/dashboard",
        element: <div className="p-6">Dashboard</div>,
      },
      {
        path: "/users",
        element: <UsersPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/thu-ngan",
        element: <CashierPage />,
      },
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: "profile",
            element: <AdminProfilePage />,
          },
          {
            path: "staff/list",
            element: <StaffListPage />,
          },
          {
            path: "staff/appointments",
            element: <StaffAppointmentsPage />,
          },
          {
            path: "customers/list",
            element: <CustomerListPage />,
          },
          {
            path: "customers/membership-cards",
            element: <MembershipCardListPage />,
          },
          {
            path: "customers/membership-tiers",
            element: <MembershipTierListPage />,
          },
          {
            path: "products/list",
            element: <ProductListPage />,
          },
          {
            path: "products/categories",
            element: <ProductCategoryListPage />,
          },
          {
            path: "services",
            element: <ServiceListPage />,
          },
          {
            path: "rooms/list",
            element: <BookingRoomListPage />,
          },
          {
            path: "rooms/positions",
            element: <BookingPositionListPage />,
          },
          {
            path: "timeslots",
            element: <TimeSlotListPage />,
          },
          {
            path: "services/categories",
            element: <ServiceCategoryListPage />,
          },
          {
            path: "shifts",
            element: <ShiftListPage />,
          },
          {
            path: "staff/schedule",
            element: <WorkSchedulePage />,
          },
          {
            path: "customers/wallets",
            element: <WalletManagementPage />,
          },
          {
            path: "salons",
            element: <SalonListPage />,
          },
          {
            path: "roles",
            element: <RolePermissionPage />,
          },
          {
            path: "treatments",
            element: <TreatmentCourseListPage />,
          },
          {
            path: "invoices",
            element: <InvoiceListPage />,
          },
          {
            path: "certificate-types",
            element: <CertificateTypesPage />,
          },
          {
            path: "staff-certificates",
            element: <StaffCertificatesPage />,
          },
          {
            path: "attendance",
            element: <AttendanceListPage />,
          },
          {
            path: "payroll",
            element: <PayrollListPage />,
          },
          {
            path: "marketing/promotions",
            element: <PromotionListPage />,
          },
          // Placeholders for other admin routes
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
