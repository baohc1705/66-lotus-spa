import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CashierHeader } from "../components/CashierHeader";
import { CashierToolbar } from "../components/CashierToolbar";
import { CashierGrid } from "../components/CashierGrid";
import { CashierInvoiceSidebar } from "../components/CashierInvoiceSidebar";
import type { CashierBooking } from "../types";
import { useCashierData } from "../hooks/useCashier";
import { CashierBookingModal } from "../components/CashierBookingModal";
import { cashierApi } from "../api/cashier.api";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { APPOINTMENT_STATUS } from "@/features/booking/constants/appointment.constants";

export function CashierPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<CashierBooking | null>(
    null,
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const navigate = useNavigate();

  const { hasRole, getEffectiveSalonId } = useAuthStore();
  const isAdmin = hasRole("Admin");
  const isReceptionist = hasRole("Receptionist");

  const salonId = getEffectiveSalonId();
  const { data, isLoading, isError, error, refetch, moveBooking } =
    useCashierData(currentDate, salonId);

  useEffect(() => {
    // Only admin and receptionist can access cashier page
    if (!isAdmin && !isReceptionist) {
      navigate("/");
    }
  }, [isAdmin, isReceptionist, navigate]);

  if (!isAdmin && !isReceptionist) {
    return null;
  }

  const handleAddBooking = () => {
    setIsBookingModalOpen(true);
  };

  const handleBookingClick = (booking: CashierBooking) => {
    setSelectedBooking(booking);
    setIsSidebarOpen(true);
  };

  const handleEmptySlotClick = () => {
    setIsBookingModalOpen(true);
  };

  const handleBookingMove = (
    bookingId: string,
    newStaffId: number,
    newStartTime: string,
  ) => {
    moveBooking(bookingId, newStaffId, newStartTime);
  };

  const handlePay = async (bookingId: string, paymentMethod: string) => {
    if (isPaying) return;

    if (paymentMethod === "vnpay") {
      setIsPaying(true);
      try {
        const response = await cashierApi.createVnPayUrl(bookingId);

        if (response.isSuccess && response.data) {
          window.location.href = response.data;
          return;
        }

        toast.error(
          response.message || "Có lỗi xảy ra khi tạo liên kết thanh toán VNPAY",
        );
      } catch (error) {
        console.error("Error creating VNPAY URL", error);
        toast.error("Lỗi kết nối tới máy chủ");
      } finally {
        setIsPaying(false);
      }
      return;
    }

    setIsPaying(true);
    try {
      const response = await cashierApi.payBooking(bookingId, paymentMethod);

      if (response.isSuccess) {
        toast.success(response.message || "Thanh toán thành công");
        setIsSidebarOpen(false);
        setSelectedBooking(null);
        await refetch();
        return;
      }

      toast.error(response.message || "Thanh toán thất bại");
    } catch (error) {
      console.error("Error paying booking", error);
      toast.error("Lỗi kết nối tới máy chủ");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#FBF7F2] overflow-hidden font-sans text-lotus-deep">
      {/* Decorative Background Elements for Luxury Feel */}
      <div className="absolute top-0 left-0 w-[50vw] h-[50vw] rounded-full bg-lotus-rose/5 blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" />
      <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] rounded-full bg-lotus-gold/5 blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/3 z-0" />

      {/* Standalone POS Header */}
      <CashierHeader />

      {/* Top Toolbar */}
      <CashierToolbar
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onAddBooking={handleAddBooking}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative z-10 border-t border-lotus-gold/10">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-lotus-leaf animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex-1 flex items-center justify-center bg-white/50 backdrop-blur-sm text-lotus-rose text-sm gap-2">
            <span>{error ?? "Không tải được lịch hẹn"}</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="underline text-lotus-deep hover:text-lotus-leaf transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : !data ? (
          <div className="flex-1 flex items-center justify-center bg-white/50 backdrop-blur-sm text-lotus-stone">
            Không thể tải dữ liệu lưới lịch
          </div>
        ) : (
          <CashierGrid
            date={currentDate}
            columns={data.columns}
            bookings={data.bookings}
            onBookingClick={handleBookingClick}
            onEmptySlotClick={handleEmptySlotClick}
            onBookingMove={handleBookingMove}
          />
        )}

        {/* Sliding Sidebar for Cashier / Invoice Details */}
        <CashierInvoiceSidebar
          booking={selectedBooking}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onPay={handlePay}
          onRequestDeposit={async (bookingId) => {
            setIsPaying(true);
            try {
              const res = await cashierApi.updateBookingStatus(
                bookingId,
                APPOINTMENT_STATUS.CONFIRMED,
                "Thu ngân xác nhận lịch — yêu cầu đặt cọc trong 24h",
              );
              if (res.isSuccess) {
                toast.success("Đã xác nhận lịch và yêu cầu khách cọc.");
                setIsSidebarOpen(false);
                setSelectedBooking(null);
                refetch();
              } else {
                toast.error(res.message || "Không thể yêu cầu cọc.");
              }
            } catch {
              toast.error("Lỗi khi kết nối đến máy chủ.");
            } finally {
              setIsPaying(false);
            }
          }}
          isPaying={isPaying}
        />
      </div>

      <CashierBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
