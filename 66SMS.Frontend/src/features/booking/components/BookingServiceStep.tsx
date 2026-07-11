import {
  ArrowLeft,
  Check,
  ChevronRight,
  HelpCircle,
  Leaf,
  Search,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { useServices } from "../../services/hooks/useServices";
import { useBookingStore } from "../stores/bookingStore";

export const BookingServiceStep: React.FC = () => {
  const store = useBookingStore();
  const activeGuest = store.guests[store.activeGuestIndex];
  const selectedService = activeGuest?.selectedService;
  const selectService = store.selectService;
  const nextStep = store.nextStep;
  const { data, isLoading, isError } = useServices({
    pageIndex: 1,
    pageSize: 100,
  });
  const services = useMemo(() => data?.data?.items || [], [data?.data?.items]);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      (s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const groupedServices = useMemo(() => {
    const groups: { [key: string]: typeof services } = {};
    filteredServices.forEach((s) => {
      const cat = s.categoryName || "Dịch vụ khác";
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(s);
    });
    return groups;
  }, [filteredServices]);

  const formatDuration = (mins?: number) => {
    if (!mins) return "0'";
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours > 0 && remainingMins > 0) {
      return `${hours}h${remainingMins}'`;
    }
    if (hours > 0) {
      return `${hours}h`;
    }
    return `${mins}'`;
  };

  return (
    <div className="lotus-panel flex flex-col gap-5 p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
        <Leaf className="h-5 w-5 text-rose-600" />
        <span>Chọn dịch vụ</span>
      </h3>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
        <input
          type="text"
          placeholder="Tìm tên dịch vụ, mô tả..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-sm border border-warm-100 bg-surface py-2.5 pl-9 pr-4 text-sm text-ink placeholder:text-warm-600 hover:border-warm-300 focus:outline-none focus:border-rose-600"
        />
      </div>

      <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="text-center py-12 text-warm-600">
            Đang tải danh sách dịch vụ...
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-error-text text-sm">
            Không tải được dịch vụ. Vui lòng thử lại sau.
          </div>
        ) : Object.keys(groupedServices).length > 0 ? (
          Object.entries(groupedServices).map(([categoryName, items]) => (
            <div key={categoryName} className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-gold-600 tracking-wider uppercase">
                {categoryName}
              </h4>
              <div className="flex flex-col gap-2">
                {items.map((s) => {
                  const isSelected = selectedService?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => selectService(s)}
                      className={`flex cursor-pointer items-center justify-between p-3 transition-all border ${
                        isSelected
                          ? "border-2 border-rose-600 bg-rose-50"
                          : "border-warm-100 bg-surface hover:border-rose-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {s.imageUrl ? (
                          <img
                            src={s.imageUrl}
                            alt={s.name}
                            className="w-12 h-12 rounded-sm object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-rose-600 to-gold-600 flex items-center justify-center shrink-0 text-lg">
                            🌸
                          </div>
                        )}
                        <div>
                          <h5 className="font-bold text-ink text-sm">
                            {s.name}
                          </h5>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-warm-600">
                            <span>
                              Thời lượng: {formatDuration(s.durationMins)}
                            </span>
                            <span>·</span>
                            <span className="font-semibold text-rose-600">
                              Giá: {(s.sellingPrice || 0).toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-sm border border-warm-100 bg-warm-50 py-12 text-center">
            <HelpCircle className="w-8 h-8 text-warm-400 mx-auto mb-2" />
            <p className="text-warm-600 text-sm">
              Không tìm thấy dịch vụ làm đẹp nào tương thích.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
        <button
          onClick={store.prevStep}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-warm-300 bg-surface px-6 py-3 font-bold text-ink transition-all hover:border-rose-400 hover:text-rose-600 sm:w-auto"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
        <button
          disabled={!selectedService}
          onClick={() => nextStep()}
          className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full font-bold transition-all ${
            selectedService
              ? "bg-rose-600 text-white hover:bg-rose-500"
              : "bg-warm-50 text-warm-300 cursor-not-allowed"
          }`}
        >
          Tiếp tục: Chọn thời gian
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
