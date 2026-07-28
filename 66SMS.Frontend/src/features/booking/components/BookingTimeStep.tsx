import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  ChevronRight,
  MapPin,
  User,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useCreateSlotLock,
  useTechnicians,
  useTimeSlots,
} from "../hooks/useBookingData";
import { useBookingStore } from "../stores/bookingStore";
import { filterSlotsAfterNow } from "../utils/timeSlot.utils";
import { formatDate } from "@/shared/utils/date.utils";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import type { AxiosError } from "axios";
import type { Result } from "@/shared/types/common.types";
import type { TimeSlotDTO } from "../types/booking.types";

export const BookingTimeStep: React.FC = () => {
  const store = useBookingStore();
  const { nextStep, prevStep, selectedSalon } = store;
  const activeGuest = store.guests[store.activeGuestIndex];

  const selectedDate = activeGuest?.selectedDate;
  const selectedTechnician = activeGuest?.selectedTechnician;
  const selectedTimeSlot = activeGuest?.selectedTimeSlot;
  const selectedService = activeGuest?.selectedService;

  const selectDate = store.selectDate;
  const selectTechnician = store.selectTechnician;
  const selectTimeSlot = store.selectTimeSlot;

  const [days] = useState(() => {
    const upcomingDays = [];
    const vietnameseDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      upcomingDays.push({
        dayName: i === 0 ? "H.Nay" : vietnameseDays[d.getDay()],
        dayNum: d.getDate(),
        fullDate: d,
        isBookedOut: false,
      });
    }
    return upcomingDays;
  });

  useEffect(() => {
    if (!selectedDate) {
      selectDate(days[0].fullDate);
    }
  }, [selectedDate, selectDate, days]);

  const serviceId = selectedService?.id;
  const dateInput = selectedDate
    ? (() => {
        const y = selectedDate.getFullYear();
        const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const d = String(selectedDate.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      })()
    : null;

  const { data: technicians = [], isLoading: loadingTechs } = useTechnicians(
    dateInput,
    serviceId,
    selectedSalon?.id
  );
  const { data: timeSlots = [], isLoading: loadingSlots } = useTimeSlots(
    dateInput,
    serviceId,
    selectedTechnician?.id,
    selectedSalon?.id
  );

  const visibleTimeSlots = useMemo(
    () => filterSlotsAfterNow(timeSlots, dateInput),
    [timeSlots, dateInput],
  );

  useEffect(() => {
    if (
      selectedTimeSlot &&
      !visibleTimeSlots.some(
        (s: TimeSlotDTO) => s.slotId === selectedTimeSlot.slotId,
      )
    ) {
      selectTimeSlot(null);
    }
  }, [visibleTimeSlots, selectedTimeSlot, selectTimeSlot]);

  const hasWorkingTechnicians = technicians.length > 0;
  const isStep2Valid = !!selectedDate && !!selectedTimeSlot;

  const { mutateAsync: createSlotLock } = useCreateSlotLock();
  const [isLocking, setIsLocking] = useState(false);

  const handleNextStep = async () => {
    const validGuests = store.guests.filter(
      (g) => g.selectedService && g.selectedDate && g.selectedTimeSlot
    );

    if (validGuests.length === 0) {
      toast.error("Vui lòng chọn đầy đủ Dịch vụ và Giờ cho ít nhất 1 khách");
      return;
    }

    const guestsToLock = validGuests.filter((g) => !g.lockId);

    if (guestsToLock.length === 0) {
      nextStep();
      return;
    }

    try {
      setIsLocking(true);
      const payload = guestsToLock.map((g) => ({
        slotId: g.selectedTimeSlot!.slotId,
        staffId: g.selectedTechnician?.id ?? null,
        appointmentDate: formatDate(g.selectedDate!).format("YYYY-MM-DD"),
        serviceId: g.selectedService!.id ?? 0,
      }));

      const res = await createSlotLock(payload);
      if (res.success && res.lockIds) {
        guestsToLock.forEach((g, idx) => {
          const originalIndex = store.guests.findIndex(
            (storeG) => storeG.id === g.id
          );
          if (originalIndex !== -1 && res.lockIds[idx]) {
            store.setGuestLockId(originalIndex, res.lockIds[idx]);
          }
        });
        nextStep();
      } else {
        toast.error("Không thể giữ khung giờ này, vui lòng chọn giờ khác.");
      }
    } catch (error) {
      toast.error(
        getErrorMessage(
          error as AxiosError<Result<unknown>>,
          "Khung giờ vừa có người đặt, vui lòng chọn lại."
        )
      );
    } finally {
      setIsLocking(false);
    }
  };

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
            <span className="font-semibold text-ink">
              {selectedSalon.name}
            </span>
          </p>
        )}
      </div>

      {/* Chọn ngày */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gold-600 uppercase tracking-wider font-semibold">
          1. Chọn ngày phục vụ
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {days.map((d) => {
            const isSelected = selectedDate?.toDateString() === d.fullDate.toDateString();
            return (
              <button
                key={d.fullDate.getTime()}
                disabled={d.isBookedOut}
                onClick={() => {
                  selectDate(d.fullDate);
                  selectTimeSlot(null);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-sm w-14 shrink-0 transition-all relative border ${
                  isSelected
                    ? "border-rose-600 bg-rose-600 text-white"
                    : d.isBookedOut
                      ? "border-warm-100 bg-warm-50 text-warm-300 cursor-not-allowed line-through"
                      : "border-warm-100 bg-surface text-ink hover:border-rose-200"
                }`}
              >
                <span className="text-2xs font-semibold opacity-80">
                  {d.dayName}
                </span>
                <span className="text-base font-extrabold mt-0.5">
                  {d.dayNum}
                </span>
                {d.isBookedOut && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-error-bg text-error-text text-3xs font-bold rounded-sm px-1 scale-90 whitespace-nowrap">
                    Hết chỗ
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chọn KTV */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gold-600 uppercase tracking-wider font-semibold">
          2. Chọn kỹ thuật viên
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {!serviceId ? (
            <div className="col-span-full py-4 text-center text-xs text-warm-600">
              Vui lòng chọn dịch vụ ở bước trước
            </div>
          ) : loadingTechs ? (
            <div className="col-span-full py-4 text-center text-xs text-warm-600">
              Đang tải danh sách KTV...
            </div>
          ) : !hasWorkingTechnicians ? (
            <div className="col-span-full rounded-sm border border-warm-100 bg-warm-50 py-6 text-center text-sm text-warm-600">
              Không có kỹ thuật viên nào làm việc trong ngày này. Vui lòng chọn
              ngày khác.
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

                  {tech.avatar ? (
                    <img
                      src={tech.avatar}
                      alt={tech.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-ink text-xs truncate">
                      {tech.name || "Kỹ thuật viên"}
                    </h4>
                    <p className="text-xs text-warm-600 truncate mt-0.5">
                      {tech.role || "Nhân viên"}
                    </p>
                    <span className="inline-block text-2xs font-bold px-1.5 py-0.5 rounded-sm mt-1.5 bg-success-bg text-success-text">
                      {tech.slotsLeft !== undefined
                        ? `Còn ${tech.slotsLeft} slot`
                        : "Sẵn sàng"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Khung giờ */}
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

              const s = slot.status?.toLowerCase() || "";
              let label = "Không khả dụng";
              let isAvailable = false;
              let classes =
                "border-warm-100 bg-warm-50 text-warm-300 cursor-not-allowed opacity-50";

              if (s === "available" || s === "trống") {
                label = "Còn trống";
                isAvailable = true;
                classes = isSelected
                  ? "border-rose-600 bg-rose-600 text-white"
                  : "border-warm-100 bg-surface text-ink hover:border-rose-200";
              } else if (s === "booked" || s === "đầy") {
                label = "Đã đặt";
                classes =
                  "border-error-bg bg-error-bg text-error-text cursor-not-allowed line-through opacity-60";
              } else if (s === "outside") {
                label = "Ngoài giờ";
                classes =
                  "border-warm-100 bg-warm-50 text-warm-300 cursor-not-allowed opacity-50";
              } else if (s === "break" || s === "nghỉ") {
                label = "Nghỉ";
                classes =
                  "border-warm-100 bg-warm-50 text-warm-300 cursor-not-allowed opacity-50";
              }

              return (
                <button
                  key={`slot-${slot.slotId}`}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => selectTimeSlot(slot)}
                  className={`py-2 px-1 text-center text-xs font-bold rounded-sm transition-all flex flex-col items-center justify-center gap-0.5 border ${classes}`}
                >
                  <span>{slot.time}</span>
                  <span className="text-xs tracking-wider opacity-90 scale-90">
                    {label}
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
          disabled={!isStep2Valid || isLocking}
          className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full font-bold transition-all ${
            isStep2Valid
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
};
