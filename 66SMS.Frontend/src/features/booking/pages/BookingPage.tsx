import { useEffect } from "react";
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

// Các bước đặt lịch. Nếu thêm bước mới: thêm vào đây + thêm currentStep tương ứng bên dưới.
const STEPS = [
  { step: 0, label: "Chi nhánh" },
  { step: 1, label: "Dịch vụ" },
  { step: 2, label: "Thời gian" },
  { step: 3, label: "Thông tin" },
];

export function BookingPage() {
  // currentStep lấy từ store (zustand), dùng chung nhiều component.
  // Nếu sửa số bước mà quên đổi max trong store.nextStep thì bị kẹt.
  const currentStep = useBookingStore((state) => state.currentStep);

  // Mỗi lần đổi bước thì cuộn lên đầu trang cho dễ nhìn form.
  // Nếu bỏ effect này, user phải tự scroll sau khi bấm Tiếp tục.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // Bước 4 = màn hình thành công (sau khi API đặt lịch OK).
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
            {/* Thanh tiến trình các bước */}
            <nav aria-label="Các bước đặt lịch" className="w-full px-5 sm:px-6">
              <div className="relative">
                {/* Đường xám nền */}
                <div
                  className="absolute left-4 right-4 top-4 h-[2px] -translate-y-1/2 bg-warm-300"
                  aria-hidden
                />
                {/* Đường hồng theo bước hiện tại. Công thức dựa vào STEPS.length - 1. */}
                <div
                  className="absolute left-4 top-4 h-[2px] -translate-y-1/2 bg-rose-600 transition-all duration-300"
                  style={{
                    width: `calc((100% - 2rem) * ${currentStep / (STEPS.length - 1)})`,
                  }}
                  aria-hidden
                />

                <ol className="relative z-10 flex w-full justify-between">
                  {STEPS.map((item, index) => {
                    const isActive = currentStep === item.step;
                    const isDone = currentStep > item.step;
                    const isFirst = index === 0;
                    const isLast = index === STEPS.length - 1;

                    let alignClass = "items-center";
                    if (isFirst) alignClass = "items-start";
                    if (isLast) alignClass = "items-end";

                    let circleClass =
                      "border border-warm-300 bg-surface text-warm-600";
                    if (isDone) circleClass = "bg-rose-800 text-white";
                    if (isActive) circleClass = "bg-rose-600 text-white";

                    let labelClass = "text-warm-600";
                    if (isDone) labelClass = "font-medium text-ink";
                    if (isActive) labelClass = "font-semibold text-rose-600";

                    let textAlign = "text-center";
                    if (isFirst) textAlign = "text-left";
                    if (isLast) textAlign = "text-right";

                    return (
                      <li
                        key={item.step}
                        className={`flex w-8 flex-col ${alignClass}`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full font-geist text-sm font-bold transition-colors ${circleClass}`}
                        >
                          {isDone ? (
                            <Check className="h-4 w-4" strokeWidth={2.5} />
                          ) : (
                            item.step + 1
                          )}
                        </div>
                        <span
                          className={`mt-2 whitespace-nowrap font-geist text-xs leading-tight sm:text-xs ${textAlign} ${labelClass}`}
                        >
                          {item.label}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </nav>

            {/* Chỉ hiện 1 bước tại 1 thời điểm. Đổi số ở đây phải khớp STEPS. */}
            {currentStep === 0 && <BookingSalonStep />}
            {currentStep === 1 && <BookingServiceStep />}
            {currentStep === 2 && <BookingTimeStep />}
            {currentStep === 3 && <BookingContactStep />}
          </div>

          {/* Cột phải: tóm tắt + thêm khách + mã KM */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <BookingSummarySidebar />
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
