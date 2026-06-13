import { useState } from "react";
import {
  Menu,
  Plus,
  Calendar as CalendarIcon,
  MapPin,
  ReceiptText,
  LogOut,
  User,
  Settings,
  Home,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "@/shared/components/Logo";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useOnlineBookings } from "../hooks/useOnlineBookings";
// import { OnlineBookingsDrawer } from './OnlineBookingsDrawer'

interface CashierHeaderProps {
  activeTab?: "calendar" | "invoices";
}

export function CashierHeader({ activeTab = "calendar" }: CashierHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [, setIsDrawerOpen] = useState(false);
  const { user, hasRole, clearAuth } = useAuthStore();
  const isAdmin = hasRole("Admin");
  const isEmployee = hasRole("Staff");
  const isReceptionist = hasRole("Receptionist");
  const navigate = useNavigate();

  const { data: onlineBookings = [] } = useOnlineBookings();
  const hasPendingBookings = onlineBookings.length > 0;

  const handleLogoutClick = () => {
    clearAuth();
    setIsProfileOpen(false);
    navigate("/login");
  };

  const cashierName = user?.username || "Thu ngân";

  return (
    <header className="h-16 bg-lotus-cream/80 backdrop-blur-xl border-b border-lotus-gold/10 text-lotus-deep flex items-center justify-between px-4 sticky top-0 z-50 shadow-sm">
      {/* Left side: Logo & Tabs */}
      <div className="flex items-center gap-6 h-full">
        {/* Lotus Spa Logo */}
        <div className="mr-4 flex items-center">
          <Logo
            size="sm"
            variant="dark"
            showTagline={true}
            taglineText="Cashier POS"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center h-full gap-1">
          <button
            className={cn(
              "flex items-center gap-2 h-full px-4 font-medium transition-colors border-b-4",
              activeTab === "calendar"
                ? "border-lotus-leaf bg-lotus-leaf/10 text-lotus-leaf"
                : "border-transparent hover:bg-lotus-leaf/5 text-lotus-deep/70 hover:text-lotus-deep",
            )}
          >
            <CalendarIcon className="w-4 h-4" />
            Lịch dịch vụ
          </button>

          <button
            className={cn(
              "flex items-center gap-2 h-full px-4 font-medium transition-colors border-b-4",
              activeTab === "invoices"
                ? "border-lotus-leaf bg-lotus-leaf/10 text-lotus-leaf"
                : "border-transparent hover:bg-lotus-leaf/5 text-lotus-deep/70 hover:text-lotus-deep",
            )}
          >
            <ReceiptText className="w-4 h-4" />
            Hóa đơn
            <div className="ml-1 w-5 h-5 rounded-full bg-lotus-gold text-white flex items-center justify-center transition-colors shadow-sm">
              <Plus className="w-3 h-3 font-bold" />
            </div>
          </button>
        </div>
      </div>

      {/* Right side: Actions & User Info */}
      <div className="flex items-center gap-4 text-sm font-medium">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className={cn(
            "flex items-center gap-1.5 transition-colors relative px-2 py-1 rounded-admin",
            hasPendingBookings
              ? "text-lotus-rose bg-lotus-rose/10 hover:bg-lotus-rose/20 animate-pulse"
              : "hover:text-lotus-leaf text-lotus-deep/80",
          )}
        >
          <CalendarIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Lịch online</span>
          {hasPendingBookings && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-lotus-rose rounded-full shadow-sm"></span>
          )}
        </button>

        <button className="flex items-center gap-1.5 hover:text-lotus-leaf text-lotus-deep/80 transition-colors border-l border-lotus-gold/20 pl-4">
          <MapPin className="w-4 h-4" />
          <span className="hidden lg:inline">Chi nhánh Sen Trắng</span>
        </button>

        <div className="border-l border-lotus-gold/20 pl-4 flex items-center gap-3 relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity focus:outline-none"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs text-lotus-leaf font-medium uppercase tracking-wider">
                Thu ngân
              </div>
              <div className="leading-tight text-lotus-deep font-semibold">
                {cashierName}
              </div>
            </div>
            <div className="w-10 h-10 flex items-center justify-center rounded-admin bg-lotus-leaf text-white border border-lotus-leaf hover:bg-lotus-leaf/90 hover:shadow-lg hover:shadow-lotus-leaf/20 transition-all duration-300">
              <Menu className="w-5 h-5" />
            </div>
          </button>

          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white/90 backdrop-blur-xl rounded-admin shadow-[0_20px_40px_rgba(42,31,26,0.1)] py-2 z-50 border border-lotus-gold/20 text-gray-800 animate-in fade-in zoom-in duration-200">
                <div className="px-5 py-3 border-b border-lotus-gold/10 mb-2">
                  <p className="text-sm font-bold text-lotus-deep">
                    {user?.username || "Tài khoản"}
                  </p>
                  <p className="text-xs text-lotus-stone truncate">
                    {user?.email || ""}
                  </p>
                </div>

                <Link
                  to="/"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-lotus-deep/70 hover:bg-lotus-cream hover:text-lotus-leaf transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Trang chủ
                </Link>

                {(isAdmin || isEmployee || isReceptionist) && (
                  <Link
                    to="/admin"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-lotus-deep/70 hover:bg-lotus-cream hover:text-lotus-leaf transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Trang quản trị
                  </Link>
                )}

                <Link
                  to="/admin/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-lotus-deep/70 hover:bg-lotus-cream hover:text-lotus-leaf transition-colors"
                >
                  <User className="w-4 h-4" />
                  Hồ sơ cá nhân
                </Link>

                <div className="h-px bg-lotus-gold/10 my-2" />

                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-lotus-rose hover:bg-lotus-rose/5 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* <OnlineBookingsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      /> */}
    </header>
  );
}
