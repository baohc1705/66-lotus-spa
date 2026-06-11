import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Menu,
  ShoppingBag,
  ShoppingCart,
  Bell,
  Settings,
  User,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { MENU_ITEMS } from "../constants/menu";
import { useAuthStore } from "@/features/auth/stores/authStore";

interface AdminHeaderProps {
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
}

export function AdminHeader({
  //toggleSidebar,
  toggleMobileSidebar,
}: AdminHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, hasRole, clearAuth } = useAuthStore();
  const isAdmin = hasRole("Admin");
  const isReceptionist = hasRole("Receptionist");
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/auth/login");
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
      if (currentTitle === "Nhân viên") currentTitle = "Quản lý nhân viên";
      if (currentTitle === "Khách hàng") currentTitle = "Quản lý khách hàng";
      if (currentTitle === "Sản phẩm") currentTitle = "Quản lý sản phẩm";
      if (currentTitle === "Danh mục sản phẩm")
        currentTitle = "Quản lý danh mục sản phẩm";
      break;
    }
  }

  return (
    <header className="h-16 bg-lotus-cream/80 backdrop-blur-xl flex items-center justify-between px-2 sm:px-4 sticky top-0 z-30 transition-all duration-300 border-b border-lotus-gold/10 shadow-sm shadow-lotus-gold/5">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden w-10 h-10 rounded-admin bg-lotus-leaf/5 text-lotus-leaf flex items-center justify-center hover:bg-lotus-leaf hover:text-white transition-all duration-300"
        >
          <Menu className="w-[18px] h-[18px]" />
        </button>

        <h1 className="text-lg sm:text-xl font-bold text-lotus-deep ml-1 sm:ml-2 tracking-tight">
          {currentTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {isAdmin && (
          <button className="flex items-center gap-2 px-4 h-10 rounded-admin bg-white/60 text-lotus-deep border border-lotus-gold/20 hover:border-lotus-gold hover:bg-lotus-cream hover:shadow-md transition-all duration-300 font-medium text-xs tracking-wide">
            <ShoppingBag className="w-[1.05rem] h-[1.05rem] text-lotus-gold" />
            <span className="hidden sm:inline">Bán online</span>
            <ChevronDown className="w-3 h-3 opacity-50" />
          </button>
        )}

        {(isAdmin || isReceptionist) && (
          <Link
            to="/thu-ngan"
            className="flex items-center gap-2 px-4 h-10 rounded-admin bg-white/60 text-lotus-deep border border-lotus-gold/20 hover:border-lotus-gold hover:bg-lotus-cream hover:shadow-md transition-all duration-300 font-medium text-xs tracking-wide"
          >
            <ShoppingCart className="w-[1.05rem] h-[1.05rem] text-lotus-leaf" />
            <span className="hidden sm:inline">Thu ngân</span>
          </Link>
        )}

        <div className="flex items-center gap-1.5 ml-1">
          <button className="w-10 h-10 rounded-admin bg-white/60 text-lotus-deep border border-lotus-gold/20 flex items-center justify-center hover:border-lotus-gold hover:bg-lotus-cream hover:shadow-md transition-all duration-300 relative group">
            <Bell className="w-[18px] h-[18px] group-hover:rotate-12 transition-transform" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-lotus-rose border border-white" />
          </button>

          {isAdmin && (
            <button className="hidden sm:flex w-10 h-10 rounded-admin bg-white/60 text-lotus-deep border border-lotus-gold/20 items-center justify-center hover:border-lotus-gold hover:bg-lotus-cream hover:shadow-md transition-all duration-300 group">
              <Settings className="w-[18px] h-[18px] group-hover:rotate-90 transition-transform duration-500" />
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-admin bg-lotus-leaf text-white flex items-center justify-center hover:bg-lotus-leaf/90 hover:shadow-lg hover:shadow-lotus-leaf/20 transition-all duration-300 ml-1 border border-lotus-leaf"
            >
              <User className="w-[18px] h-[18px]" />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-xl rounded-admin shadow-[0_20px_40px_rgba(42,31,26,0.1)] py-3 z-50 border border-lotus-gold/20"
                  >
                    <div className="px-5 py-3 border-b border-lotus-gold/10 mb-2">
                      <p className="text-[15px] font-semibold text-lotus-deep">
                        {user?.username || "Tài khoản"}
                      </p>
                      <p className="text-[13px] text-lotus-stone truncate">
                        {user?.email || ""}
                      </p>
                    </div>
                    <Link
                      to="/admin/profile"
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-lotus-deep/70 hover:bg-lotus-cream hover:text-lotus-leaf transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Hồ sơ cá nhân
                    </Link>
                    <Link
                      to="/admin/profile"
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-lotus-deep/70 hover:bg-lotus-cream hover:text-lotus-leaf transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Cài đặt tài khoản
                    </Link>
                    <div className="h-px bg-lotus-gold/10 my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-lotus-rose hover:bg-lotus-rose/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
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
