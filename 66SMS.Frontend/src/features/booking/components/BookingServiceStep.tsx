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
    <div className="bg-white rounded-sm shadow-sm p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-bold text-lotus-deep font-display flex items-center gap-2">
        <Leaf className="w-5 h-5 text-lotus-rose" />
        <span>Chọn dịch vụ</span>
      </h3>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm tên dịch vụ, mô tả..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-sm shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-lotus-rose-light bg-lotus-cream text-lotus-deep"
        />
      </div>

      <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto scrollbar-thin">
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
              <h4 className="text-xs font-bold text-lotus-rose tracking-wider">
                {categoryName}
              </h4>
              <div className="flex flex-col gap-2">
                {items.map((s) => {
                  const isSelected = selectedService?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => selectService(s)}
                      className={`flex items-center justify-between p-3 rounded-sm cursor-pointer transition-all ${
                        isSelected
                          ? "shadow-md hover:shadow-md"
                          : "shadow-sm hover:shadow-md bg-white"
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
                          <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-lotus-rose to-lotus-gold flex items-center justify-center shrink-0 text-lg">
                            🌸
                          </div>
                        )}
                        <div>
                          <h5 className="font-bold text-lotus-deep text-sm">
                            {s.name}
                          </h5>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-lotus-stone">
                            <span>
                              Thời lượng: {formatDuration(s.durationMins)}
                            </span>
                            <span>·</span>
                            <span className="font-semibold text-lotus-rose">
                              Giá: {(s.sellingPrice || 0).toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-lotus-rose rounded-full flex items-center justify-center text-white shrink-0 shadow-sm">
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
          <div className="text-center py-12 rounded-sm shadow-sm bg-lotus-cream">
            <HelpCircle className="w-8 h-8 text-lotus-stone mx-auto mb-2" />
            <p className="text-lotus-stone text-sm">
              Không tìm thấy dịch vụ làm đẹp nào tương thích.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
        <button
          onClick={store.prevStep}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full font-bold transition-all bg-lotus-cream text-lotus-deep shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
        <button
          disabled={!selectedService}
          onClick={() => nextStep()}
          className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full font-bold transition-all ${
            selectedService
              ? "bg-lotus-rose text-white hover:bg-lotus-rose/90 shadow-sm"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Tiếp tục: Chọn thời gian
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
