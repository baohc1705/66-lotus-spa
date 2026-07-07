import React from "react";
import { MapPin, Phone, Clock, ChevronRight, Check } from "lucide-react";
import { useBookingStore } from "../stores/bookingStore";
import { useActiveSalons } from "@/features/salons/hooks/useActiveSalons";

export const BookingSalonStep: React.FC = () => {
  const { selectedSalon, selectSalon, nextStep } = useBookingStore();
  const { data: salons = [], isLoading } = useActiveSalons();

  return (
    <div className="bg-white rounded-sm shadow-sm p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-bold text-lotus-deep font-display flex items-center gap-2">
        <MapPin className="w-5 h-5 text-lotus-rose" />
        <span>Chọn chi nhánh</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {salons.map((salon) => {
            const isSelected = selectedSalon?.id === salon.id;
            return (
              <div
                key={salon.id}
                onClick={() => selectSalon(salon)}
                className={`rounded-sm overflow-hidden cursor-pointer transition-all ${
                  isSelected
                    ? "shadow-md bg-lotus-rose/5"
                    : "shadow-sm hover:shadow-md"
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
                    <div className="w-full h-36 bg-gradient-to-br from-lotus-rose to-lotus-gold flex items-center justify-center">
                      <span className="text-4xl">🌸</span>
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-7 h-7 bg-lotus-rose rounded-full flex items-center justify-center shadow-sm">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col gap-2 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-lotus-deep text-sm leading-snug">
                      {salon.name}
                    </h4>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide bg-lotus-leaf-light text-lotus-leaf px-2 py-0.5 rounded-sm">
                      Đang hoạt động
                    </span>
                  </div>

                  {salon.fullAddress && (
                    <div className="flex items-start gap-1.5 text-xs text-lotus-stone">
                      <MapPin className="w-3.5 h-3.5 text-lotus-rose shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{salon.fullAddress}</span>
                    </div>
                  )}

                  {salon.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-lotus-stone">
                      <Phone className="w-3.5 h-3.5 text-lotus-rose shrink-0" />
                      <span>{salon.phone}</span>
                    </div>
                  )}

                  {salon.workingDays && (
                    <div className="flex items-center gap-1.5 text-xs text-lotus-stone">
                      <Clock className="w-3.5 h-3.5 text-lotus-rose shrink-0" />
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
              ? "bg-lotus-rose text-white hover:bg-lotus-rose/90 shadow-sm"
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
