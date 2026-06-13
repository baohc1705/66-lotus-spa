import { createBrowserRouter, Navigate } from "react-router-dom";
import { BookingPage } from "@/features/booking/pages/BookingPage";
import { HomePage } from "@/features/landing/pages/HomePage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { UsersPage } from "@/features/users/pages/UsersPage";
import { ProfilePage } from "@/features/profile";
import { ProtectedRoute } from "./ProtectedRoute";
import {
  AdminLayout,
  AdminDashboard,
  AdminProfilePage,
} from "@/features/admin";
import { StaffListPage } from "@/features/staffs/pages/StaffListPage";
import { StaffAppointmentsPage } from "@/features/staff-appointments";
import { CustomerListPage } from "@/features/customers/pages/CustomerListPage";
import { ProductListPage } from "@/features/products/pages/ProductListPage";
import { ProductCategoryListPage } from "@/features/product_categories/pages/ProductCategoryListPage";
import { ShiftListPage } from "@/features/shifts/pages/ShiftListPage";
import { WorkSchedulePage } from "@/features/schedules/pages/WorkSchedulePage";
import { ServiceCategoryListPage } from "@/features/service_categories/pages/ServiceCategoryListPage";
import { ServiceListPage } from "@/features/services/pages/ServiceListPage";
import { BookingRoomListPage } from "@/features/booking_rooms/pages/BookingRoomListPage";
import { BookingPositionListPage } from "@/features/booking_positions/pages/BookingPositionListPage";
import { TimeSlotListPage } from "@/features/time_slots/pages/TimeSlotListPage";
import { CashierPage } from "@/features/cashier/pages/CashierPage";
import { VnPayReturnPage } from "@/features/cashier/pages/VnPayReturnPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/dat-lich",
    element: <BookingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
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
        path: "/thu-ngan/vnpay-return",
        element: <VnPayReturnPage />,
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
