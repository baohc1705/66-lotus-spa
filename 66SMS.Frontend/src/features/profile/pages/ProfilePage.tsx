import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ProfileSidebar } from "../components/ProfileSidebar";
import { ProfileForm } from "../components/ProfileForm";
import { SecurityForm } from "../components/SecurityForm";
import { ProfileHeaderBanner } from "../components/ProfileHeaderBanner";
import { MembershipPanel } from "../components/MembershipPanel";
import { useProfile } from "../hooks/useProfile";
import { useCustomerDetail } from "@/features/customers/hooks/useCustomers";
import { MyBookingsPanel } from "@/features/booking/components/MyBookingsPanel";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { Navbar } from "@/features/landing/components/Navbar";
import { FooterSection } from "@/features/landing/components/FooterSection";
import { MyWalletPanel } from "../components/MyWalletPanel";
import { Loader2 } from "lucide-react";

const VALID_TABS = [
  "membership",
  "bookings",
  "profile",
  "change-password",
  "wallet",
  "notifications",
] as const;

export function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);
  const { data: profile, isLoading, isError } = useProfile();

  const isCustomer = profile?.profileType === "Customer";
  const customerId =
    isCustomer && profile?.customerInfo?.id ? profile.customerInfo.id : null;

  const { data: customerDetail, isLoading: isCustomerLoading } =
    useCustomerDetail(customerId);

  if (!isLoading && profile && !isCustomer) {
    return <Navigate to="/admin/profile" replace />;
  }

  const activeTab = (() => {
    if (tabFromUrl === "account" || tabFromUrl === "security") {
      return tabFromUrl === "security" ? "change-password" : "profile";
    }
    if (tabFromUrl && (VALID_TABS as readonly string[]).includes(tabFromUrl)) {
      return tabFromUrl;
    }
    return "membership";
  })();

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const renderContent = () => {
    if (isLoading || (activeTab === "profile" && isCustomerLoading)) {
      return (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-7 h-7 text-lotus-rose animate-spin" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-error-text font-medium mb-3">
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
          <div className="text-center py-10">
            <p className="text-lotus-stone mb-3">
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
        {activeTab === "profile" && (
          <ProfileForm
            initialData={profile}
            customerDetail={customerDetail?.data}
          />
        )}
        {activeTab === "change-password" && <SecurityForm />}
        {activeTab === "wallet" && <MyWalletPanel />}
        {activeTab === "notifications" && (
          <div className="text-center py-10">
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
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-lotus-rose/15 to-lotus-gold/15" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar alwaysDark />

        <div className="flex-grow pt-20 pb-10">
          <div className="landing-container space-y-2">
            <ProfileHeaderBanner profile={profile} />

            <div className="flex flex-col lg:flex-row gap-2 items-start">
              <ProfileSidebar
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />

              <div className="flex-1 w-full bg-white rounded-xl shadow-sm">
                <div className="p-4 md:p-5">{renderContent()}</div>
              </div>
            </div>
          </div>
        </div>

        <FooterSection />
      </div>
    </div>
  );
}
