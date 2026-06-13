import { useState } from "react";
import { motion } from "motion/react";
import { User, Shield, Wallet, Loader2, Calendar } from "lucide-react";
import { ProfileForm } from "@/features/profile/components/ProfileForm";
import { SecurityForm } from "@/features/profile/components/SecurityForm";
import { MyWalletPanel } from "@/features/profile/components/MyWalletPanel";
import { MyBookingsPanel } from "@/features/booking/components/MyBookingsPanel";
import { useProfile } from "@/features/profile/hooks/useProfile";

const TABS = [
  { id: "profile", label: "Hồ sơ cá nhân", icon: User },
  { id: "bookings", label: "Lịch hẹn của tôi", icon: Calendar },
  { id: "security", label: "Bảo mật", icon: Shield },
  { id: "wallet", label: "Ví của tôi", icon: Wallet },
] as const;

export function AdminProfilePage() {
  const [activeTab, setActiveTab] = useState<string>("profile");
  const { data: profile, isLoading, isError } = useProfile();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-lotus-leaf animate-spin" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="h-[400px] flex flex-col items-center justify-center text-center">
          <p className="text-red-500 font-medium mb-4">
            Không thể tải thông tin tài khoản
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-lotus-leaf font-semibold hover:underline"
          >
            Thử lại
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case "profile":
        return <ProfileForm initialData={profile} />;
      case "bookings":
        return <MyBookingsPanel />;
      case "security":
        return <SecurityForm />;
      case "wallet":
        return <MyWalletPanel />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white/70 backdrop-blur-md rounded-admin border border-stone-200/30 overflow-hidden sticky top-24">
            <div className="p-3">
              <nav className="space-y-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? "bg-lotus-leaf/10 text-lotus-leaf shadow-sm"
                          : "text-lotus-stone hover:bg-white/50 hover:text-lotus-deep"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-lotus-leaf" : "text-lotus-stone/70"
                        }`}
                      />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white/70 backdrop-blur-md rounded-admin border border-stone-200/30 overflow-hidden min-h-[500px]">
            <div className="p-6 md:p-8">{renderContent()}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
