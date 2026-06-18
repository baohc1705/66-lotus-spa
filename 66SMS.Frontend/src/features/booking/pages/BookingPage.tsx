import React, { useEffect } from "react";
import { Sparkles, Check, ChevronRight } from "lucide-react";
import { useBookingStore } from "../stores/bookingStore";

import { Navbar } from "@/features/landing/components/Navbar";
import { FooterSection } from "@/features/landing/components/FooterSection";

import { BookingSalonStep } from "../components/BookingSalonStep";
import { BookingServiceStep } from "../components/BookingServiceStep";
import { BookingTimeStep } from "../components/BookingTimeStep";
import { BookingContactStep } from "../components/BookingContactStep";
import { BookingSummarySidebar } from "../components/BookingSummarySidebar";
import { BookingSuccessTicket } from "../components/BookingSuccessTicket";

export const BookingPage: React.FC = () => {
  const { currentStep } = useBookingStore();

  // Cuộn lên đầu trang mỗi khi chuyển bước
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-lotus-cream flex flex-col justify-between">
        <Navbar alwaysDark />
        <main className="flex-1 w-full pt-28 pb-16 flex items-center justify-center">
          <BookingSuccessTicket />
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-lotus-cream flex flex-col justify-between">
      <Navbar alwaysDark />

      {/* Decorative SVG Dots */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern
            id="dots-grid"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.5" fill="#D4547E" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dots-grid)" />
        </svg>
      </div>

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Dynamic Header & Steps Progress */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-lotus-rose text-sm font-bold uppercase tracking-widest mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Trải nghiệm Hoa Sen Spa</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-lotus-deep font-display leading-tight">
                Đặt Lịch Trực Tuyến
              </h1>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 bg-white border border-lotus-muted/20 rounded-full px-5 py-2.5 shadow-sm max-w-max mx-auto sm:mx-0">
              {[
                { s: 0, label: "Chi nhánh" },
                { s: 1, label: "Dịch vụ" },
                { s: 2, label: "Thời gian" },
                { s: 3, label: "Thông tin" },
              ].map((item, idx) => (
                <div
                  key={item.s}
                  className="flex items-center gap-1.5 sm:gap-2"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      currentStep === item.s
                        ? "bg-lotus-rose text-white ring-4 ring-lotus-rose-light"
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
                    className={`text-xs font-semibold tracking-wide ${
                      currentStep === item.s
                        ? "text-lotus-deep font-bold"
                        : "text-gray-400"
                    }`}
                  >
                    {item.label}
                  </span>
                  {idx < 3 && (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Unified Layout Split Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT PANEL: Interactive Form Content (60%) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {currentStep === 0 && <BookingSalonStep />}
            {currentStep === 1 && <BookingServiceStep />}
            {currentStep === 2 && <BookingTimeStep />}
            {currentStep === 3 && <BookingContactStep />}
          </div>

          {/* RIGHT PANEL: Live Sticky Summary Receipt (40%) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-6">
            <BookingSummarySidebar />
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};
