import { createBrowserRouter, Navigate } from "react-router-dom";
import { HomePage } from "@/features/landing/pages/HomePage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { UsersPage } from "@/features/users/pages/UsersPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminLayout, AdminDashboard } from "@/features/admin";
import { EmployeeListPage } from "@/features/employees/pages/EmployeeListPage";
import { CustomerListPage } from "@/features/customers/pages/CustomerListPage";
import { ProductListPage } from "@/features/products/pages/ProductListPage";
import { ProductCategoryListPage } from "@/features/product_categories/pages/ProductCategoryListPage";
import { ShiftListPage } from "@/features/shifts/pages/ShiftListPage";
import { WorkSchedulePage } from "@/features/schedules/pages/WorkSchedulePage";
import { ServiceCategoryListPage } from "@/features/service_categories/pages/ServiceCategoryListPage";
import { ServiceListPage } from "@/features/services/pages/ServiceListPage";
import { BookingRoomListPage } from "@/features/booking_rooms/pages/BookingRoomListPage";
import { BookingPositionListPage } from "@/features/booking_positions/pages/BookingPositionListPage";

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
        path: "/admin",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: "staff/list",
            element: <EmployeeListPage />,
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
