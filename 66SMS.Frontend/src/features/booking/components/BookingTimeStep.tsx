import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { useEffect } from "react";
import { toast } from "@/shared/components/kitToast";
import {
  useAvailableBookingDays,
  useTechnicians,
  useTimeSlots,
} from "../hooks/useBookingData";
import { useBookingStore } from "../stores/bookingStore";
import { filterSlotsAfterNow } from "../utils/timeSlot.utils";
import { formatDate } from "@/shared/utils/date.utils";
import { FallbackImage } from "@/shared/components/FallbackImage";
import type { BookingDayDto, TimeSlotDTO } from "../types/booking.types";

// Đổi status từ API thành chữ + class CSS để nút giờ dễ đọc.
// Nếu BE đổi tên status (vd available -> free) thì sửa map ở đây.
function getSlotDisplay(slot: TimeSlotDTO, isSelected: boolean) {
  const status = (slot.status || "").toLowerCase();

  if (status === "available" || status === "trống") {
    return {
      label: "Còn trống",
      isAvailable: true,
      className: isSelected
        ? "border-rose-600 bg-rose-600 text-white"
        : "border-warm-100 bg-surface text-ink hover:border-rose-200",
    };
  }

  if (status === "booked" || status === "đầy") {
    return {
      label: "Đã đặt",
      isAvailable: false,
      className:
        "border-error-bg bg-error-bg text-error-text cursor-not-allowed line-through opacity-60",
    };
  }

  if (status === "short") {
    return {
      label: "Không đủ giờ",
      isAvailable: false,
      className:
        "border-warm-100 bg-warm-50 text-warm-400 cursor-not-allowed opacity-60",
    };
  }

  if (status === "outside") {
    return {
      label: "Ngoài giờ",
      isAvailable: false,
      className:
        "border-warm-100 bg-warm-50 text-warm-300 cursor-not-allowed opacity-50",
    };
  }

  if (status === "break" || status === "nghỉ") {
    return {
      label: "Nghỉ",
      isAvailable: false,
      className:
        "border-warm-100 bg-warm-50 text-warm-300 cursor-not-allowed opacity-50",
    };
  }

  return {
    label: "Không khả dụng",
    isAvailable: false,
    className:
      "border-warm-100 bg-warm-50 text-warm-300 cursor-not-allowed opacity-50",
  };
}

