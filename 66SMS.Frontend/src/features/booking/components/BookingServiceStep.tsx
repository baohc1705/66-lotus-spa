import {
  ArrowLeft,
  Check,
  ChevronRight,
  HelpCircle,
  Leaf,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useServices } from "../../services/hooks/useServices";
import type { ServiceListDto } from "@/features/services/types/service.types";
import { FallbackImage } from "@/shared/components/FallbackImage";
import { useBookingStore } from "../stores/bookingStore";
import {
  clearPendingServiceId,
  getPendingServiceId,
} from "../utils/pendingBookingService";

// Đổi phút thành chữ dễ đọc: 90 -> 1h30'
function formatDuration(mins?: number) {
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
}

function isServiceSelected(
  selectedServices: ServiceListDto[],
  serviceId?: number,
) {
  if (serviceId == null) return false;

  for (let index = 0; index < selectedServices.length; index++) {
    if (selectedServices[index].id === serviceId) return true;
  }
  return false;
}

// Bước 2: chọn dịch vụ cho khách đang active.
// Dữ liệu lưu trong store.guests[activeGuestIndex], không lưu local.
// Nếu lưu local rồi quên sync store, sidebar / bước sau sẽ thiếu dịch vụ.
export function BookingServiceStep() {
  const store = useBookingStore();
  const toggleService = store.toggleService;
  const nextStep = store.nextStep;
  const prevStep = store.prevStep;

  // Một lần đặt có thể nhiều khách. Chỉ sửa dịch vụ của khách đang chọn.
  // Nếu luôn lấy guests[0], thêm khách sẽ bị sai.
  const activeGuest = store.guests[store.activeGuestIndex];
  const selectedServices = activeGuest?.selectedServices;
  const selectedList = selectedServices ?? [];

  const { data, isLoading, isError } = useServices({
    pageIndex: 1,
    pageSize: 100,
  });
  // Không ghi ?? [] ngay đây vì tạo mảng mới mỗi render làm useEffect chạy lại.
  const services = data?.data?.items;
  const serviceList = services ?? [];

  // searchQuery là state local: chỉ phục vụ UI tìm kiếm, không cần lưu store.
  const [searchQuery, setSearchQuery] = useState("");

  // Landing bấm Đặt lịch có thể ghi sẵn serviceId vào sessionStorage.
  // Vào bước này thì tự tick dịch vụ đó, rồi xóa key.
  // Nếu bỏ clearPendingServiceId, lần sau vào booking sẽ tick lại.
  useEffect(() => {
    const pendingId = getPendingServiceId();
    const list = services ?? [];
    const currentSelected = selectedServices ?? [];
    if (!pendingId || list.length === 0) return;

    if (isServiceSelected(currentSelected, pendingId)) {
      clearPendingServiceId();
      return;
    }

    let found: ServiceListDto | undefined;
    for (let index = 0; index < list.length; index++) {
      if (list[index].id === pendingId) {
        found = list[index];
        break;
      }
    }

    if (!found) return;

    toggleService(found);
    clearPendingServiceId();
  }, [services, selectedServices, toggleService]);

  const query = searchQuery.toLowerCase().trim();
  const filteredServices = serviceList.filter((service) => {
    const name = (service.name || "").toLowerCase();
    return !query || name.includes(query);
  });

  // Gom theo danh mục để render từng nhóm.
  // Nếu bỏ gom, list phẳng vẫn chạy được nhưng khó tìm khi nhiều dịch vụ.
  const categoryNames: string[] = [];
  const servicesByCategory: { [categoryName: string]: ServiceListDto[] } = {};
  for (let index = 0; index < filteredServices.length; index++) {
    const service = filteredServices[index];
    const categoryName = service.categoryName || "Dịch vụ khác";

    if (!servicesByCategory[categoryName]) {
      servicesByCategory[categoryName] = [];
      categoryNames.push(categoryName);
    }
    servicesByCategory[categoryName].push(service);
  }

  const hasSelectedServices = selectedList.length > 0;

  return (
    <div className="lotus-panel flex flex-col gap-5 p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-ink">
          <Leaf className="h-5 w-5 text-rose-600" />
          <span>Chọn dịch vụ</span>
        </h3>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
        <input
          type="text"
          placeholder="Tìm tên dịch vụ, mô tả..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full rounded-sm border border-warm-100 bg-surface py-2.5 pl-9 pr-4 text-sm text-ink placeholder:text-warm-600 hover:border-warm-300 focus:outline-hidden focus:border-rose-600"
        />
      </div>

      <div className="flex flex-col gap-4 max-h-125 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="text-center py-12 text-warm-600">
            Đang tải dịch vụ...
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-error-text text-sm">
            Không tải được dịch vụ. Thử lại sau.
          </div>
        ) : categoryNames.length === 0 ? (
          <div className="rounded-sm border border-warm-100 bg-warm-50 py-12 text-center">
            <HelpCircle className="w-8 h-8 text-warm-400 mx-auto mb-2" />
            <p className="text-warm-600 text-sm">Không tìm thấy dịch vụ.</p>
          </div>
        ) : (
          categoryNames.map((categoryName) => (
            <div key={categoryName} className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-gold-600 tracking-wider uppercase">
                {categoryName}
              </h4>
              <div className="flex flex-col gap-2">
                {servicesByCategory[categoryName].map((service) => {
                  const selected = isServiceSelected(selectedList, service.id);

                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service)}
                      className={`flex cursor-pointer items-center justify-between p-3 transition-all border ${
                        selected
                          ? "border-2 border-rose-600 bg-rose-50"
                          : "border-warm-100 bg-surface hover:border-rose-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FallbackImage
                          kind="service"
                          src={service.imageUrl}
                          alt={service.name ?? ""}
                          className="w-12 h-12 rounded-sm object-cover shrink-0"
                        />
                        <div>
                          <h5 className="font-bold text-ink text-sm">
                            {service.name}
                          </h5>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-warm-600">
                            <span>
                              Thời lượng: {formatDuration(service.durationMins)}
                            </span>
                            <span>·</span>
                            <span className="font-semibold text-rose-600">
                              Giá: {(service.sellingPrice || 0).toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                        </div>
                      </div>

                      {selected && (
                        <div className="w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
        <button
          onClick={prevStep}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-warm-300 bg-surface px-6 py-3 font-bold text-ink transition-all hover:border-rose-400 hover:text-rose-600 sm:w-auto"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        <button
          disabled={!hasSelectedServices}
          onClick={() => nextStep()}
          className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full font-bold transition-all ${
            hasSelectedServices
              ? "bg-rose-600 text-white hover:bg-rose-500"
              : "bg-warm-50 text-warm-300 cursor-not-allowed"
          }`}
        >
          Tiếp tục: Chọn thời gian
          {hasSelectedServices ? ` (${selectedList.length})` : ""}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
