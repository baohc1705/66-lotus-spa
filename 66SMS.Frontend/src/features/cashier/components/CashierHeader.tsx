import {
  Menu,
  MapPin,
  LogOut,
  User,
  Settings,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/shared/components/Logo";
import { BranchSelector } from "@/shared/components/BranchSelector";
import { TabNav } from "@/shared/components/Tabs";
import { Dropdown, type DropdownItem } from "@/shared/elements/Dropdown";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useActiveSalons } from "@/features/salons/hooks/useActiveSalons";
import { NotificationBell } from "@/features/notifications";

interface CashierHeaderProps {
  activeTab?: "calendar" | "invoices";
  onTabChange?: (tab: "calendar" | "invoices") => void;
}

export function CashierHeader({
  activeTab = "calendar",
  onTabChange,
}: CashierHeaderProps) {
  const navigate = useNavigate();
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
      ? "Chi nhánh #" + salonId
      : "Tất cả chi nhánh";

  const cashierName = user?.username || "Thu ngân";

  const profileItems: DropdownItem[] = [
    {
      type: "header",
      label: user?.username || "Tài khoản",
    },
    {
      type: "item",
      label: "Trang chủ",
      icon: <Home className="h-3.5 w-3.5" />,
      onClick: () => navigate("/"),
    },
  ];

  if (isAdmin || isEmployee || isReceptionist) {
    profileItems.push({
      type: "item",
      label: "Trang quản trị",
      icon: <Settings className="h-3.5 w-3.5" />,
      onClick: () => navigate("/admin"),
    });
  }

  profileItems.push(
    {
      type: "item",
      label: "Hồ sơ cá nhân",
      icon: <User className="h-3.5 w-3.5" />,
      onClick: () => navigate("/admin/profile"),
    },
    { type: "divider" },
    {
      type: "item",
      label: "Đăng xuất",
      icon: <LogOut className="h-3.5 w-3.5" />,
      danger: true,
      onClick: () => logoutMutation.mutate(),
    },
  );

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-kit-dark px-4 font-sans text-kit-white shadow-md">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex shrink-0 items-center">
          <Logo size="md" variant="light" showTagline taglineText="Cashier POS" />
        </div>

        <TabNav
          className="mb-0"
          variant="btn-outline-primary"
          activeId={activeTab}
          onChange={(id) => {
            if (id === "calendar" || id === "invoices") {
              onTabChange?.(id);
            }
          }}
          items={[
            { id: "calendar", label: "Lịch dịch vụ" },
            { id: "invoices", label: "Hóa đơn" },
          ]}
        />
      </div>

      <div className="flex shrink-0 items-center gap-2 text-xs font-medium">
        {isAdmin ? (
          <div className="w-36 min-w-0 shrink-0 border-l border-white/20 pl-2.5 sm:w-40 md:w-44">
            <BranchSelector />
          </div>
        ) : (
          <div className="flex items-center gap-1 whitespace-nowrap border-l border-white/20 pl-2.5 text-xs text-white/90">
            <MapPin className="h-3.5 w-3.5 text-kit-info" />
            <span className="hidden max-w-40 truncate lg:inline">
              {salonLabel}
            </span>
          </div>
        )}

        <div className="flex items-center border-l border-white/20 pl-2.5">
          <NotificationBell />
        </div>

        <div className="flex items-center gap-2 border-l border-white/20 pl-2.5">
          <div className="hidden text-right sm:block">
            <div className="text-2xs font-bold uppercase tracking-wider text-white/70">
              Thu ngân
            </div>
            <div className="whitespace-nowrap text-xs font-bold leading-none text-kit-white">
              {cashierName}
            </div>
          </div>
          <Dropdown
            className="mb-0 mr-0"
            variant="outline-light"
            size="sm"
            menuAlign="right"
            items={profileItems}
            trigger={
              <span className="inline-flex h-8 w-8 items-center justify-center rounded border border-white/20 bg-white/10 text-kit-white">
                <Menu className="h-4 w-4" />
              </span>
            }
          />
        </div>
      </div>
    </header>
  );
}
