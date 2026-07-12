import React, { useEffect } from "react";
import { Check } from "lucide-react";
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
      <div className="landing-page min-h-screen bg-page flex flex-col">
        <Navbar alwaysDark />
        <main className="flex-1 landing-container flex items-center justify-center py-28">
          <BookingSuccessTicket />
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="landing-page min-h-screen bg-page flex flex-col">
      <Navbar alwaysDark />

      <main className="flex-1 landing-container pt-28 pb-16">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-6 lg:col-span-8">
            {/* Stepper — cùng độ rộng + padding với section trái */}
            <nav aria-label="Các bước đặt lịch" className="w-full px-5 sm:px-6">
              <div className="relative">
                {/* Đường nền (inactive) luôn hiện */}
                <div
                  className="absolute left-4 right-4 top-4 h-[2px] -translate-y-1/2 bg-warm-300"
                  aria-hidden
                />
                {/* Đường tiến độ (active/done) */}
                <div
                  className="absolute left-4 top-4 h-[2px] -translate-y-1/2 bg-rose-600 transition-all duration-300"
                  style={{
                    width: `calc((100% - 2rem) * ${currentStep / (STEP_CONFIG.length - 1)})`,
                  }}
                  aria-hidden
                />

                <ol className="relative z-10 flex w-full justify-between">
                  {STEP_CONFIG.map((item, idx) => {
                    const isActive = currentStep === item.s;
                    const isDone = currentStep > item.s;
                    const isFirst = idx === 0;
                    const isLast = idx === STEP_CONFIG.length - 1;

                    return (
                      <li
                        key={item.s}
                        className={`flex w-8 flex-col ${
                          isFirst
                            ? "items-start"
                            : isLast
                              ? "items-end"
                              : "items-center"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full font-geist text-sm font-bold transition-colors ${
                            isDone
                              ? "bg-rose-800 text-white"
                              : isActive
                                ? "bg-rose-600 text-white"
                                : "border border-warm-300 bg-surface text-warm-600"
                          }`}
                        >
                          {isDone ? (
                            <Check className="h-4 w-4" strokeWidth={2.5} />
                          ) : (
                            item.s + 1
                          )}
                        </div>
                        <span
                          className={`mt-2 whitespace-nowrap font-geist text-xs leading-tight sm:text-xs ${
                            isFirst
                              ? "text-left"
                              : isLast
                                ? "text-right"
                                : "text-center"
                          } ${
                            isActive
                              ? "font-semibold text-rose-600"
                              : isDone
                                ? "font-medium text-ink"
                                : "text-warm-600"
                          }`}
                        >
                          {item.label}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </nav>

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
