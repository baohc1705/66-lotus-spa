import React, { useMemo, useState } from "react";
import {
  Search,
  Heart,
  Check,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { useBookingStore } from "../stores/bookingStore";
import { useServices } from "../../services/hooks/useServices";

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
    <div className="bg-lotus-surface rounded-3xl p-6 sm:p-8 border border-lotus-muted/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-xl font-bold text-lotus-deep font-display mb-5 flex items-center gap-2 border-b border-lotus-muted/20 pb-3">
        <Heart className="w-5 h-5 text-lotus-rose" />
        <span>Bước 1: Chọn dịch vụ làm đẹp & chăm sóc</span>
      </h3>

      {/* Search Row */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm tên dịch vụ, mô tả..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-lotus-muted/20 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-lotus-rose-light bg-lotus-cream/50 text-lotus-deep"
        />
      </div>

      {/* Services list grouped by category */}
      <div className="flex flex-col gap-6 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
        {isLoading ? (
          <div className="text-center py-12 text-lotus-stone">
            Đang tải danh sách dịch vụ...
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-lotus-error text-sm">
            Không tải được dịch vụ. Vui lòng thử lại sau.
          </div>
        ) : Object.keys(groupedServices).length > 0 ? (
          Object.entries(groupedServices).map(([categoryName, items]) => (
            <div key={categoryName} className="flex flex-col gap-2">
              <h4 className="text-sm font-bold text-lotus-rose uppercase tracking-wider mb-2 border-b border-lotus-muted/10 pb-1">
                {categoryName}
              </h4>
              <div className="flex flex-col gap-1.5">
                {items.map((s) => {
                  const isSelected = selectedService?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => selectService(s)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all ${
                        isSelected
                          ? "bg-lotus-rose/5 border border-lotus-rose shadow-sm"
                          : "border border-transparent hover:bg-lotus-cream"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {s.imageUrl ? (
                          <img
                            src={s.imageUrl}
                            alt={s.name}
                            className="w-12 h-12 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lotus-rose/10 to-lotus-gold/10 flex items-center justify-center shrink-0 text-lg">
                            🌸
                          </div>
                        )}
                        <div>
                          <h5 className="font-bold text-lotus-deep text-sm">
                            {s.name}
                          </h5>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-lotus-stone">
                            <span>Thời lượng: {formatDuration(s.durationMins)}</span>
                            <span>·</span>
                            <span className="font-semibold text-lotus-rose">
                              Giá: {(s.sellingPrice || 0).toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-lotus-rose rounded-full flex items-center justify-center text-white shrink-0 shadow-sm animate-in zoom-in-50 duration-200">
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
          <div className="text-center py-12 border border-dashed border-lotus-muted/20 rounded-2xl">
            <HelpCircle className="w-8 h-8 text-lotus-stone/50 mx-auto mb-2" />
            <p className="text-lotus-stone text-sm">
              Không tìm thấy dịch vụ làm đẹp nào tương thích.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-8 border-t border-lotus-muted/20 pt-5">
        <button
          disabled={!selectedService}
          onClick={() => nextStep()}
          className={`flex items-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition-all ${
            selectedService
              ? "bg-lotus-rose text-white hover:bg-lotus-rose/90 shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Tiếp tục: Chọn chi nhánh
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
