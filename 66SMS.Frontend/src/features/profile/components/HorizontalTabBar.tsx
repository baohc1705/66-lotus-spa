import { Calendar, User, Wallet, Award, ShieldCheck, Lock } from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface HorizontalTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCustomer: boolean;
}

export function HorizontalTabBar({
  activeTab,
  onTabChange,
  isCustomer,
}: HorizontalTabBarProps) {
  // Only show membership tab for Customers
  const tabs: TabItem[] = [
    ...(isCustomer
      ? [{ id: "membership", label: "Hạng thành viên", icon: Award }]
      : []),
    { id: "bookings", label: "Lịch hẹn", icon: Calendar },
    { id: "wallet", label: "Ví của tôi", icon: Wallet },
    { id: "profile", label: "Thông tin hồ sơ", icon: User },
    { id: "account", label: "Tài khoản", icon: ShieldCheck },
    { id: "change-password", label: "Đổi mật khẩu", icon: Lock },
  ];

  return (
    <div className="w-full bg-white border-x border-b border-warm-100 p-2 shadow-sm rounded-b-2xl mb-4 overflow-hidden">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap outline-none ${
                isActive
                  ? "bg-lotus-rose text-white shadow-sm shadow-lotus-rose/25 scale-[1.02]"
                  : "text-lotus-stone hover:bg-lotus-rose-light hover:text-lotus-rose"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? "text-white" : "text-lotus-stone"}`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
