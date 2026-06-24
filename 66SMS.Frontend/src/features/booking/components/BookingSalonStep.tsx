import React from "react";
import { MapPin, Phone, Clock, ChevronRight, Check } from "lucide-react";
import { useBookingStore } from "../stores/bookingStore";
import { useActiveSalons } from "@/features/salons/hooks/useActiveSalons";

export const BookingSalonStep: React.FC = () => {
  const { selectedSalon, selectSalon, nextStep } = useBookingStore();
  const { data: salons = [], isLoading } = useActiveSalons();

  return (
    <div className="bg-lotus-surface rounded-3xl p-6 sm:p-8 border border-lotus-muted/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-xl font-bold text-lotus-deep font-display mb-5 flex items-center gap-2 border-b border-lotus-muted/20 pb-3">
        <MapPin className="w-5 h-5 text-lotus-rose" />
        <span>Bước 1: Chọn Chi Nhánh Của Bạn</span>
      </h3>

      {isLoading ? (
        <div className="py-10 text-center text-sm text-lotus-stone">
          Đang tải danh sách chi nhánh...
        </div>
      ) : salons.length === 0 ? (
        <div className="py-10 text-center text-sm text-lotus-stone">
          Hiện không có chi nhánh nào đang hoạt động.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {salons.map((salon) => {
            const isSelected = selectedSalon?.id === salon.id;
            return (
              <div
                key={salon.id}
                onClick={() => selectSalon(salon)}
                className={`border rounded-2xl overflow-hidden cursor-pointer transition-all ${
                  isSelected
                    ? "border-lotus-rose ring-2 ring-lotus-rose/20 shadow-md"
                    : "border-lotus-muted/20 hover:border-lotus-rose-light hover:shadow-sm"
                }`}
              >
                {salon.imageUrl ? (
                  <img
                    src={salon.imageUrl}
                    alt={salon.name}
                    className="w-full h-36 object-cover"
                  />
                ) : (
                  <div className="w-full h-36 bg-gradient-to-br from-lotus-rose/10 to-lotus-gold/10 flex items-center justify-center">
                    <span className="text-4xl">🌸</span>
                  </div>
                )}

                <div className="p-4 relative">
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-lotus-rose rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  <h4 className="font-bold text-lotus-deep text-sm mb-2 pr-8">
                    {salon.name}
                  </h4>

                  {salon.fullAddress && (
                    <div className="flex items-start gap-1.5 text-xs text-lotus-stone mb-1">
                      <MapPin className="w-3.5 h-3.5 text-lotus-rose-light shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{salon.fullAddress}</span>
                    </div>
                  )}

                  {salon.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-lotus-stone mb-1">
                      <Phone className="w-3.5 h-3.5 text-lotus-rose-light shrink-0" />
                      <span>{salon.phone}</span>
                    </div>
                  )}

                  {salon.workingDays && (
                    <div className="flex items-center gap-1.5 text-xs text-lotus-stone">
                      <Clock className="w-3.5 h-3.5 text-lotus-rose-light shrink-0" />
                      <span>{salon.workingDays}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end mt-8 border-t border-lotus-muted/20 pt-5">
        <button
          onClick={nextStep}
          disabled={!selectedSalon}
          className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition-all ${
            selectedSalon
              ? "bg-lotus-rose text-white hover:bg-lotus-rose/90 shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Tiếp tục: Chọn dịch vụ
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
