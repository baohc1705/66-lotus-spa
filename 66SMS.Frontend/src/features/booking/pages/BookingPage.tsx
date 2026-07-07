import React, { useEffect } from "react";
import { Check, ChevronRight } from "lucide-react";
import { useBookingStore } from "../stores/bookingStore";

import { Navbar } from "@/features/landing/components/Navbar";
import { FooterSection } from "@/features/landing/components/FooterSection";

import { BookingSalonStep } from "../components/BookingSalonStep";
import { BookingServiceStep } from "../components/BookingServiceStep";
import { BookingTimeStep } from "../components/BookingTimeStep";
import { BookingContactStep } from "../components/BookingContactStep";
import { BookingSummarySidebar } from "../components/BookingSummarySidebar";
import { BookingSuccessTicket } from "../components/BookingSuccessTicket";

const STEP_CONFIG = [
  { s: 0, label: "Chi nhánh" },
  { s: 1, label: "Dịch vụ" },
  { s: 2, label: "Thời gian" },
  { s: 3, label: "Thông tin" },
];

export const BookingPage: React.FC = () => {
  const { currentStep } = useBookingStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-lotus-cream flex flex-col justify-between">
        <Navbar alwaysDark />
        <main className="flex-1 w-full pt-28 pb-16 flex items-center justify-center p-4">
          <BookingSuccessTicket />
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lotus-cream flex flex-col justify-between">
      <Navbar alwaysDark />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 pt-24 pb-12">
        {/* Header + Stepper */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-lotus-deep font-display leading-tight">
            Đặt lịch hẹn
          </h1>

          <div className="flex items-center gap-4 bg-white rounded-full shadow-lg shadow-lotus-rose-light p-4 self-start lg:self-auto">
            {STEP_CONFIG.map((item, idx) => (
              <div key={item.s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === item.s
                      ? "bg-lotus-rose text-white shadow-sm"
                      : currentStep > item.s
                        ? "bg-lotus-leaf text-white"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {currentStep > item.s ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    item.s + 1
                  )}
                </div>
                <span
                  className={`text-xs hidden sm:inline ${
                    currentStep === item.s
                      ? "text-lotus-deep font-bold"
                      : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
                {idx < 3 && (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-8 flex flex-col gap-4">
            {currentStep === 0 && <BookingSalonStep />}
            {currentStep === 1 && <BookingServiceStep />}
            {currentStep === 2 && <BookingTimeStep />}
            {currentStep === 3 && <BookingContactStep />}
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <BookingSummarySidebar />
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};
