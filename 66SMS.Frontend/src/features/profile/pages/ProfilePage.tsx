import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ProfileSidebar } from "../components/ProfileSidebar";
import { ProfileForm } from "../components/ProfileForm";
import { SecurityForm } from "../components/SecurityForm";
import { ProfileHeaderBanner } from "../components/ProfileHeaderBanner";
import { HorizontalTabBar } from "../components/HorizontalTabBar";
import { MembershipPanel } from "../components/MembershipPanel";
import { useProfile } from "../hooks/useProfile";
import { MyBookingsPanel } from '@/features/booking/components/MyBookingsPanel'
import { useAuthStore } from "@/features/auth/stores/authStore";
import { Navbar } from "@/features/landing/components/Navbar";
import { FooterSection } from "@/features/landing/components/FooterSection";
import { MyWalletPanel } from "../components/MyWalletPanel";
import { Loader2 } from "lucide-react";

const VALID_TABS = [
  "membership",
  "bookings",
  "profile",
  "security",
  "wallet",
  "notifications",
] as const;

export function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);
  const { data: profile, isLoading, isError } = useProfile();
  const [activeTab, setActiveTab] = useState<string>("");

  // Sync active tab state based on URL param or profile type
  useEffect(() => {
    if (tabFromUrl && VALID_TABS.includes(tabFromUrl as any)) {
      setActiveTab(tabFromUrl);
    } else if (profile) {
      setActiveTab(profile.profileType === "Customer" ? "membership" : "profile");
    }
  }, [profile, tabFromUrl]);

  // Update search param when active tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const isCustomer = profile?.profileType === "Customer";

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-lotus-rose animate-spin" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="h-full flex flex-col items-center justify-center py-20 text-center">
          <p className="text-red-500 font-medium mb-4">
            Không thể tải thông tin tài khoản
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-lotus-rose font-semibold hover:underline"
          >
            Thử lại
          </button>
        </div>
      );
    }

    if (activeTab === "bookings") {
      if (!isAuthenticated) {
        return (
          <div className="text-center py-16">
            <p className="text-lotus-stone mb-4">
              Đăng nhập để xem các lịch hẹn đã đặt trên tài khoản của bạn.
            </p>
            <Link
              to="/dang-nhap"
              className="text-lotus-rose font-semibold hover:underline"
            >
              Đăng nhập
            </Link>
          </div>
        );
      }
      return <MyBookingsPanel />;
    }

    return (
      <>
        {activeTab === "membership" && <MembershipPanel profile={profile} />}
        {activeTab === "profile" && <ProfileForm initialData={profile} />}
        {activeTab === "security" && <SecurityForm />}
        {activeTab === "wallet" && <MyWalletPanel />}
        {activeTab === "notifications" && (
          <div className="text-center py-20">
            <p className="text-lotus-stone">
              Tính năng thông báo đang được phát triển...
            </p>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen relative bg-lotus-cream overflow-hidden">
      {/* Radiant Gradient (Cánh sen sang Nhị sen từ trên xuống) */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-lotus-rose/15 to-lotus-gold/15" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar alwaysDark />

        <div className="flex-grow pt-28 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header Banner */}
            <ProfileHeaderBanner profile={profile} />

            {/* Horizontal Navigation Tab Bar */}
            <HorizontalTabBar 
              activeTab={activeTab} 
              onTabChange={handleTabChange} 
              isCustomer={isCustomer}
            />

            {/* Main content Area: Sidebar + Content Panel */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar (Vertical Menu - stays visible on desktop, tab-sync is automatically handled) */}
              <ProfileSidebar 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
                isCustomer={isCustomer}
              />

              {/* Main Content Area */}
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[500px] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-lotus-rose/80 via-lotus-rose/70 to-lotus-gold/80" />
                <div className="p-6 md:p-8">
                  {renderContent()}
                </div>
              </div>
            </div>

          </div>
        </div>

        <FooterSection />
      </div>
    </div>
  );
}
