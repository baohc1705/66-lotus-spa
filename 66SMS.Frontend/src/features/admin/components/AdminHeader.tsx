import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Menu, Settings, ShoppingCart, User } from "lucide-react";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { NotificationBell } from "@/features/notifications";
import { BranchSelector } from "@/shared/components/BranchSelector";
import { Logo } from "@/shared/components/Logo";
import { MENU_ITEMS } from "../constants/menu";

type AdminHeaderProps = {
  sidebarClosed: boolean;
  mobileOpen: boolean;
  onToggleSidebar: () => void;
  onToggleMobile: () => void;
};

function getPageTitle(pathname: string): string {
  let currentTitle = "Tổng quan";

  const allLinks = MENU_ITEMS.flatMap((item) =>
    item.children
      ? item.children.map((c) => ({ path: c.path, label: c.label }))
      : [{ path: item.path!, label: item.label }],
  );

  allLinks.sort((a, b) => b.path.length - a.path.length);

  for (const link of allLinks) {
    if (pathname.startsWith(link.path)) {
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

  return currentTitle;
}

function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AdminHeader(props: AdminHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const { user, hasRole } = useAuthStore();
  const isAdmin = hasRole("Admin");
  const isReceptionist = hasRole("Receptionist");
  const logoutMutation = useLogout();
  const pageTitle = getPageTitle(location.pathname);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="app-header z-30 flex h-15 shrink-0 items-center bg-white shadow-sm">
      <div
        className={
          "app-header__logo hidden h-full shrink-0 items-center border-r border-gray-100 " +
          "px-5 transition-all duration-300 md:flex " +
          (props.sidebarClosed ? "w-20 justify-center" : "w-70 justify-between")
        }
      >
        <div className={props.sidebarClosed ? "hidden" : "block"}>
          <Logo variant="dark" size="sm" showTagline={false} />
        </div>
        <button
          type="button"
          onClick={props.onToggleSidebar}
          className={
            "hamburger hamburger--elastic desktop-toggle-nav inline-flex h-8 w-8 items-center " +
            "justify-center rounded text-kit-muted hover:bg-kit-page " +
            (props.sidebarClosed ? "is-active" : "")
          }
          aria-label="Thu gọn sidebar"
          aria-pressed={props.sidebarClosed}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={props.onToggleMobile}
        className={
          "mobile-toggle-nav ml-3 inline-flex h-9 w-9 items-center justify-center rounded-md " +
          "border border-kit text-kit-body hover:bg-kit-page md:hidden " +
          (props.mobileOpen ? "is-active bg-kit-page" : "")
        }
        aria-label="Mở menu"
        aria-pressed={props.mobileOpen}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="app-header__content flex h-full flex-1 items-center gap-3 px-4">
        <h1 className="truncate text-sm font-bold text-kit-heading md:text-base">
          {pageTitle}
        </h1>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="w-36 sm:w-44 shrink-0">
            <BranchSelector variant="light" />
          </div>

          {(isAdmin || isReceptionist) && (
            <Link
              to="/thu-ngan"
              className={
                "inline-flex h-9 items-center gap-1.5 rounded-md border border-kit bg-kit-page " +
                "px-3 text-xs font-medium text-kit-heading no-underline " +
                "hover:border-kit-primary hover:bg-blue-50 hover:text-kit-primary"
              }
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Thu ngân</span>
            </Link>
          )}

          <NotificationBell variant="light" />

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-kit-page"
              aria-label="Menu tài khoản"
            >
              <div className="hidden text-right leading-tight sm:block">
                <div className="text-sm font-semibold text-kit-heading">
                  {user?.username || "Tài khoản"}
                </div>
              </div>
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username || "Avatar"}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-kit-primary">
                  {getInitials(user?.username)}
                </div>
              )}
            </button>

            {isProfileOpen ? (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-2 flex w-52 flex-col gap-0.5 rounded-md border border-kit bg-white p-2 shadow-lg">
                  <div className="mb-1.5 border-b border-kit px-3 py-2 sm:hidden">
                    <p className="text-sm font-semibold text-kit-heading leading-tight">
                      {user?.username || "Tài khoản"}
                    </p>
                  </div>
                  <Link
                    to="/admin/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-kit-body no-underline hover:bg-blue-50 hover:text-kit-primary"
                  >
                    <User className="h-3.5 w-3.5 text-kit-muted" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                  <Link
                    to="/admin/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-kit-body no-underline hover:bg-blue-50 hover:text-kit-primary"
                  >
                    <Settings className="h-3.5 w-3.5 text-kit-muted" />
                    <span>Cài đặt tài khoản</span>
                  </Link>
                  <div className="my-1 h-px bg-kit" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-3.5 w-3.5 opacity-70" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
