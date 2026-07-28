import { useAuthStore } from "@/features/auth/stores/authStore";
import { invoiceApi } from "@/features/invoices/api/invoice.api";
import type { InvoiceDto } from "@/features/invoices/types/invoice.types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cashierApi } from "../api/cashier.api";
import { CashierBookingModal } from "../components/CashierBookingModal";
import { CashierGrid } from "../components/CashierGrid";
import { CashierHeader } from "../components/CashierHeader";
import { CashierInvoiceSidebar } from "../components/CashierInvoiceSidebar";
import { CashierPOS } from "../components/CashierPOS";
import { CashierTimeline } from "../components/CashierTimeline";
import { CashierToolbar } from "../components/CashierToolbar";
import { CashierWeeklyView } from "../components/CashierWeeklyView";
import { useCashierData, useCashierWeekly } from "../hooks/useCashier";
import type {
  CashierBooking,
  CashierTimeRange,
  CashierViewMode,
} from "../types";

export function CashierPage() {
  const [activeTab, setActiveTab] = useState<"calendar" | "invoices">(
    "calendar",
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeRange, setTimeRange] = useState<CashierTimeRange>("daily");
  const [selectedBooking, setSelectedBooking] = useState<CashierBooking | null>(
    null,
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [pendingCheckoutInvoice, setPendingCheckoutInvoice] =
    useState<InvoiceDto | null>(null);
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

  // Calculate week range
  const weekStart = new Date(currentDate);
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
  weekStart.setDate(diff);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const dailyQuery = useCashierData(currentDate, salonId);
  const weeklyQuery = useCashierWeekly(weekStart, weekEnd, salonId);

  const { data, isLoading, isError, error, refetch } =
    timeRange === "daily" ? dailyQuery : weeklyQuery;
  const moveBooking = timeRange === "daily" ? dailyQuery.moveBooking : () => {}; // Weekly view might not support D&D initially

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

  const handlePayInvoice = async (booking: CashierBooking) => {
    if (isPaying) return;
    setIsPaying(true);
    try {
      let invoiceId = booking.invoiceId;

      if (!invoiceId) {
        const createRes = await invoiceApi.createFromAppointment(booking.id);
        if (!createRes.isSuccess || !createRes.data) {
          toast.error(
            createRes.message || "Không thể tạo hóa đơn từ lịch hẹn.",
          );
          return;
        }
        invoiceId = createRes.data;
      }

      const detailRes = await invoiceApi.getDetail(invoiceId);
      if (detailRes.isSuccess && detailRes.data) {
        setPendingCheckoutInvoice(detailRes.data);
        setActiveTab("invoices");
        setIsSidebarOpen(false);
        setSelectedBooking(null);
      } else {
        toast.error(detailRes.message || "Không thể tải chi tiết hóa đơn.");
      }
    } catch {
      toast.error("Lỗi kết nối tới máy chủ.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="admin-dashboard-container h-screen w-full flex flex-col bg-adminGray-50 overflow-hidden font-sans text-adminInk relative">
      {/* Decorative Background Elements for Luxury Feel */}
      <div className="absolute top-0 left-0 w-[50vw] h-[50vw] rounded-full bg-adminGreen-600/5 blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" />
      <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] rounded-full bg-adminGold-600/5 blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/3 z-0" />

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
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex min-h-0 min-w-0 w-full overflow-hidden relative z-10 border-t border-adminGray-100">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <Loader2 className="w-8 h-8 text-adminGreen-600 animate-spin" />
              </div>
            ) : isError ? (
              <div className="flex-1 flex items-center justify-center bg-white/50 backdrop-blur-sm text-adminGreen-600 text-sm gap-2">
                <span>{error ?? "Không tải được lịch hẹn"}</span>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="underline text-adminInk hover:text-adminGreen-600 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            ) : !data ? (
              <div className="flex-1 flex items-center justify-center bg-white/50 backdrop-blur-sm text-adminGray-600">
                Không thể tải dữ liệu lưới lịch
              </div>
            ) : timeRange === "weekly" ? (
              <CashierWeeklyView
                startDate={weekStart}
                endDate={weekEnd}
                bookings={data.bookings}
                onBookingClick={handleBookingClick}
                onEmptySlotClick={handleEmptySlotClick}
              />
            ) : viewMode === "grid" ? (
              <CashierGrid
                date={currentDate}
                columns={data.columns}
                bookings={data.bookings}
                onBookingClick={handleBookingClick}
                onEmptySlotClick={handleEmptySlotClick}
                onBookingMove={moveBooking}
              />
            ) : (
              <CashierTimeline
                date={currentDate}
                columns={data.columns}
                bookings={data.bookings}
                onBookingClick={handleBookingClick}
                onEmptySlotClick={handleEmptySlotClick}
                onBookingMove={moveBooking}
              />
            )}
          </div>

          <CashierInvoiceSidebar
            booking={selectedBooking}
            isOpen={isSidebarOpen}
            onClose={() => {
              setIsSidebarOpen(false);
              setSelectedBooking(null);
            }}
            salonId={salonId}
            isPaying={isPaying}
            onPayInvoice={handlePayInvoice}
            onAssignPosition={async (bookingId, positionId) => {
              const res = await cashierApi.assignPosition(bookingId, positionId);
              if (!res.isSuccess) {
                throw new Error(res.message || "Không thể gán vị trí");
              }
              toast.success(res.message || "Đã gán vị trí");
            }}
            onStatusUpdated={async () => {
              setIsSidebarOpen(false);
              setSelectedBooking(null);
              await refetch();
            }}
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
