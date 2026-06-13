import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ProfileSidebar } from "../components/ProfileSidebar";
import { ProfileForm } from "../components/ProfileForm";
import { SecurityForm } from "../components/SecurityForm";
import { useProfile } from "../hooks/useProfile";
import { MyBookingsPanel } from '@/features/booking/components/MyBookingsPanel'
import { useAuthStore } from "@/features/auth/stores/authStore";
import { Navbar } from "@/features/landing/components/Navbar";
import { FooterSection } from "@/features/landing/components/FooterSection";
import { MyWalletPanel } from "../components/MyWalletPanel";
import { Loader2 } from "lucide-react";

const VALID_TABS = [
  "bookings",
  "profile",
  "security",
  "wallet",
  "notifications",
] as const;

export function ProfilePage() {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const initialTab =
    tabFromUrl && VALID_TABS.includes(tabFromUrl as (typeof VALID_TABS)[number])
      ? tabFromUrl
      : "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);
  const { data: profile, isLoading, isError } = useProfile();

  const renderContent = () => {
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

    return (
      <>
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
      
      <div className="relative z-10">
        <Navbar alwaysDark />

        {/* Hero Header */}
        <div className="pt-32 pb-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-lotus-rose/20 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-lotus-gold/20 rounded-full blur-[80px] -ml-48 -mb-48" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <h1
              className="text-4xl md:text-5xl font-bold text-lotus-deep mb-4"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Tài khoản của tôi
            </h1>
          <p className="text-lotus-stone max-w-2xl">
            Quản lý thông tin cá nhân, bảo mật và các tùy chọn trải nghiệm của
            bạn tại Hoa Sen Spa.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-20 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-b-2xl rounded-t-none border border-gray-100 shadow-sm min-h-[500px] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-lotus-rose/80 via-lotus-rose/70 to-lotus-gold/80" />
            <div className="p-6 md:p-10">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
      </div>
    </div>
  );
}
