import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { invoiceApi } from "@/features/invoices/api/invoice.api";
import type { InvoiceDto } from "@/features/invoices/types/invoice.types";
import { toast } from "@/shared/components/kitToast";
import { cashierApi } from "../api/cashier.api";
import { CashierBookingModal } from "../components/CashierBookingModal";
import { CashierCalendar } from "../components/CashierCalendar";
import { CashierHeader } from "../components/CashierHeader";
import { CashierInvoiceSidebar } from "../components/CashierInvoiceSidebar";
import { CashierPOS } from "../components/CashierPOS";
import { PositionAvailabilityDialog } from "../components/PositionAvailabilityDialog";
import { StaffAvailabilityDialog } from "../components/StaffAvailabilityDialog";
import { useCashierData, useCashierWeekly } from "../hooks/useCashier";
import type { CashierBooking } from "../types";
import {
  getIsoWeekStart,
  getMonthRange,
  type CashierCalendarView,
} from "../utils/cashierCalendar.utils";

export function CashierPage() {
  const [activeTab, setActiveTab] = useState<"calendar" | "invoices">(
    "calendar",
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CashierCalendarView>("day");
  const [selectedBooking, setSelectedBooking] = useState<CashierBooking | null>(
    null,
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [staffAvailOpen, setStaffAvailOpen] = useState(false);
  const [positionAvailOpen, setPositionAvailOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [pendingCheckoutInvoice, setPendingCheckoutInvoice] =
    useState<InvoiceDto | null>(null);

  const { hasRole, getEffectiveSalonId } = useAuthStore();
  const isAdmin = hasRole("Admin");
  const isReceptionist = hasRole("Receptionist");
  const salonId = getEffectiveSalonId();

  const weekStart = getIsoWeekStart(currentDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const monthRange = getMonthRange(currentDate);

  let rangeStart = weekStart;
  let rangeEnd = weekEnd;
  if (viewMode === "month") {
    rangeStart = monthRange.start;
    rangeEnd = monthRange.end;
  }

  const dailyQuery = useCashierData(currentDate, salonId, viewMode === "day");
  const rangeQuery = useCashierWeekly(
    rangeStart,
    rangeEnd,
    salonId,
    viewMode !== "day",
  );

  const calendarQuery = viewMode === "day" ? dailyQuery : rangeQuery;

  useEffect(() => {
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
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-kit-page font-sans text-sm text-kit-body">
      <CashierHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "invoices" ? (
        <CashierPOS
          checkoutInvoice={pendingCheckoutInvoice}
          onClearCheckoutInvoice={() => setPendingCheckoutInvoice(null)}
        />
      ) : (
        <>
          <div className="relative z-10 flex min-h-0 min-w-0 w-full flex-1 overflow-hidden p-2">
            <CashierCalendar
              date={currentDate}
              viewMode={viewMode}
              columns={calendarQuery.data?.columns ?? []}
              bookings={calendarQuery.data?.bookings ?? []}
              isLoading={calendarQuery.isLoading}
              isError={calendarQuery.isError}
              errorMessage={calendarQuery.error}
              onDateChange={setCurrentDate}
              onViewChange={setViewMode}
              onBookingClick={handleBookingClick}
              onEmptySlotClick={handleAddBooking}
              onRetry={() => calendarQuery.refetch()}
              onAddBooking={handleAddBooking}
              onOpenStaffAvailability={() => setStaffAvailOpen(true)}
              onOpenPositionAvailability={() => setPositionAvailOpen(true)}
            />
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
              const res = await cashierApi.assignPosition(
                bookingId,
                positionId,
              );
              if (!res.isSuccess) {
                throw new Error(res.message || "Không thể gán vị trí");
              }
            }}
            onAssignStaff={async (bookingId, staffId) => {
              const res = await cashierApi.assignStaff(bookingId, staffId);
              if (!res.isSuccess) {
                throw new Error(res.message || "Không thể đổi nhân viên");
              }
            }}
            onStatusUpdated={async () => {
              setIsSidebarOpen(false);
              setSelectedBooking(null);
              await calendarQuery.refetch();
            }}
          />

          <CashierBookingModal
            isOpen={isBookingModalOpen}
            onClose={() => {
              setIsBookingModalOpen(false);
              calendarQuery.refetch();
            }}
          />

          <StaffAvailabilityDialog
            open={staffAvailOpen}
            onOpenChange={setStaffAvailOpen}
            currentDate={currentDate}
            salonId={salonId}
          />

          <PositionAvailabilityDialog
            open={positionAvailOpen}
            onOpenChange={setPositionAvailOpen}
            currentDate={currentDate}
            salonId={salonId}
          />
        </>
      )}
    </div>
  );
}
