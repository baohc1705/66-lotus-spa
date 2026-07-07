import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  ChevronRight,
  MapPin,
  Sofa,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useBookingPositions,
  useCreateSlotLock,
  useTechnicians,
  useTimeSlots,
} from "../hooks/useBookingData";
import { useBookingStore } from "../stores/bookingStore";

export const BookingTimeStep: React.FC = () => {
  const store = useBookingStore();
  const { nextStep, prevStep, selectedSalon } = store;
  const activeGuest = store.guests[store.activeGuestIndex];

  const selectedDate = activeGuest?.selectedDate;
  const selectedTechnician = activeGuest?.selectedTechnician;
  const selectedTimeSlot = activeGuest?.selectedTimeSlot;
  const selectedService = activeGuest?.selectedService;
  const selectedPosition = activeGuest?.selectedPosition;

  const selectDate = store.selectDate;
  const selectTechnician = store.selectTechnician;
  const selectTimeSlot = store.selectTimeSlot;
  const selectPosition = store.selectPosition;

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
    ? selectedDate.toISOString().split("T")[0]
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
  const { data: positions = [], isLoading: loadingPositions } =
    useBookingPositions();

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
        positionId: g.selectedPosition?.id || 0,
        appointmentDate: g.selectedDate!.toISOString().split("T")[0],
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
      console.error(error);
      toast.error("Có lỗi xảy ra khi giữ lịch.");
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <div className="bg-white rounded-sm shadow-sm p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-lotus-deep font-display flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-lotus-rose" />
          <span>Chọn thời gian</span>
        </h3>
        {selectedSalon && (
          <p className="text-xs text-lotus-stone flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-lotus-rose" />
            <span className="font-semibold text-lotus-deep">
              {selectedSalon.name}
            </span>
          </p>
        )}
      </div>

      {/* Chọn ngày */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-lotus-stone  tracking-wider">
          1. Chọn ngày phục vụ
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {days.map((d) => {
            const isSelected =
              selectedDate?.toDateString() === d.fullDate.toDateString();
            return (
              <button
                key={d.fullDate.getTime()}
                disabled={d.isBookedOut}
                onClick={() => {
                  selectDate(d.fullDate);
                  selectTimeSlot(null);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-sm w-14 shrink-0 transition-all relative ${
                  isSelected
                    ? "bg-lotus-rose text-white shadow-md"
                    : d.isBookedOut
                      ? "bg-gray-50 text-gray-300 cursor-not-allowed line-through shadow-sm"
                      : "bg-lotus-cream/50 text-lotus-deep shadow-sm hover:shadow-md"
                }`}
              >
                <span className="text-[10px] font-semibold opacity-80">
                  {d.dayName}
                </span>
                <span className="text-base font-extrabold mt-0.5">
                  {d.dayNum}
                </span>
                {d.isBookedOut && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-100 text-red-600 text-[9px] font-bold rounded-sm px-1 scale-90 whitespace-nowrap">
                    Hết chỗ
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chọn vị trí */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-lotus-stone tracking-wider">
          2. Chọn vị trí
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {loadingPositions ? (
            <div className="col-span-full py-4 text-center text-xs text-lotus-stone">
              Đang tải danh sách vị trí...
            </div>
          ) : (
            <>
              <div
                onClick={() => selectPosition(null)}
                className={`rounded-sm p-3 flex items-center justify-center gap-2 transition-all relative cursor-pointer ${
                  !selectedPosition
                    ? "bg-lotus-rose shadow-md"
                    : "shadow-sm hover:shadow-md bg-lotus-cream"
                }`}
              >
                <span className="text-xs font-bold text-lotus-deep">
                  Không yêu cầu
                </span>
              </div>
              {positions.map((pos) => {
                const isSelected = selectedPosition?.id === pos.id;
                return (
                  <div
                    key={pos.id}
                    onClick={() => selectPosition(pos)}
                    className={`rounded-sm p-3 flex flex-col items-start gap-1 transition-all relative overflow-hidden cursor-pointer ${
                      isSelected
                        ? "shadow-md"
                        : "shadow-sm hover:shadow-md"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-6 h-6 bg-lotus-rose rounded-bl-sm flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-lotus-deep">
                      <Sofa className="w-3.5 h-3.5 text-lotus-rose" />
                      <h4 className="font-bold text-xs truncate">{pos.name}</h4>
                    </div>
                    <p className="text-[11px] text-lotus-stone truncate ml-5">
                      {pos.roomName}
                    </p>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Chọn KTV */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-lotus-stone tracking-wider">
          3. Chọn kỹ thuật viên
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {!serviceId ? (
            <div className="col-span-full py-4 text-center text-xs text-lotus-stone">
              Vui lòng chọn dịch vụ ở bước trước
            </div>
          ) : loadingTechs ? (
            <div className="col-span-full py-4 text-center text-xs text-lotus-stone">
              Đang tải danh sách KTV...
            </div>
          ) : !hasWorkingTechnicians ? (
            <div className="col-span-full py-6 text-center text-sm text-lotus-stone bg-lotus-cream rounded-sm shadow-sm">
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
                  className={`rounded-sm p-3 flex items-center gap-3 transition-all relative overflow-hidden cursor-pointer ${
                    isSelected
                      ? "shadow-md"
                      : "shadow-sm hover:shadow-md"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-6 h-6 bg-lotus-rose rounded-bl-sm flex items-center justify-center">
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
                    <div className="w-10 h-10 rounded-full bg-lotus-rose-light text-lotus-rose flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lotus-deep text-xs truncate">
                      {tech.name || "Kỹ thuật viên"}
                    </h4>
                    <p className="text-[11px] text-lotus-stone truncate mt-0.5">
                      {tech.role || "Nhân viên"}
                    </p>
                    <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-sm mt-1.5 bg-lotus-leaf-light text-lotus-leaf">
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
          <p className="text-xs text-lotus-stone tracking-wider">
            4. Chọn khung giờ phục vụ
          </p>
          <div className="flex items-center gap-3 text-[10px] text-lotus-stone">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm inline-block" />
              Trống
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-300 inline-block" />
              Đã đặt
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-200 inline-block" />
              Ngoài giờ
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[220px] overflow-y-auto scrollbar-thin">
          {!dateInput ? (
            <div className="col-span-full py-4 text-center text-xs text-lotus-stone">
              Vui lòng chọn ngày trước
            </div>
          ) : loadingSlots ? (
            <div className="col-span-full py-4 text-center text-xs text-lotus-stone">
              Đang tải khung giờ...
            </div>
          ) : (
            timeSlots.map((slot) => {
              const isSelected = selectedTimeSlot?.slotId === slot.slotId;

              const s = slot.status?.toLowerCase() || "";
              let label = "Không khả dụng";
              let isAvailable = false;
              let classes =
                "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 shadow-sm";

              if (s === "available" || s === "trống") {
                label = "Còn trống";
                isAvailable = true;
                classes = isSelected
                  ? "bg-lotus-rose text-white shadow-md"
                  : "bg-white text-lotus-deep shadow-sm hover:shadow-md";
              } else if (s === "booked" || s === "đầy") {
                label = "Đã đặt";
                classes =
                  "bg-red-50 text-red-400 cursor-not-allowed line-through opacity-60 shadow-sm";
              } else if (s === "outside") {
                label = "Ngoài giờ";
                classes =
                  "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 shadow-sm";
              } else if (s === "break" || s === "nghỉ") {
                label = "Nghỉ";
                classes =
                  "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 shadow-sm";
              }

              return (
                <button
                  key={`slot-${slot.slotId}`}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => selectTimeSlot(slot)}
                  className={`py-2 px-1 text-center text-xs font-bold rounded-sm transition-all flex flex-col items-center justify-center gap-0.5 ${classes}`}
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
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full font-bold transition-all bg-lotus-cream text-lotus-deep shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
        <button
          onClick={handleNextStep}
          disabled={!isStep2Valid || isLocking}
          className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full font-bold transition-all ${
            isStep2Valid
              ? "bg-lotus-rose text-white hover:bg-lotus-rose/90 shadow-sm"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Tiếp tục: Nhập thông tin
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
