import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminHeader } from "./components/AdminHeader";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

import { usePermission } from "@/shared/hooks/usePermission";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { MENU_ITEMS } from "./constants/menu";

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { hasRole } = usePermission();
  const user = useAuthStore((s) => s.user);
  const isCustomer = hasRole("Customer");
  const hasAccess = !!user && !isCustomer;

  const [layoutMode, setLayoutMode] = useState<"top-nav" | "sidebar">(() => {
    return (
      (localStorage.getItem("admin_layout_mode") as "top-nav" | "sidebar") ||
      "top-nav"
    );
  });

  const toggleLayoutMode = () => {
    setLayoutMode((prev) => {
      const next = prev === "top-nav" ? "sidebar" : "top-nav";
      localStorage.setItem("admin_layout_mode", next);
      return next;
    });
  };

  // Redirect user không có quyền vào admin
  useEffect(() => {
    if (!hasAccess) {
      navigate("/");
    }
  }, [hasAccess, navigate]);

  // Staff / Receptionist không có Dashboard → redirect về "Lịch hẹn của tôi"
  const isStaffOrReceptionist =
    (hasRole("Staff") || hasRole("Receptionist")) &&
    !hasRole("Admin") &&
    !hasRole("Manager");

  useEffect(() => {
    if (hasAccess && isStaffOrReceptionist && location.pathname === "/admin") {
      navigate("/admin/staff/appointments", { replace: true });
    }
  }, [hasAccess, isStaffOrReceptionist, location.pathname, navigate]);

  let currentTitle = "Tổng quan";
  const allLinks = MENU_ITEMS.flatMap((item) =>
    item.children
      ? item.children.map((c) => ({ path: c.path, label: c.label }))
      : [{ path: item.path!, label: item.label }],
  );
  allLinks.sort((a, b) => b.path.length - a.path.length);

  for (const link of allLinks) {
    if (location.pathname.startsWith(link.path)) {
      currentTitle = link.label;
      if (currentTitle === "Danh sách nhân viên")
        currentTitle = "Quản lý nhân viên";
      if (currentTitle === "Nhân viên") currentTitle = "Quản lý nhân viên";
      if (currentTitle === "Khách hàng") currentTitle = "Quản lý khách hàng";
      if (currentTitle === "Sản phẩm") currentTitle = "Quản lý sản phẩm";
      if (currentTitle === "Danh mục sản phẩm")
        currentTitle = "Quản lý danh mục sản phẩm";
      if (currentTitle === "Phân ca") currentTitle = "Phân ca làm việc";
      if (currentTitle === "Quản lý ca") currentTitle = "Quản lý ca làm việc";
      break;
    }
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="admin-dashboard-container min-h-screen font-sans overflow-clip flex">
      {/* Soft green atmosphere */}
      <div className="fixed top-0 left-0 w-[50vw] h-[50vw] rounded-full bg-adminGreen-100/40 blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 right-0 w-[40vw] h-[40vw] rounded-full bg-adminGold-100/30 blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/3" />

      <AdminSidebar
        isOpen={isSidebarOpen}
        isMobileOpen={isMobileSidebarOpen}
        setMobileOpen={setIsMobileSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        layoutMode={layoutMode}
      />

      <div
        className={cn(
          "flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-500 ease-out z-10",
          layoutMode === "sidebar"
            ? isSidebarOpen
              ? "lg:ml-64"
              : "lg:ml-20"
            : "lg:ml-0",
        )}
      >
        <AdminHeader
          toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          toggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          layoutMode={layoutMode}
          toggleLayoutMode={toggleLayoutMode}
        />

        <main className="flex-1 min-w-0 p-2 overflow-x-hidden flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mx-auto w-full flex-1 flex flex-col min-h-0"
          >
            {layoutMode === "top-nav" && (
              <div className="hidden lg:block mb-4">
                <h1 className="text-xl font-bold text-adminInk tracking-tight">
                  {currentTitle}
                </h1>
                <div className="h-0.5 w-12 bg-adminGold-600 mt-1.5 rounded-full" />
              </div>
            )}
            <Outlet context={{ layoutMode }} />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
