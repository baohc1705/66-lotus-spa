import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CashierHeader } from "../components/CashierHeader";
import { CashierToolbar } from "../components/CashierToolbar";
import { CashierGrid } from "../components/CashierGrid";
import { CashierTimeline } from "../components/CashierTimeline";
import { CashierInvoiceSidebar } from "../components/CashierInvoiceSidebar";
import type { CashierBooking, CashierViewMode } from "../types";
import { useCashierData } from "../hooks/useCashier";
import { CashierBookingModal } from "../components/CashierBookingModal";
import { cashierApi } from "../api/cashier.api";
import { invoiceApi } from "@/features/invoices/api/invoice.api";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { APPOINTMENT_STATUS } from "@/features/booking/constants/appointment.constants";
import { CashierPOS } from "../components/CashierPOS";
import type { InvoiceDto } from "@/features/invoices/types/invoice.types";

export function CashierPage() {
  const [activeTab, setActiveTab] = useState<"calendar" | "invoices">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<CashierBooking | null>(
    null,
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [pendingCheckoutInvoice, setPendingCheckoutInvoice] = useState<InvoiceDto | null>(null);
  const [viewMode, setViewMode] = useState<CashierViewMode>(
    () =>
      (localStorage.getItem("cashier-view-mode") as CashierViewMode) ||
      "timeline",
  );

  useEffect(() => {
    localStorage.setItem("cashier-view-mode", viewMode);
  }, [viewMode]);

  const { hasRole, getEffectiveSalonId } = useAuthStore();
  const isAdmin = hasRole("Admin");
  const isReceptionist = hasRole("Receptionist");

  const salonId = getEffectiveSalonId();
  const { data, isLoading, isError, error, refetch, moveBooking } =
    useCashierData(currentDate, salonId);

  useEffect(() => {
    // Only admin and receptionist can access cashier page
    if (!isAdmin && !isReceptionist) {
      window.location.href = "/";
    }
  }, [isAdmin, isReceptionist]);

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
      let invoiceId = selectedBooking?.invoiceId;

      // 1. Tạo hóa đơn nháp từ lịch hẹn (nếu chưa có)
      if (!invoiceId) {
        const createRes = await invoiceApi.createFromAppointment(bookingId);

        if (!createRes.isSuccess || !createRes.data) {
          toast.error(
            createRes.message || "Không thể tạo hóa đơn từ lịch hẹn.",
          );
          setIsPaying(false);
          return;
        }

        invoiceId = createRes.data;
      }

      // 2. Xác định phương thức thanh toán dạng số
      let numericMethod = 1; // Tiền mặt mặc định
      if (paymentMethod === "transfer") {
        numericMethod = 2; // Chuyển khoản
      } else if (paymentMethod === "wallet") {
        numericMethod = 3; // Ví khách hàng
      } else if (paymentMethod === "card") {
        numericMethod = 1; // Thẻ/POS
      }

      const remainingAmount = selectedBooking?.remainingAmount ?? 0;

      // 3. Tiến hành thanh toán hóa đơn
      const payRes = await invoiceApi.payInvoice(
        invoiceId,
        numericMethod,
        remainingAmount,
      );

      if (payRes.isSuccess) {
        toast.success(payRes.message || "Thanh toán thành công");
        setIsSidebarOpen(false);
        setSelectedBooking(null);
        await refetch();
        return;
      }

      toast.error(payRes.message || "Thanh toán hóa đơn thất bại");
    } catch (error) {
      console.error("Error processing payment", error);
      toast.error("Lỗi kết nối tới máy chủ");
    } finally {
      setIsPaying(false);
    }
  };

  const handleRedirectToPOS = async (booking: CashierBooking) => {
    if (isPaying) return;
    setIsPaying(true);
    try {
      let invoiceId = booking.invoiceId;

      // 1. Tạo hóa đơn nháp từ lịch hẹn (nếu chưa có)
      if (!invoiceId) {
        const createRes = await invoiceApi.createFromAppointment(booking.id);
        if (!createRes.isSuccess || !createRes.data) {
          toast.error(
            createRes.message || "Không thể tạo hóa đơn từ lịch hẹn.",
          );
          setIsPaying(false);
          return;
        }
        invoiceId = createRes.data;
      }

      // 2. Tải chi tiết hóa đơn từ backend
      const detailRes = await invoiceApi.getDetail(invoiceId);
      if (detailRes.isSuccess && detailRes.data) {
        setPendingCheckoutInvoice(detailRes.data);
        setActiveTab("invoices");
        setIsSidebarOpen(false);
        setSelectedBooking(null);
      } else {
        toast.error(detailRes.message || "Không thể tải chi tiết hóa đơn.");
      }
    } catch (err) {
      console.error("Lỗi khi chuyển hướng POS", err);
      toast.error("Lỗi kết nối tới máy chủ.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#FBF7F2] overflow-hidden font-sans text-lotus-deep relative">
      {/* Decorative Background Elements for Luxury Feel */}
      <div className="absolute top-0 left-0 w-[50vw] h-[50vw] rounded-full bg-lotus-rose/5 blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" />
      <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] rounded-full bg-lotus-gold/5 blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/3 z-0" />

      {/* Standalone POS Header */}
      <CashierHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "invoices" ? (
        <CashierPOS
          checkoutInvoice={pendingCheckoutInvoice}
          onClearCheckoutInvoice={() => setPendingCheckoutInvoice(null)}
        />
      ) : (
        <>
          {/* Top Toolbar */}
          <CashierToolbar
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onAddBooking={handleAddBooking}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex min-h-0 min-w-0 w-full overflow-hidden relative z-10 border-t border-stone-200">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <Loader2 className="w-8 h-8 text-lotus-primary animate-spin" />
              </div>
            ) : isError ? (
              <div className="flex-1 flex items-center justify-center bg-white/50 backdrop-blur-sm text-lotus-rose text-sm gap-2">
                <span>{error ?? "Không tải được lịch hẹn"}</span>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="underline text-lotus-deep hover:text-lotus-primary transition-colors"
                >
                  Thử lại
                </button>
              </div>
            ) : !data ? (
              <div className="flex-1 flex items-center justify-center bg-white/50 backdrop-blur-sm text-lotus-stone">
                Không thể tải dữ liệu lưới lịch
              </div>
            ) : viewMode === "grid" ? (
              <CashierGrid
                date={currentDate}
                columns={data.columns}
                bookings={data.bookings}
                onBookingClick={handleBookingClick}
                onEmptySlotClick={handleEmptySlotClick}
                onBookingMove={handleBookingMove}
              />
            ) : (
              <CashierTimeline
                date={currentDate}
                columns={data.columns}
                bookings={data.bookings}
                onBookingClick={handleBookingClick}
                onEmptySlotClick={handleEmptySlotClick}
                onBookingMove={handleBookingMove}
              />
            )}
          </div>

          {/* Popup chi tiết hóa đơn — đặt ngoài vùng z-10 để không bị toolbar che */}
          <CashierInvoiceSidebar
            booking={selectedBooking}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onPay={handlePay}
            onRedirectToPOS={handleRedirectToPOS}
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

          <CashierBookingModal
            isOpen={isBookingModalOpen}
            onClose={() => {
              setIsBookingModalOpen(false);
              refetch();
            }}
          />
        </>
      )}
    </div>
  );
}
