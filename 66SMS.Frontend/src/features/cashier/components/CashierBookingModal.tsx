import { useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { useBookingStore } from "@/features/booking/stores/bookingStore";
import { BookingServiceStep } from "@/features/booking/components/BookingServiceStep";
import { BookingTimeStep } from "@/features/booking/components/BookingTimeStep";
import { BookingContactStep } from "@/features/booking/components/BookingContactStep";
import { BookingSummarySidebar } from "@/features/booking/components/BookingSummarySidebar";
// Ensure Button component exists, else update path
import { Button } from "@/shared/components/ui/button";

interface CashierBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CashierBookingModal({
  isOpen,
  onClose,
}: CashierBookingModalProps) {
  const { currentStep, resetBooking } = useBookingStore();

  useEffect(() => {
    if (isOpen) {
      resetBooking();
    }
  }, [isOpen, resetBooking]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6 transition-opacity animate-in fade-in">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-lotus-cream rounded-[24px] shadow-[0_32px_64px_rgba(42,31,26,0.15)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-lotus-gold/20">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-lotus-gold/10 bg-lotus-cream/80 z-10">
          <h2 className="text-xl font-bold text-lotus-deep">
            Thêm Lịch Khách Hàng Mới
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-lotus-gold/20 hover:bg-lotus-gold/10 text-lotus-stone hover:text-lotus-deep transition-all shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar relative bg-lotus-cream">
          {/* Decorative Background */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern
                id="dots-grid-modal"
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1.5" fill="var(--lotus-gold)" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#dots-grid-modal)" />
            </svg>
          </div>

          <div className="relative z-10 h-full">
            {currentStep === 4 ? (
              <div className="flex flex-col items-center justify-center py-20 h-full">
                <div className="w-20 h-20 bg-lotus-primary/10 rounded-full flex items-center justify-center mb-6 border border-lotus-primary/20 shadow-sm">
                  <CheckCircle2 className="w-10 h-10 text-lotus-primary" />
                </div>
                <h3 className="text-2xl font-bold text-lotus-deep mb-2">
                  Đặt Lịch Thành Công!
                </h3>
                <p className="text-lotus-stone text-sm mb-8">
                  Hệ thống đã ghi nhận lịch hẹn mới.
                </p>
                <div className="flex gap-4 mt-4">
                  <Button
                    variant="outline"
                    onClick={resetBooking}
                    className="border-lotus-gold text-lotus-deep hover:bg-lotus-cream"
                  >
                    Tạo thêm lịch mới
                  </Button>
                  <Button
                    onClick={onClose}
                    className="bg-lotus-primary text-white hover:bg-lotus-primary/90 shadow-lotus-primary/20 shadow-md"
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                {/* Left Panel: Steps */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  {currentStep === 1 && <BookingServiceStep />}
                  {currentStep === 2 && <BookingTimeStep />}
                  {currentStep === 3 && <BookingContactStep />}
                </div>

                {/* Right Panel: Summary */}
                <div className="lg:col-span-4 h-full">
                  <BookingSummarySidebar />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
