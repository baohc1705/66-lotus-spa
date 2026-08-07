import { useLogout } from "@/features/auth/hooks/useLogout";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { cn } from "@/lib/utils";
import { BranchSelector } from "@/shared/components/BranchSelector";
import { Logo } from "@/shared/components/Logo";
import { NotificationBell } from "@/features/notifications";
import { LogOut, Menu, PanelLeft, PanelTop, Settings, ShoppingCart, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MENU_ITEMS } from "../constants/menu";
import { AdminTopNavbar } from "./AdminTopNavbar";

interface AdminHeaderProps {
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  layoutMode: "top-nav" | "sidebar";
  toggleLayoutMode: () => void;
}

export function AdminHeader({
  toggleMobileSidebar,
  layoutMode,
  toggleLayoutMode,
}: AdminHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, hasRole } = useAuthStore();
  const isAdmin = hasRole("Admin");
  const isReceptionist = hasRole("Receptionist");
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const location = useLocation();

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

  return (
    <header className="admin-header h-12 shadow-md flex items-center justify-between px-2 sm:px-4 sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-2 sm:gap-4 h-full">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden w-8 h-8 rounded-[4px] bg-white/10 text-white flex items-center justify-center hover:bg-adminGreen-700 transition-all duration-300"
        >
          <Menu className="w-4 h-4" />
        </button>

        {layoutMode === "top-nav" && (
          <div className="hidden lg:flex items-center shrink-0 mr-1.5">
            <Logo variant="light" size="sm" showTagline={false} />
          </div>
        )}

        <h1 className={cn(
          "text-sm sm:text-base font-bold text-white ml-1 tracking-tight",
          layoutMode === "sidebar" ? "block" : "lg:hidden"
        )}>
          {currentTitle}
        </h1>

        {layoutMode === "top-nav" && (
          <div className="hidden lg:block h-full">
            <AdminTopNavbar />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="w-36 sm:w-44 shrink-0">
          <BranchSelector />
        </div>

        {(isAdmin || isReceptionist) && (
          <Link
            to="/thu-ngan"
            className="flex items-center gap-1.5 px-3 h-8 rounded-[4px] bg-white/10 text-white border border-white/10 hover:border-white/25 hover:bg-adminGreen-700 transition-all duration-300 font-medium text-xs tracking-wide whitespace-nowrap"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-adminGold-100" />
            <span className="hidden sm:inline">Thu ngân</span>
          </Link>
        )}

        <div className="flex items-center gap-1 ml-0.5">
          <button
            onClick={toggleLayoutMode}
            title={layoutMode === "top-nav" ? "Chuyển sang giao diện Sidebar" : "Chuyển sang giao diện Top-Nav"}
            className="w-8 h-8 rounded-[4px] bg-white/10 text-white border border-white/10 flex items-center justify-center hover:border-white/25 hover:bg-adminGreen-700 transition-all duration-300 relative group"
          >
            {layoutMode === "top-nav" ? (
              <PanelLeft className="w-4 h-4 text-white" />
            ) : (
              <PanelTop className="w-4 h-4 text-white" />
            )}
          </button>

          <NotificationBell />

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 rounded-[4px] bg-white/10 text-white flex items-center justify-center hover:bg-adminGreen-700 hover:shadow-md transition-all duration-300 ml-0.5 border border-white/10 overflow-hidden"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username || "Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-[4px] shadow-[0_12px_30px_rgba(0,0,0,0.12)] border border-adminGray-100 p-2 z-50 flex flex-col gap-0.5"
                  >
                    <div className="px-3 py-2 border-b border-adminGray-100 mb-1.5">
                      <p className="text-sm font-semibold text-adminInk leading-tight">
                        {user?.username || "Tài khoản"}
                      </p>
                      <p className="text-xs text-adminGray-600 truncate mt-0.5 leading-none">
                        {user?.email || ""}
                      </p>
                    </div>
                    <Link
                      to="/admin/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="group flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-xs text-adminInk/85 hover:text-adminGreen-600 hover:bg-adminGreen-50 transition-all duration-300 font-normal"
                    >
                      <User className="w-3.5 h-3.5 text-adminGray-400 group-hover:text-adminGreen-600 group-hover:scale-110 transition-all duration-300" />
                      <span>Hồ sơ cá nhân</span>
                    </Link>
                    <Link
                      to="/admin/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="group flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-xs text-adminInk/85 hover:text-adminGreen-600 hover:bg-adminGreen-50 transition-all duration-300 font-normal"
                    >
                      <Settings className="w-3.5 h-3.5 text-adminGray-400 group-hover:text-adminGreen-600 group-hover:scale-110 transition-all duration-300" />
                      <span>Cài đặt tài khoản</span>
                    </Link>
                    <div className="h-px bg-adminGray-100 my-1" />
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="group flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-xs text-state-danger-text hover:bg-state-danger-bg transition-all duration-300 font-normal w-full text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 text-state-danger-text/60 group-hover:scale-110 transition-all duration-300" />
                      <span>Đăng xuất</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
