import React from "react";
import { MapPin, Phone, Clock, ChevronRight, Check } from "lucide-react";
import { useBookingStore } from "../stores/bookingStore";
import { useActiveSalons } from "@/features/salons/hooks/useActiveSalons";

export const BookingSalonStep: React.FC = () => {
  const { selectedSalon, selectSalon, nextStep } = useBookingStore();
  const { data: salons = [], isLoading } = useActiveSalons();

  return (
    <div className="lotus-panel flex flex-col gap-5 p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
        <MapPin className="h-5 w-5 text-rose-600" />
        <span>Chọn chi nhánh</span>
      </h3>

      {isLoading ? (
        <div className="py-10 text-center text-sm text-warm-600">
          Đang tải danh sách chi nhánh...
        </div>
      ) : salons.length === 0 ? (
        <div className="py-10 text-center text-sm text-warm-600">
          Hiện không có chi nhánh nào đang hoạt động.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {salons.map((salon) => {
            const isSelected = selectedSalon?.id === salon.id;
            return (
              <div
                key={salon.id}
                onClick={() => selectSalon(salon)}
                className={`overflow-hidden cursor-pointer transition-all border ${
                  isSelected
                    ? "border-2 border-rose-600 bg-rose-50"
                    : "border-warm-100 bg-surface hover:border-rose-200"
                }`}
              >
                <div className="relative">
                  {salon.imageUrl ? (
                    <img
                      src={salon.imageUrl}
                      alt={salon.name}
                      className="w-full h-36 object-cover"
                    />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-rose-600 to-gold-600 flex items-center justify-center">
                      <span className="text-4xl">🌸</span>
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-7 h-7 bg-rose-600 rounded-full flex items-center justify-center shadow-sm">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 bg-surface p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-ink text-sm leading-snug">
                      {salon.name}
                    </h4>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide bg-success-bg text-success-text px-2 py-0.5 rounded-sm">
                      Đang hoạt động
                    </span>
                  </div>

                  {salon.fullAddress && (
                    <div className="flex items-start gap-1.5 text-xs text-warm-600">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{salon.fullAddress}</span>
                    </div>
                  )}

                  {salon.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-warm-600">
                      <Phone className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{salon.phone}</span>
                    </div>
                  )}

                  {salon.workingDays && (
                    <div className="flex items-center gap-1.5 text-xs text-warm-600">
                      <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{salon.workingDays}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={nextStep}
          disabled={!selectedSalon}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
            selectedSalon
              ? "bg-rose-600 text-white hover:bg-rose-500"
              : "bg-warm-50 text-warm-300 cursor-not-allowed"
          }`}
        >
          Tiếp tục: Chọn dịch vụ
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
