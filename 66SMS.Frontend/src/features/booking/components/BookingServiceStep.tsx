import React, { useMemo, useState } from "react";
import {
  Search,
  Heart,
  Clock,
  Check,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { useBookingStore } from "../stores/bookingStore";
import { useGetAllServicesUser } from "../../services/hooks/useServices";

export const BookingServiceStep: React.FC = () => {
  const store = useBookingStore();
  const activeGuest = store.guests[store.activeGuestIndex];
  const selectedService = activeGuest?.selectedService;
  const selectService = store.selectService;
  const nextStep = store.nextStep;
  const { data, isLoading, isError } = useGetAllServicesUser({
    pageIndex: 1,
    pageSize: 100,
  });
  const services = useMemo(() => data?.data?.items || [], [data?.data?.items]);

  const categories = useMemo(() => {
    // Lấy danh sách category từ data thực tế
    const names = Array.from(
      new Set(services.map((s) => s.categoryName).filter(Boolean)),
    );
    return ["Tất cả", ...names];
  }, [services]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      (s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "Tất cả" || s.categoryName === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-lotus-surface rounded-3xl p-6 sm:p-8 border border-lotus-muted/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-xl font-bold text-lotus-deep font-display mb-5 flex items-center gap-2 border-b border-lotus-muted/20 pb-3">
        <Heart className="w-5 h-5 text-lotus-rose" />
        <span>Bước 1: Chọn dịch vụ làm đẹp & chăm sóc</span>
      </h3>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm tên dịch vụ, mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-lotus-muted/20 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-lotus-rose-light bg-lotus-cream/50 text-lotus-deep"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:max-w-[400px]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? "bg-lotus-rose text-white border-lotus-rose shadow-sm"
                  : "bg-lotus-surface text-lotus-stone border-lotus-muted/20 hover:bg-lotus-rose/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services cards grid */}
      <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
        {isLoading ? (
          <div className="text-center py-12 text-lotus-stone">
            Đang tải danh sách dịch vụ...
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-lotus-error text-sm">
            Không tải được dịch vụ. Vui lòng thử lại sau.
          </div>
        ) : filteredServices.length > 0 ? (
          filteredServices.map((s) => {
            const isSelected = selectedService?.id === s.id;
            return (
              <div
                key={s.id}
                onClick={() => selectService(s)}
                className={`group border rounded-2xl p-4 sm:p-5 cursor-pointer transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden ${
                  isSelected
                    ? "border-lotus-rose bg-lotus-rose/5 shadow-sm"
                    : "border-lotus-muted/20 hover:border-lotus-rose-light hover:bg-lotus-cream"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-8 h-8 bg-lotus-rose rounded-bl-2xl flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-lotus-gold bg-lotus-rose/5 px-2.5 py-1 rounded-full border border-lotus-muted/20">
                    {s.categoryName || "Dịch Vụ Spa"}
                  </span>
                  <h4 className="font-bold text-lotus-deep text-base mt-2 group-hover:text-lotus-rose transition-colors">
                    {s.name}
                  </h4>
                  <p className="text-xs text-lotus-stone mt-1.5 leading-relaxed max-w-xl">
                    {s.description}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-lotus-stone font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-lotus-rose-light" />
                      {s.durationMins} phút
                    </span>
                    <span>·</span>
                    <span className="font-bold text-lotus-rose">
                      {(s.sellingPrice || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  <button
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                      isSelected
                        ? "bg-lotus-rose text-white border-lotus-rose"
                        : "bg-lotus-surface text-lotus-rose border-lotus-muted/20 group-hover:bg-lotus-rose group-hover:text-white group-hover:border-lotus-rose"
                    }`}
                  >
                    {isSelected ? "Đã Chọn" : "Chọn dịch vụ"}
                  </button>
                </div>
              </div>
            );
          })
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
          Tiếp tục: Chọn thời gian
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
