import React from "react";
import { Sparkles, Clock, Users, Plus, Trash2, MapPin } from "lucide-react";
import { useBookingStore } from "../stores/bookingStore";

export const BookingSummarySidebar: React.FC = () => {
  const {
    guests,
    activeGuestIndex,
    setActiveGuest,
    addGuest,
    removeGuest,
    selectedSalon,
  } = useBookingStore();

  const total = guests.reduce((sum, g) => sum + (g.selectedService?.sellingPrice || 0), 0);
  const deposit = total * 0.3; // 30% deposit

  const formatDateString = (d: Date) => {
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <div className="bg-lotus-surface rounded-3xl border border-lotus-muted/20 shadow-xl overflow-hidden relative flex flex-col h-full max-h-[800px]">
      <div className="h-2.5 bg-gradient-to-r from-lotus-rose via-lotus-rose-light to-lotus-gold w-full shrink-0"></div>

      <div className="p-4 sm:p-6 flex-1 overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between mb-4 border-b border-lotus-muted/20 pb-2.5">
          <h3 className="text-lg font-bold text-lotus-deep font-display flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-lotus-gold" />
            <span>Chi tiết đặt chỗ</span>
          </h3>
          <button
            onClick={addGuest}
            className="flex items-center gap-1 text-xs font-bold text-lotus-rose bg-lotus-rose/10 hover:bg-lotus-rose/20 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm khách
          </button>
        </div>

        {selectedSalon && (
          <div className="mb-3 pb-3 border-b border-lotus-muted/20 flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-lotus-rose-light shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-lotus-deep">{selectedSalon.name}</div>
              {selectedSalon.fullAddress && (
                <div className="text-[10px] text-lotus-stone line-clamp-1">{selectedSalon.fullAddress}</div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {guests.map((guest, index) => {
            const isGuestActive = activeGuestIndex === index;
            const hasData = guest.selectedService || guest.selectedDate;
            const sellingPrice = guest.selectedService?.sellingPrice || 0;

            return (
              <div
                key={guest.id}
                className={`border rounded-2xl overflow-hidden transition-all ${
                  isGuestActive
                    ? "border-lotus-rose bg-white shadow-sm ring-1 ring-lotus-rose/20"
                    : "border-lotus-muted/20 bg-lotus-cream/30 hover:border-lotus-rose-light"
                }`}
              >
                {/* Guest Header */}
                <div
                  className={`flex items-center justify-between p-3 cursor-pointer select-none ${
                    isGuestActive ? "bg-lotus-rose/5" : ""
                  }`}
                  onClick={() => setActiveGuest(index)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isGuestActive ? "bg-lotus-rose text-white" : "bg-lotus-muted/20 text-lotus-stone"
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`text-sm font-bold ${isGuestActive ? "text-lotus-rose" : "text-lotus-deep"}`}>
                      Khách {index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {sellingPrice > 0 && (
                      <span className="text-xs font-bold text-lotus-deep">
                        {sellingPrice.toLocaleString("vi-VN")}đ
                      </span>
                    )}
                    {guests.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeGuest(index);
                        }}
                        className="text-lotus-stone hover:text-red-500 transition-colors p-1"
                        title="Xóa khách này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Guest Content Details (Only fully show if has data) */}
                {hasData && (
                  <div className="p-3 pt-0 text-xs text-lotus-deep flex flex-col gap-2 mt-1">
                    {guest.selectedService ? (
                      <div>
                        <div className="font-bold text-lotus-deep mb-1 line-clamp-1">{guest.selectedService.name}</div>
                        <div className="flex justify-between items-center text-lotus-stone">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-lotus-rose-light" />
                            {guest.selectedService.durationMins} phút
                          </span>
                          <span className="inline-block bg-lotus-rose/5 px-1.5 py-0.5 rounded border border-lotus-muted/20 text-[9px] uppercase tracking-wide">
                            {guest.selectedService.categoryName || "Dịch vụ"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-lotus-stone text-xs italic">Chưa chọn dịch vụ</div>
                    )}

                    {(guest.selectedDate || guest.selectedTimeSlot || guest.selectedTechnician || guest.selectedPosition) && (
                      <div className="border-t border-lotus-muted/20 pt-2 mt-1 flex flex-col gap-1.5">
                        {guest.selectedDate && guest.selectedTimeSlot && (
                          <div className="flex justify-between items-center">
                            <span className="text-lotus-stone">Thời gian:</span>
                            <span className="font-bold text-lotus-rose bg-lotus-rose/10 px-1.5 py-0.5 rounded text-[11px]">
                              {guest.selectedTimeSlot.time} · {formatDateString(guest.selectedDate)}
                            </span>
                          </div>
                        )}
                        {guest.selectedTechnician && (
                          <div className="flex justify-between items-center">
                            <span className="text-lotus-stone">KTV:</span>
                            <span className="font-semibold">{guest.selectedTechnician.name}</span>
                          </div>
                        )}
                        {guest.selectedPosition && (
                          <div className="flex justify-between items-center">
                            <span className="text-lotus-stone">Phòng:</span>
                            <span className="font-semibold flex items-center gap-1">
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
      </div>

      {/* Footer / Total Sticky */}
      <div className="p-4 sm:p-6 bg-lotus-surface border-t border-lotus-muted/20 shrink-0">
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex justify-between text-xs text-lotus-stone">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5"/> Số lượng khách:</span>
            <span className="font-bold">{guests.length} khách</span>
          </div>
          
          <div className="flex justify-between items-end mt-1 pt-2 border-t border-lotus-muted/20">
            <span className="text-sm font-bold text-lotus-deep">Tổng cộng</span>
            <span className="text-2xl font-black text-lotus-rose">
              {total.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-lotus-stone mt-0.5">
            <span>Thanh toán cọc (30%):</span>
            <span className="font-bold text-lotus-deep">{deposit.toLocaleString("vi-VN")}đ</span>
          </div>
        </div>
      </div>

      <div className="bg-lotus-rose/5 p-3 text-[10px] text-lotus-stone leading-relaxed text-center border-t border-lotus-muted/20 shrink-0">
        Miễn phí hủy lịch trước 2 giờ · Bảo mật thông tin tuyệt đối
      </div>
    </div>
  );
};