// Bước 3: chọn ngày + KTV + khung giờ cho khách đang active.
// Thứ tự quan trọng: ngày -> KTV -> giờ, vì API giờ cần date + serviceIds (+ staffId).
export function BookingTimeStep() {
  const store = useBookingStore();
  const nextStep = store.nextStep;
  const prevStep = store.prevStep;
  const selectedSalon = store.selectedSalon;
  const selectDate = store.selectDate;
  const selectTechnician = store.selectTechnician;
  const selectTimeSlot = store.selectTimeSlot;

  const activeGuest = store.guests[store.activeGuestIndex];
  const selectedDate = activeGuest?.selectedDate;
  const selectedTechnician = activeGuest?.selectedTechnician;
  const selectedTimeSlot = activeGuest?.selectedTimeSlot;
  const selectedServices = activeGuest?.selectedServices ?? [];

  // API cần mảng id dịch vụ. Thiếu id thì không gọi technicians / timeslots.
  const serviceIds: number[] = [];
  for (let index = 0; index < selectedServices.length; index++) {
    const id = selectedServices[index].id;
    if (id == null || id <= 0) continue;
    serviceIds.push(id);
  }

  // Lấy 7 ngày gần nhất có thể đặt. Đổi số 7 = đổi số nút ngày hiện ra.
  const { data: days = [], isLoading: loadingDays } = useAvailableBookingDays(7);

  // Chưa chọn ngày thì chọn sẵn ngày đầu tiên trong list.
  // Nếu bỏ effect này, user phải tự bấm ngày mới load được KTV/giờ.
  useEffect(() => {
    if (!selectedDate && days.length > 0) {
      selectDate(formatDate(days[0].date).toDate());
    }
  }, [selectedDate, selectDate, days]);

  const dateInput = selectedDate
    ? formatDate(selectedDate).format("YYYY-MM-DD")
    : null;

  const { data: technicians = [], isLoading: loadingTechs } = useTechnicians({
    date: dateInput ?? undefined,
    serviceIds,
    salonId: selectedSalon?.id,
  });

  const { data: timeSlots = [], isLoading: loadingSlots } = useTimeSlots({
    date: dateInput ?? undefined,
    serviceIds,
    staffId: selectedTechnician?.id,
    salonId: selectedSalon?.id,
  });

  // Ngày hôm nay thì ẩn giờ đã qua. Ngày khác giữ nguyên.
  // Nếu bỏ filter, user có thể chọn giờ trong quá khứ.
  const visibleTimeSlots = filterSlotsAfterNow(timeSlots, dateInput);

  // Slot đang chọn bị full / mất khỏi list thì bỏ chọn.
  // Nếu không clear, bấm Tiếp tục vẫn mang slot cũ không còn trống.
  useEffect(() => {
    if (!selectedTimeSlot) return;

    let stillOk = false;
    for (let index = 0; index < visibleTimeSlots.length; index++) {
      const slot = visibleTimeSlots[index];
      if (slot.slotId !== selectedTimeSlot.slotId) continue;

      const status = (slot.status || "").toLowerCase();
      if (status === "available" || status === "trống") {
        stillOk = true;
      }
      break;
    }

    if (!stillOk) {
      selectTimeSlot(null);
    }
  }, [visibleTimeSlots, selectedTimeSlot, selectTimeSlot]);

  const hasWorkingTechnicians = technicians.length > 0;
  const noComboStaff =
    serviceIds.length > 0 && !loadingTechs && !hasWorkingTechnicians;

  // Chỉ cần ngày + giờ + còn KTV. KTV "bất kỳ" cũng được.
  const canContinue =
    !!selectedDate && !!selectedTimeSlot && hasWorkingTechnicians;

  function handleNextStep() {
    // Kiểm tra ít nhất 1 khách đã đủ dịch vụ + ngày + giờ.
    // Nếu nới điều kiện này, bước contact dễ fail khi tạo lock.
    let validGuestCount = 0;
    for (let index = 0; index < store.guests.length; index++) {
      const guest = store.guests[index];
      const hasServices = (guest.selectedServices?.length ?? 0) > 0;
      if (hasServices && guest.selectedDate && guest.selectedTimeSlot) {
        validGuestCount = validGuestCount + 1;
      }
    }

    if (validGuestCount === 0) {
      toast.error("Vui lòng chọn đầy đủ Dịch vụ và Giờ cho ít nhất 1 khách");
      return;
    }

    nextStep();
  }

  return (
    <div className="lotus-panel flex flex-col gap-5 p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <CalendarIcon className="h-5 w-5 text-rose-600" />
          <span>Chọn thời gian</span>
        </h3>
        {selectedSalon && (
          <p className="text-xs text-warm-600 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-semibold text-ink">{selectedSalon.name}</span>
          </p>
        )}
      </div>

      {/* 1. Ngày */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gold-600 uppercase tracking-wider font-semibold">
          1. Chọn ngày phục vụ
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {loadingDays ? (
            <div className="py-4 text-xs text-warm-600">Đang tải ngày...</div>
          ) : (
            days.map((day: BookingDayDto) => {
              const fullDate = formatDate(day.date).toDate();
              const isSelected =
                selectedDate != null &&
                formatDate(selectedDate).format("YYYY-MM-DD") === day.date;

              let dayClass =
                "border-warm-100 bg-surface text-ink hover:border-rose-200";
              if (isSelected) {
                dayClass = "border-rose-600 bg-rose-600 text-white";
              } else if (day.isBookedOut) {
                dayClass =
                  "border-warm-100 bg-warm-50 text-warm-300 cursor-not-allowed line-through";
              }

              return (
                <button
                  key={day.date}
                  type="button"
                  disabled={day.isBookedOut}
                  onClick={() => {
                    // Đổi ngày thì xóa giờ cũ, vì slot thuộc ngày cũ.
                    selectDate(fullDate);
                    selectTimeSlot(null);
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-sm w-14 shrink-0 transition-all relative border ${dayClass}`}
                >
                  <span className="text-2xs font-semibold opacity-80">
                    {day.dayName}
                  </span>
                  <span className="text-base font-extrabold mt-0.5">
                    {day.dayNum}
                  </span>
                  {day.isBookedOut && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-error-bg text-error-text text-3xs font-bold rounded-sm px-1 scale-90 whitespace-nowrap">
                      Hết chỗ
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Kỹ thuật viên */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gold-600 uppercase tracking-wider font-semibold">
          2. Chọn kỹ thuật viên
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {serviceIds.length === 0 ? (
            <div className="col-span-full py-4 text-center text-xs text-warm-600">
              Vui lòng chọn dịch vụ ở bước trước
            </div>
          ) : loadingTechs ? (
            <div className="col-span-full py-4 text-center text-xs text-warm-600">
              Đang tải danh sách kỹ thuật viên...
            </div>
          ) : noComboStaff ? (
            <div className="col-span-full rounded-sm border border-warning-bg bg-warning-bg py-6 px-4 text-center text-sm text-ink">
              Không có kỹ thuật viên nào thực hiện được tất cả dịch vụ đã chọn.
              Vui lòng bớt dịch vụ hoặc đặt tách thành nhiều lịch (Thêm khách).
            </div>
          ) : (
            technicians.map((tech) => {
              const isSelected =
                selectedTechnician?.id === tech.id &&
                (!tech.isAny || selectedTechnician?.isAny === tech.isAny);

              return (
                <div
                  key={tech.id ?? "any"}
                  onClick={() => selectTechnician(tech)}
                  className={`relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-sm p-3 transition-all border ${
                    isSelected
                      ? "border-2 border-rose-600 bg-rose-50"
                      : "border-warm-100 bg-surface hover:border-rose-200"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-6 h-6 bg-rose-600 rounded-bl-sm flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  <FallbackImage
                    kind="ktv"
                    src={tech.avatar}
                    alt={tech.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-ink text-xs truncate">
                      {tech.name || "Kỹ thuật viên"}
                    </h4>
                    <p className="text-xs text-warm-600 truncate mt-0.5">
                      {tech.role || "Nhân viên"}
                    </p>
                    <span className="inline-block text-2xs font-bold px-1.5 py-0.5 rounded-sm mt-1.5 bg-success-bg text-success-text">
                      {tech.slotsLeft !== undefined
                        ? `Còn ${tech.slotsLeft} khung giờ`
                        : "Sẵn sàng"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Khung giờ */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gold-600 uppercase tracking-wider font-semibold">
            3. Chọn khung giờ phục vụ
          </p>
          <div className="flex items-center gap-3 text-2xs text-warm-600">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-surface border border-warm-100 inline-block" />
              Trống
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-error-text/40 inline-block" />
              Đã đặt
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-warm-200 inline-block" />
              Không đủ giờ
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-warm-100 inline-block" />
              Ngoài giờ
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[220px] overflow-y-auto scrollbar-thin">
          {!dateInput ? (
            <div className="col-span-full py-4 text-center text-xs text-warm-600">
              Vui lòng chọn ngày trước
            </div>
          ) : noComboStaff ? (
            <div className="col-span-full py-4 text-center text-xs text-warm-600">
              Không thể chọn giờ khi chưa có kỹ thuật viên phù hợp combo dịch vụ
            </div>
          ) : loadingSlots ? (
            <div className="col-span-full py-4 text-center text-xs text-warm-600">
              Đang tải khung giờ...
            </div>
          ) : visibleTimeSlots.length === 0 ? (
            <div className="col-span-full py-4 text-center text-xs text-warm-600">
              Không còn khung giờ phù hợp
            </div>
          ) : (
            visibleTimeSlots.map((slot) => {
              const isSelected = selectedTimeSlot?.slotId === slot.slotId;
              const display = getSlotDisplay(slot, isSelected);

              return (
                <button
                  key={`slot-${slot.slotId}`}
                  type="button"
                  disabled={!display.isAvailable}
                  onClick={() => selectTimeSlot(slot)}
                  className={`py-2 px-1 text-center text-xs font-bold rounded-sm transition-all flex flex-col items-center justify-center gap-0.5 border ${display.className}`}
                >
                  <span>{slot.time}</span>
                  <span className="text-xs tracking-wider opacity-90 scale-90">
                    {display.label}
                  </span>
                </button>
              );
            })
          )}
        </div>
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
          onClick={handleNextStep}
          disabled={!canContinue}
          className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full font-bold transition-all ${
            canContinue
              ? "bg-rose-600 text-white hover:bg-rose-500"
              : "bg-warm-50 text-warm-300 cursor-not-allowed"
          }`}
        >
          Tiếp tục: Nhập thông tin
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
