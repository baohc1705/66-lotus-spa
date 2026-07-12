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
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "@/shared/components/Logo";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useOnlineBookings } from "../hooks/useOnlineBookings";
import { useActiveSalons } from "@/features/salons/hooks/useActiveSalons";
import { BranchSelector } from "@/shared/components/BranchSelector";
// import { OnlineBookingsDrawer } from './OnlineBookingsDrawer'

interface CashierHeaderProps {
  activeTab?: "calendar" | "invoices";
  onTabChange?: (tab: "calendar" | "invoices") => void;
}

export function CashierHeader({ activeTab = "calendar", onTabChange }: CashierHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [, setIsDrawerOpen] = useState(false);
  const { user, hasRole, getEffectiveSalonId } = useAuthStore();
  const isAdmin = hasRole("Admin");
  const isEmployee = hasRole("Staff");
  const isReceptionist = hasRole("Receptionist");
  const logoutMutation = useLogout();

  const salonId = getEffectiveSalonId();
  const { data: salons = [] } = useActiveSalons();
  const activeSalon = salons.find((s) => s.id === salonId);
  const salonLabel = activeSalon
    ? activeSalon.name
    : salonId
      ? `Chi nhánh #${salonId}`
      : "Tất cả chi nhánh";

  const { data: onlineBookings = [] } = useOnlineBookings(salonId);
  const hasPendingBookings = onlineBookings.length > 0;

  const handleLogoutClick = () => {
    setIsProfileOpen(false);
    logoutMutation.mutate();
  };

  const cashierName = user?.username || "Thu ngân";

  return (
    <header className="lotus-cashier-header h-15 py-3 border-b border-adminGreen-900/40 text-white flex items-center justify-between px-4 sticky top-0 z-50 shadow-md font-sans">
      {/* Left side: Logo & Tabs */}
      <div className="flex items-center gap-4 h-full">
        {/* Lotus Spa Logo */}
        <div className="mr-3 flex items-center scale-90 origin-left">
          <Logo
            size="md"
            //variant="light"
            showTagline={true}
            taglineText="Cashier POS"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center h-full gap-0.5">
          <button
            onClick={() => onTabChange?.("calendar")}
            className={cn(
              "flex items-center gap-1.5 h-full px-2.5 text-xs font-semibold transition-colors border-b-2 whitespace-nowrap",
              activeTab === "calendar"
                ? "border-adminGreen-600 bg-white/10 text-white"
                : "border-transparent hover:bg-white/5 text-white/70 hover:text-white",
            )}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Lịch dịch vụ
          </button>

          <button
            onClick={() => onTabChange?.("invoices")}
            className={cn(
              "flex items-center gap-1.5 h-full px-2.5 text-xs font-semibold transition-colors border-b-2 whitespace-nowrap",
              activeTab === "invoices"
                ? "border-adminGreen-600 bg-white/10 text-white"
                : "border-transparent hover:bg-white/5 text-white/70 hover:text-white",
            )}
          >
            <ReceiptText className="w-3.5 h-3.5" />
            Hóa đơn
            <div className="ml-0.5 w-4 h-4 rounded-[3px] bg-adminGold-600 text-white flex items-center justify-center transition-colors shadow-sm">
              <Plus className="w-2.5 h-2.5 font-bold" />
            </div>
          </button>
        </div>
      </div>

      {/* Right side: Actions & User Info */}
      <div className="flex items-center gap-2.5 text-xs font-medium">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className={cn(
            "flex items-center gap-1.5 transition-colors relative px-2 py-1 rounded-[3px] whitespace-nowrap",
            hasPendingBookings
              ? "text-adminGreen-600 bg-adminGreen-600/10 hover:bg-adminGreen-600/20 animate-pulse"
              : "hover:text-white text-white/80",
          )}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Lịch online</span>
          {hasPendingBookings && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-adminGreen-600 rounded-full shadow-sm"></span>
          )}
        </button>

        {isAdmin ? (
          <div className="w-36 sm:w-40 md:w-44 shrink-0 border-l border-white/20 pl-2.5">
            <BranchSelector />
          </div>
        ) : (
          <button className="flex items-center gap-1 hover:text-white text-white/80 transition-colors border-l border-white/20 pl-2.5 text-xs whitespace-nowrap">
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{salonLabel}</span>
          </button>
        )}

        <div className="border-l border-white/20 pl-2.5 flex items-center gap-2 relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 text-left hover:opacity-90 transition-opacity focus:outline-none"
          >
            <div className="text-right hidden sm:block">
              <div className="text-2xs text-white/60 font-bold uppercase tracking-wider">
                Thu ngân
              </div>
              <div className="leading-none text-white font-bold text-xs whitespace-nowrap">
                {cashierName}
              </div>
            </div>
            <div className="w-7 h-7 flex items-center justify-center rounded-[3px] bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:shadow-sm transition-all duration-300">
              <Menu className="w-4 h-4" />
            </div>
          </button>

          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-[3px] shadow-lg py-1.5 z-50 border border-adminGray-100 text-adminInk animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-adminGray-100 mb-1.5">
                  <p className="text-xs font-bold text-adminInk truncate">
                    {user?.username || "Tài khoản"}
                  </p>
                  <p className="text-2xs text-adminGray-600 truncate">
                    {user?.email || ""}
                  </p>
                </div>

                <Link
                  to="/"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-adminInk/70 hover:bg-adminGray-50 hover:text-adminGreen-600 transition-colors whitespace-nowrap"
                >
                  <Home className="w-3.5 h-3.5" />
                  Trang chủ
                </Link>

                {(isAdmin || isEmployee || isReceptionist) && (
                  <Link
                    to="/admin"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-adminInk/70 hover:bg-adminGray-50 hover:text-adminGreen-600 transition-colors whitespace-nowrap"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Trang quản trị
                  </Link>
                )}

                <Link
                  to="/admin/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-adminInk/70 hover:bg-adminGray-50 hover:text-adminGreen-600 transition-colors whitespace-nowrap"
                >
                  <User className="w-3.5 h-3.5" />
                  Hồ sơ cá nhân
                </Link>

                <div className="h-px bg-adminGray-100 my-1.5" />

                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-adminGreen-600 hover:bg-adminGreen-600/5 transition-colors text-left whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5" />
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
