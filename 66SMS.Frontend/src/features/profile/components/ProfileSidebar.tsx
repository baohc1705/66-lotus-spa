import { User, Wallet, Bell, LogOut, Calendar, Award, Lock } from "lucide-react";
import { useLogout } from "@/features/auth/hooks/useLogout";

interface ProfileSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProfileSidebar({
  activeTab,
  onTabChange,
}: ProfileSidebarProps) {
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const menuItems = [
    { id: "membership", label: "Hạng thành viên", icon: Award },
    { id: "bookings", label: "Lịch hẹn", icon: Calendar },
    { id: "profile", label: "Hồ sơ", icon: User },
    { id: "change-password", label: "Đổi mật khẩu", icon: Lock },
    { id: "wallet", label: "Ví của tôi", icon: Wallet },
    { id: "notifications", label: "Thông báo", icon: Bell },
  ];

  return (
    <div className="w-full lg:w-56 shrink-0">
      <div className="bg-white rounded-xl p-2.5 shadow-sm">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto scrollbar-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 lg:w-full ${
                  isActive
                    ? "bg-lotus-rose-light text-lotus-rose"
                    : "text-warm-600 hover:bg-warm-50 hover:text-ink"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${isActive ? "text-lotus-rose" : "text-warm-400"}`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-2 pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-error-text hover:bg-error-bg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
