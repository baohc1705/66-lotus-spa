import {
  CalendarCheck,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import React from "react";
import { useBookingStore } from "../stores/bookingStore";
import { PromotionCodeInput } from "./PromotionCodeInput";

/** Dãy lỗ bấm bán nguyệt liên tiếp trên mép top/bottom */
function TicketPunchRow({ edge }: { edge: "top" | "bottom" }) {
  const holeCount = 15;

  return (
    <div
      className={`absolute left-0 right-0 flex justify-center gap-2 z-10 pointer-events-none px-4 ${
        edge === "top" ? "top-0 -translate-y-1/2" : "bottom-0 translate-y-1/2"
      }`}
      aria-hidden
    >
      {Array.from({ length: holeCount }).map((_, i) => (
        <div
          key={`${edge}-${i}`}
          className="w-4 h-4 rounded-full bg-lotus-cream shadow-sm shrink-0"
        />
      ))}
    </div>
  );
}


function TicketDivider() {
  return <div className="h-px bg-lotus-muted/15" />;
}

export const BookingSummarySidebar: React.FC = () => {
  const {
    guests,
    activeGuestIndex,
    setActiveGuest,
    addGuest,
    removeGuest,
    selectedSalon,
    appliedPromotion,
  } = useBookingStore();

  const total = guests.reduce(
    (sum, g) => sum + (g.selectedService?.sellingPrice || 0),
    0
  );
  const discount = appliedPromotion ? appliedPromotion.discountAmount : 0;
  const finalTotal = Math.max(0, total - discount);
  const deposit = finalTotal * 0.3;

  const formatDateString = (d: Date) => {
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <div className="relative">
      {/* Thân vé */}
      <div className="bg-white shadow-sm relative overflow-visible">
        <TicketPunchRow edge="top" />
        <div className="p-4 pt-5 flex flex-col gap-4">
          {/* Tiêu đề */}
          <div className="text-center pt-1">
            <h3 className="text-sm font-bold text-lotus-rose font-display flex items-center justify-center gap-2 uppercase tracking-wide">
              Chi tiết đặt chỗ
            </h3>
          </div>

          <TicketDivider />

          {/* Khách hàng */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-lotus-deep flex items-center gap-1.5">
                
                Khách hàng
              </p>
              <button
                onClick={addGuest}
                className="flex items-center gap-1 text-[11px] font-bold text-lotus-rose hover:text-lotus-rose/80 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm
              </button>
            </div>

            {guests.map((guest, index) => {
              const isGuestActive = activeGuestIndex === index;
              const sellingPrice = guest.selectedService?.sellingPrice || 0;

              return (
                <div key={guest.id} className="flex flex-col gap-2">
                  <div
                    className={`flex items-center justify-between px-4 py-2.5 rounded-full cursor-pointer border-2 border-lotus-rose transition-all ${
                      isGuestActive
                        ? "bg-lotus-rose/10 shadow-sm"
                        : "bg-lotus-rose/5 shadow-sm hover:shadow-md"
                    }`}
                    onClick={() => setActiveGuest(index)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-lotus-rose/15 flex items-center justify-center">
                        <User className="w-4 h-4 text-lotus-rose" />
                      </div>
                      <span className="text-sm font-bold text-lotus-rose">
                        Khách {index + 1}
                      </span>
                      {sellingPrice > 0 && (
                        <span className="text-xs font-semibold text-lotus-deep">
                          · {sellingPrice.toLocaleString("vi-VN")}đ
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {guests.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeGuest(index);
                          }}
                          className="text-lotus-stone hover:text-red-500 transition-colors p-1"
                          title="Xóa khách này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <ChevronRight
                        className={`w-4 h-4 text-lotus-rose transition-transform ${
                          isGuestActive ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {isGuestActive && (
                    <div className="px-2 flex flex-col gap-3 text-xs text-lotus-deep">
                      {/* Chi nhánh */}
                      {selectedSalon ? (
                        <div className="flex items-center gap-3 bg-lotus-cream/50 rounded-sm p-3 shadow-sm">
                          {selectedSalon.imageUrl ? (
                            <img
                              src={selectedSalon.imageUrl}
                              alt={selectedSalon.name}
                              className="w-10 h-10 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-lotus-rose/10 flex items-center justify-center shrink-0 text-base">
                              🌸
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-lotus-stone mb-0.5">
                              Chi nhánh
                            </p>
                            <div className="font-bold text-lotus-deep truncate">
                              {selectedSalon.name}
                            </div>
                            {selectedSalon.fullAddress && (
                              <div className="text-lotus-stone line-clamp-2 mt-0.5 flex items-start gap-1">
                                <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                                {selectedSalon.fullAddress}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-lotus-stone italic px-2">
                          Chưa chọn chi nhánh
                        </div>
                      )}

                      {/* Dịch vụ */}
                      {guest.selectedService ? (
                        <div className="px-2">
                          <p className="text-[10px] font-bold tracking-wider text-lotus-stone mb-1">
                            Dịch vụ
                          </p>
                          <div className="font-bold line-clamp-1">
                            {guest.selectedService.name}
                          </div>
                          <div className="flex justify-between items-center text-lotus-deep mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-lotus-rose" />
                              {guest.selectedService.durationMins} phút
                            </span>
                            <span className="bg-lotus-rose/10 px-2 py-0.5 rounded-full text-[10px] uppercase">
                              {guest.selectedService.categoryName || "Dịch vụ"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-lotus-stone italic px-2">
                          Chưa chọn dịch vụ
                        </div>
                      )}

                      {/* Thời gian & KTV */}
                      {(guest.selectedDate ||
                        guest.selectedTimeSlot ||
                        guest.selectedTechnician ||
                        guest.selectedPosition) && (
                        <div className="px-2 flex flex-col gap-1.5">
                          {guest.selectedDate && guest.selectedTimeSlot && (
                            <div className="flex justify-between items-center">
                              <span className="text-lotus-stone">Thời gian:</span>
                              <span className="font-bold text-lotus-rose">
                                {guest.selectedTimeSlot.time} ·{" "}
                                {formatDateString(guest.selectedDate)}
                              </span>
                            </div>
                          )}
                          {guest.selectedTechnician && (
                            <div className="flex justify-between items-center">
                              <span className="text-lotus-stone">Kỹ thuật viên:</span>
                              <span className="font-semibold">
                                {guest.selectedTechnician.name}
                              </span>
                            </div>
                          )}
                          {guest.selectedPosition && (
                            <div className="flex justify-between items-center">
                              <span className="text-lotus-stone">Phòng:</span>
                              <span className="font-semibold">
                                {guest.selectedPosition.name}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <TicketDivider />

          {/* Mã khuyến mãi */}
          <PromotionCodeInput variant="ticket" />

          <TicketDivider />

          {/* Tổng tiền */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs text-lotus-stone">
              <span>Số lượng khách:</span>
              <span className="font-bold text-lotus-deep">
                {guests.length} khách
              </span>
            </div>

            <div className="flex justify-between text-xs text-lotus-stone">
              <span>Tổng tiền dịch vụ:</span>
              <span className="font-bold text-lotus-deep">
                {total.toLocaleString("vi-VN")}đ
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                <span>Khuyến mãi:</span>
                <span>-{discount.toLocaleString("vi-VN")}đ</span>
              </div>
            )}

            <div className="flex justify-between items-end pt-1">
              <span className="text-sm font-bold text-lotus-deep uppercase">
                Tổng cộng
              </span>
              <span className="text-2xl font-black text-lotus-rose">
                {finalTotal.toLocaleString("vi-VN")}đ
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-lotus-stone">
              <span>Thanh toán cọc (30%):</span>
              <span className="font-bold text-lotus-deep">
                {deposit.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>

          <TicketDivider />

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: CalendarCheck,
                color: "text-lotus-rose",
                title: "Xác nhận ngay",
                subtitle: "Đặt lịch nhanh chóng",
              },
              {
                icon: RotateCcw,
                color: "text-orange-400",
                title: "Miễn phí hủy",
                subtitle: "Trước 2 giờ",
              },
              {
                icon: ShieldCheck,
                color: "text-lotus-rose",
                title: "Bảo mật tuyệt đối",
                subtitle: "Thông tin của bạn",
              },
            ].map(({ icon: Icon, color, title, subtitle }) => (
              <div
                key={title}
                className="flex flex-col items-center gap-1 text-center"
              >
                <Icon className={`w-5 h-5 ${color}`} />
                <span className="text-[10px] font-bold text-lotus-deep leading-tight">
                  {title}
                </span>
                <span className="text-[9px] text-lotus-stone leading-tight">
                  {subtitle}
                </span>
              </div>
            ))}
          </div>
        </div>

        <TicketPunchRow edge="bottom" />

        <div className="px-4 pb-5 pt-2 text-[10px] text-lotus-stone leading-relaxed text-center flex flex-col gap-0.5">
          <span>Miễn phí hủy lịch trước 2 giờ</span>
          <span>Bảo mật thông tin tuyệt đối</span>
        </div>
      </div>
    </div>
  );
};
