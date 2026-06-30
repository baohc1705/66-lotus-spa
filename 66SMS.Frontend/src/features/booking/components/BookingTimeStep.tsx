import React, { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  User,
  Check,
  ArrowLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { useBookingStore } from "../stores/bookingStore";
import {
  useTechnicians,
  useTimeSlots,
  useBookingPositions,
  useCreateSlotLock,
} from "../hooks/useBookingData";

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
    // Mặc định chọn ngày hôm nay nếu chưa có
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
  const isStep2Valid = !!selectedDate && !!selectedTimeSlot; // Technician và Position là tuỳ chọn

  const { mutateAsync: createSlotLock } = useCreateSlotLock();
  const [isLocking, setIsLocking] = useState(false);

  const handleNextStep = async () => {
    // Collect slots that are fully selected
    const validGuests = store.guests.filter(
      (g) => g.selectedService && g.selectedDate && g.selectedTimeSlot
    );

    if (validGuests.length === 0) {
      toast.error("Vui lòng chọn đầy đủ Dịch vụ và Giờ cho ít nhất 1 khách");
      return;
    }

    // Filter guests that actually need a NEW lock
    const guestsToLock = validGuests.filter((g) => !g.lockId);

    // If all valid guests are already locked, just go to next step
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
        // Set lockId only for the guests we just locked
        guestsToLock.forEach((g, idx) => {
          const originalIndex = store.guests.findIndex((storeG) => storeG.id === g.id);
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
    <div className="bg-lotus-surface rounded-3xl p-6 sm:p-8 border border-lotus-muted/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-xl font-bold text-lotus-deep font-display mb-1 flex items-center gap-2">
        <CalendarIcon className="w-5 h-5 text-lotus-rose" />
        <span>Bước 3: Chọn ngày lành, giờ đẹp & chuyên viên</span>
      </h3>
      {selectedSalon && (
        <p className="text-xs text-lotus-stone mb-4 flex items-center gap-1.5 border-b border-lotus-muted/20 pb-3">
          <MapPin className="w-3.5 h-3.5 text-lotus-rose-light" />
          Kỹ thuật viên tại: <span className="font-semibold text-lotus-deep">{selectedSalon.name}</span>
        </p>
      )}
      {!selectedSalon && <div className="border-b border-lotus-muted/20 mb-5" />}

      {/* 1. Chọn ngày */}
      <div className="mb-6">
        <p className="text-xs text-lotus-stone font-bold uppercase tracking-wider mb-2.5">
          1. Chọn ngày phục vụ:
        </p>
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {days.map((d) => {
            const isSelected =
              selectedDate?.toDateString() === d.fullDate.toDateString();
            return (
              <button
                key={d.fullDate.getTime()}
                disabled={d.isBookedOut}
                onClick={() => {
                  selectDate(d.fullDate);
                  selectTimeSlot(null); // Reset timeslot
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl w-14 shrink-0 transition-all border relative ${
                  isSelected
                    ? "bg-lotus-rose text-white border-lotus-rose shadow-sm"
                    : d.isBookedOut
                      ? "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed line-through"
                      : "bg-lotus-surface text-lotus-deep border-lotus-muted/20 hover:bg-lotus-rose/5"
                }`}
              >
                <span className="text-[10px] font-semibold opacity-80">
                  {d.dayName}
                </span>
                <span className="text-base font-extrabold mt-0.5">
                  {d.dayNum}
                </span>

                {d.isBookedOut && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-100 text-red-600 border border-red-200 text-[8px] font-bold rounded px-1 scale-90 whitespace-nowrap">
                    Hết chỗ
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Chọn Vị trí (Phòng) */}
      <div className="mb-6">
        <p className="text-xs text-lotus-stone font-bold uppercase tracking-wider mb-2.5">
          2. Chọn vị trí / phòng (Tùy chọn):
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {loadingPositions ? (
            <div className="col-span-full py-4 text-center text-xs text-lotus-stone">
              Đang tải danh sách vị trí...
            </div>
          ) : (
            <>
              <div
                onClick={() => selectPosition(null)}
                className={`border rounded-2xl p-3 flex items-center justify-center gap-2 transition-all relative cursor-pointer ${
                  !selectedPosition
                    ? "border-lotus-rose bg-lotus-rose/5 shadow-sm"
                    : "border-lotus-muted/20 hover:border-lotus-rose-light hover:bg-lotus-cream"
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
                    className={`border rounded-2xl p-3 flex flex-col items-start gap-1 transition-all relative overflow-hidden cursor-pointer ${
                      isSelected
                        ? "border-lotus-rose bg-lotus-rose/5 shadow-sm"
                        : "border-lotus-muted/20 hover:border-lotus-rose-light hover:bg-lotus-cream"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-6 h-6 bg-lotus-rose rounded-bl-xl flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-lotus-deep">
                      <MapPin className="w-3.5 h-3.5 text-lotus-rose-light" />
                      <h4 className="font-bold text-xs truncate">{pos.name}</h4>
                    </div>
                    <p className="text-[10px] text-lotus-stone truncate ml-5">
                      {pos.roomName}
                    </p>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* 3. Chọn KTV */}
      <div className="mb-6">
        <p className="text-xs text-lotus-stone font-bold uppercase tracking-wider mb-2.5">
          3. Chọn Kỹ thuật viên (Tùy chọn):
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {!serviceId ? (
            <div className="col-span-full py-4 text-center text-xs text-lotus-stone">
              Vui lòng chọn dịch vụ ở bước 1
            </div>
          ) : loadingTechs ? (
            <div className="col-span-full py-4 text-center text-xs text-lotus-stone">
              Đang tải danh sách KTV...
            </div>
          ) : !hasWorkingTechnicians ? (
            <div className="col-span-full py-6 text-center text-sm text-lotus-stone bg-lotus-cream rounded-2xl border border-dashed border-lotus-muted/20">
              Không có kỹ thuật viên nào làm việc trong ngày này. Vui lòng chọn
              ngày khác.
            </div>
          ) : (
            <>
              {technicians.map((tech) => {
                // Determine if this technician is selected.
                // If the selected technician has no ID (like 'Bất kỳ kỹ thuật viên'), we match by isAny flag if present.
                const isSelected = selectedTechnician?.id === tech.id && (!tech.isAny || selectedTechnician?.isAny === tech.isAny);
                
                return (
                  <div
                    key={tech.id ?? "any"}
                    onClick={() => selectTechnician(tech)}
                    className={`border rounded-2xl p-3.5 flex items-center gap-3.5 transition-all relative overflow-hidden cursor-pointer ${
                      isSelected
                        ? "border-lotus-rose bg-lotus-rose/5 shadow-sm"
                        : "border-lotus-muted/20 hover:border-lotus-rose-light hover:bg-lotus-cream"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-6 h-6 bg-lotus-rose rounded-bl-xl flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}

                    {tech.avatar ? (
                      <img
                        src={tech.avatar}
                        alt={tech.name}
                        className="w-10 h-10 rounded-full object-cover border border-lotus-muted/20"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-lotus-rose/10 text-lotus-rose flex items-center justify-center shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lotus-deep text-xs truncate">
                        {tech.name || "Kỹ thuật viên"}
                      </h4>
                      <p className="text-[10px] text-lotus-stone truncate mt-0.5">
                        {tech.role || "Nhân viên"}
                      </p>

                      <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-1.5 border bg-emerald-50 text-emerald-600 border-emerald-200">
                        {tech.slotsLeft !== undefined ? `Còn ${tech.slotsLeft} slot` : "Sẵn sàng"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* 4. Khung giờ */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-lotus-stone font-bold uppercase tracking-wider">
            4. Chọn khung giờ phục vụ:
          </p>
          <div className="flex items-center gap-3 text-[10px] text-lotus-stone">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-lotus-surface border border-lotus-muted/30 inline-block"></span>
              Trống
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-50 border border-red-200 inline-block"></span>
              Đã đặt
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-100 border border-gray-300 inline-block"></span>
              Ngoài giờ / Nghỉ
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
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
              let classes = "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50";

              if (s === "available" || s === "trống") {
                label = "Còn trống";
                isAvailable = true;
                classes = isSelected ? "bg-lotus-rose text-white border-lotus-rose shadow-sm" : "bg-lotus-surface text-lotus-deep border-lotus-muted/20 hover:bg-lotus-rose/5";
              } else if (s === "booked" || s === "đầy") {
                label = "Đã đặt";
                classes = "bg-red-50 text-red-400 border-red-100 cursor-not-allowed line-through opacity-60";
              } else if (s === "outside") {
                label = "Ngoài giờ";
                classes = "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50";
              } else if (s === "break" || s === "nghỉ") {
                label = "Nghỉ";
                classes = "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50";
              }

              return (
                <button
                  key={`slot-${slot.slotId}`}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => selectTimeSlot(slot)}
                  className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all border flex flex-col items-center justify-center gap-0.5 ${classes}`}
                >
                  <span>{slot.time}</span>
                  <span className="text-[7px] uppercase font-bold tracking-wider opacity-90 scale-90">
                    {label}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 border-t border-lotus-muted/20 pt-5">
        <button
          onClick={prevStep}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition-all bg-lotus-surface text-lotus-deep border border-lotus-muted/20 hover:bg-lotus-cream"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
        <button
          onClick={handleNextStep}
          disabled={!isStep2Valid || isLocking}
          className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition-all ${
            isStep2Valid
              ? "bg-lotus-rose text-white hover:bg-lotus-rose/90 shadow-md"
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
