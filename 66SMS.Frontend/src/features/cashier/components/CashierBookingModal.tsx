import { useMemo, useState } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  Loader2,
  MapPin,
  NotebookPen,
  Search,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useAuthStore } from "@/features/auth/stores/authStore";
import {
  useCreateSlotLock,
  useTechnicians,
  useTimeSlots,
} from "@/features/booking/hooks/useBookingData";
import { useCreateCashierAppointment } from "../hooks/useCashier";
import { filterSlotsAfterNow } from "@/features/booking/utils/timeSlot.utils";
import type {
  TechnicianDTO,
  TimeSlotDTO,
} from "@/features/booking/types/booking.types";
import { CustomerFormDialog } from "@/features/customers/components/CustomerFormDialog";
import { customerApi } from "@/features/customers/api/customer.api";
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import type { CustomerDto } from "@/features/customers/types/customer.types";
import { useSalons } from "@/features/salons/hooks/useSalons";
import type { SalonListItem } from "@/features/salons/types/salon.types";
import { useServices } from "@/features/services/hooks/useServices";
import type { ServiceDto } from "@/features/services/types/service.types";
import { AdminInput } from "@/shared/components/forms/AdminInput";
import { AdminTextarea } from "@/shared/components/forms/AdminTextarea";
import { FormField } from "@/shared/components/forms/FormField";
import { FormSection } from "@/shared/components/forms/FormSection";
import { Button } from "@/shared/components/ui/button";
import { SearchableSelect } from "@/shared/components/ui/searchable-select";
import { FallbackImage } from "@/shared/components/FallbackImage";
import type { Result } from "@/shared/types/common.types";
import { formatDate } from "@/shared/utils/date.utils";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cashierApi } from "../api/cashier.api";
import type { CashierPosition } from "../types";

interface CashierBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function todayInputValue() {
  return formatDate(new Date()).format("YYYY-MM-DD");
}

function CashierBookingForm({ onClose }: { onClose: () => void }) {
  const getEffectiveSalonId = useAuthStore((s) => s.getEffectiveSalonId);
  const defaultSalonId = getEffectiveSalonId();
  const queryClient = useQueryClient();

  const [success, setSuccess] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDto | null>(
    null,
  );
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);

  const [salonId, setSalonId] = useState<number | null>(defaultSalonId);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [appointmentDate, setAppointmentDate] = useState(todayInputValue());
  const [selectedTechnician, setSelectedTechnician] =
    useState<TechnicianDTO | null>(null);
  const [slotId, setSlotId] = useState<number | null>(null);
  const [positionId, setPositionId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");

  const createSlotLockMutation = useCreateSlotLock();
  const createAppointmentMutation = useCreateCashierAppointment();
  const isSubmitting =
    createSlotLockMutation.isPending || createAppointmentMutation.isPending;

  const customersQuery = useCustomers({
    pageIndex: 1,
    pageSize: 20,
    filter: customerSearch || undefined,
  });
  const customerList = customersQuery.data?.data?.items ?? [];

  const salonsQuery = useSalons({ pageIndex: 1, pageSize: 100 });
  const salonItems = useMemo(
    () => salonsQuery.data?.data?.items ?? [],
    [salonsQuery.data?.data?.items],
  );

  const servicesQuery = useServices({ pageIndex: 1, pageSize: 200 });
  const serviceItems = servicesQuery.data?.data?.items ?? [];

  const technicianIdForApi =
    selectedTechnician && !selectedTechnician.isAny
      ? selectedTechnician.id
      : undefined;

  const techniciansQuery = useTechnicians({
    date: appointmentDate ?? undefined,
    serviceId: serviceId ?? undefined,
    salonId: salonId ?? undefined,
  });
  const technicians = techniciansQuery.data ?? [];

  const timeSlotsQuery = useTimeSlots({
    date: appointmentDate ?? undefined,
    serviceId: serviceId ?? undefined,
    staffId: technicianIdForApi,
    salonId: salonId ?? undefined,
  });
  const timeSlots = useMemo(
    () => filterSlotsAfterNow(timeSlotsQuery.data ?? [], appointmentDate),
    [timeSlotsQuery.data, appointmentDate],
  );

  const positionsQuery = useQuery({
    queryKey: ["cashier-positions", salonId, appointmentDate],
    queryFn: async () => {
      const res = await cashierApi.getPositions(salonId, appointmentDate);
      return res.data ?? [];
    },
    enabled: !!salonId && !!appointmentDate,
  });
  const positions = positionsQuery.data ?? [];

  const salonOptions = useMemo(
    () =>
      salonItems
        .filter((s: SalonListItem) => s.id != null)
        .map((s: SalonListItem) => ({
          value: String(s.id),
          label: s.name ?? "",
        })),
    [salonItems],
  );

  const serviceOptions = useMemo(
    () =>
      serviceItems
        .filter((s: ServiceDto) => s.id != null)
        .map((s: ServiceDto) => {
          const parts = [s.name ?? ""];
          if (s.durationMins) parts.push(`${s.durationMins} phút`);
          if (s.sellingPrice != null)
            parts.push(`${s.sellingPrice.toLocaleString("vi-VN")}đ`);
          return { value: String(s.id), label: parts.join(" · ") };
        }),
    [serviceItems],
  );

  const positionOptions = useMemo(
    () => [
      { value: "none", label: "Không chọn" },
      ...positions.map((p: CashierPosition) => ({
        value: String(p.id),
        label: `${p.name} · ${p.roomName} — ${p.statusLabel}`,
        disabled: !p.isSelectable,
      })),
    ],
    [positions],
  );

  const selectedSalon = useMemo(() => {
    return salonItems.find((s: SalonListItem) => s.id === salonId) ?? null;
  }, [salonItems, salonId]);

  const selectedTimeSlot = useMemo(() => {
    return timeSlots.find((s: TimeSlotDTO) => s.slotId === slotId) ?? null;
  }, [timeSlots, slotId]);

  const effectiveSlotId = selectedTimeSlot?.slotId ?? null;

  const handleSelectCustomer = (c: CustomerDto) => {
    setSelectedCustomer(c);
    setCustomerSearch(c.fullName ?? "");
    setShowCustomerDropdown(false);
  };

  const handleCreatedCustomer = async (id: number) => {
    try {
      const result = await customerApi.getDetail(id);
      if (result.isSuccess && result.data) {
        setSelectedCustomer(result.data);
        setCustomerSearch(result.data.fullName ?? "");
      }
    } catch {
      toast.error("Đã tạo khách nhưng không tải được thông tin");
    }
  };

  const handleSalonChange = (value: string) => {
    setSalonId(value ? Number(value) : null);
    setSelectedTechnician(null);
    setSlotId(null);
    setPositionId(null);
  };

  const handleDateChange = (value: string) => {
    setAppointmentDate(value);
    setSelectedTechnician(null);
    setSlotId(null);
    setPositionId(null);
  };

  const handleServiceChange = (value: string) => {
    setServiceId(value ? Number(value) : null);
    setSelectedTechnician(null);
    setSlotId(null);
  };

  const handleSelectTechnician = (tech: TechnicianDTO) => {
    setSelectedTechnician(tech);
    setSlotId(null);
  };

  const handleCreateAnother = () => {
    setSuccess(false);
    setServiceId(null);
    setSelectedTechnician(null);
    setSlotId(null);
    setPositionId(null);
    setNote("");
    setFormError("");
    setAppointmentDate(todayInputValue());
  };

  const handleSubmit = async () => {
    setFormError("");

    if (!selectedCustomer?.id) {
      setFormError("Vui lòng chọn hoặc thêm khách hàng");
      return;
    }
    if (!salonId) {
      setFormError("Vui lòng chọn chi nhánh");
      return;
    }
    if (!serviceId) {
      setFormError("Vui lòng chọn dịch vụ");
      return;
    }
    if (!appointmentDate) {
      setFormError("Vui lòng chọn ngày hẹn");
      return;
    }
    if (!effectiveSlotId) {
      setFormError("Vui lòng chọn khung giờ");
      return;
    }

    try {
      const lockResult = await createSlotLockMutation.mutateAsync({
        locks: [
          {
            slotId: effectiveSlotId,
            staffId: selectedTechnician?.isAny
              ? null
              : (selectedTechnician?.id ?? null),
            positionId: positionId,
            appointmentDate,
            serviceId,
          },
        ],
      });

      if (!lockResult.success || !lockResult.lockIds[0]) {
        toast.error("Không thể giữ khung giờ. Vui lòng thử lại.");
        return;
      }

      const bookingResult = await createAppointmentMutation.mutateAsync({
        customerId: selectedCustomer.id,
        guests: [
          {
            lockId: lockResult.lockIds[0],
            staffId: selectedTechnician?.isAny
              ? null
              : (selectedTechnician?.id ?? null),
            slotId: effectiveSlotId,
            appointmentDate,
            salonId,
            positionId: positionId ?? undefined,
            note: note.trim() || undefined,
            services: [{ serviceId, quantity: 1 }],
          },
        ],
      });

      if (!bookingResult.isSuccess) {
        toast.error(bookingResult.message || "Đặt lịch thất bại");
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["cashier-positions"] });
      setSuccess(true);
      toast.success("Đặt lịch thành công!");
    } catch (error) {
      toast.error(
        getErrorMessage(
          error as AxiosError<Result<unknown>>,
          "Đặt lịch thất bại",
        ),
      );
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-2">
        <div className="relative w-full max-w-4xl max-h-[90vh] bg-adminGray-50 shadow-[0_32px_64px_rgba(42,31,26,0.15)] flex flex-col overflow-hidden border border-adminGold-600/20">
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-adminGold-600/10 bg-adminGray-50/80 z-10">
            <h2 className="text-xl font-bold text-adminInk">
              Thêm Lịch Khách Hàng Mới
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-adminGold-600/20 hover:bg-adminGold-600/10 text-adminGray-600 hover:text-adminInk transition-all shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-adminGray-50">
            {success ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-adminGreen-100 rounded-full flex items-center justify-center mb-6 border border-adminGreen-200 shadow-sm">
                  <CheckCircle2 className="w-10 h-10 text-adminGreen-600" />
                </div>
                <h3 className="text-2xl font-bold text-adminInk mb-2">
                  Đặt Lịch Thành Công!
                </h3>
                <p className="text-adminGray-600 text-sm mb-8">
                  Hệ thống đã ghi nhận lịch hẹn cho{" "}
                  {selectedCustomer?.fullName ?? "khách hàng"}.
                </p>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handleCreateAnother}
                    className="border-adminGold-600 text-adminInk hover:bg-adminGray-50"
                  >
                    Tạo thêm lịch mới
                  </Button>
                  <Button
                    onClick={onClose}
                    className="bg-adminGreen-600 text-white hover:bg-adminGreen-600/90 shadow-sm"
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 max-w-3xl mx-auto">
                <FormSection icon={User} title="Khách hàng">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label="Tìm khách hàng" className="sm:col-span-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-adminGray-400" />
                        <AdminInput
                          value={customerSearch}
                          onChange={(e) => {
                            setCustomerSearch(e.target.value);
                            setShowCustomerDropdown(true);
                            if (selectedCustomer) setSelectedCustomer(null);
                          }}
                          onFocus={() => setShowCustomerDropdown(true)}
                          placeholder="Tìm theo tên hoặc số điện thoại"
                          className="pl-9"
                        />
                        {showCustomerDropdown &&
                          customerSearch.trim().length > 0 && (
                            <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-md border border-adminGray-200 bg-white shadow-lg">
                              {customerList.length === 0 ? (
                                <p className="px-3 py-2 text-xs text-adminGray-500">
                                  Không tìm thấy khách hàng
                                </p>
                              ) : (
                                customerList.map((c: CustomerDto) => (
                                  <button
                                    key={c.id ?? c.phone}
                                    type="button"
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-adminGray-50 border-b border-adminGray-100 last:border-0"
                                    onClick={() => handleSelectCustomer(c)}
                                  >
                                    <span className="font-medium text-adminInk">
                                      {c.fullName}
                                    </span>
                                    <span className="text-adminGray-500 ml-2">
                                      {c.phone}
                                    </span>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                      </div>
                    </FormField>

                    <FormField label="Họ tên">
                      <AdminInput
                        value={selectedCustomer?.fullName ?? ""}
                        readOnly
                        placeholder="Chọn khách hàng"
                      />
                    </FormField>
                    <FormField label="Điện thoại">
                      <AdminInput
                        value={selectedCustomer?.phone ?? ""}
                        readOnly
                        placeholder="SĐT"
                      />
                    </FormField>
                  </div>
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCreateCustomerOpen(true)}
                    >
                      + Thêm khách hàng mới
                    </Button>
                  </div>
                </FormSection>

                <FormSection icon={Calendar} title="Thông tin lịch hẹn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label="Chi nhánh *">
                      <SearchableSelect
                        value={salonId ? String(salonId) : ""}
                        onValueChange={handleSalonChange}
                        options={salonOptions}
                        placeholder="Chọn chi nhánh"
                        searchPlaceholder="Tìm chi nhánh..."
                        className="h-9 w-full"
                      />
                    </FormField>

                    <FormField label="Ngày hẹn *">
                      <AdminInput
                        type="date"
                        value={appointmentDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                      />
                    </FormField>

                    <FormField label="Dịch vụ *" className="sm:col-span-2">
                      <SearchableSelect
                        value={serviceId ? String(serviceId) : ""}
                        onValueChange={handleServiceChange}
                        options={serviceOptions}
                        placeholder="Chọn dịch vụ"
                        searchPlaceholder="Tìm dịch vụ..."
                        className="h-9 w-full"
                      />
                    </FormField>

                    <div className="sm:col-span-2 space-y-2">
                      <p className="lotus-admin-form-label">
                        Nhân viên phục vụ
                      </p>
                      {!serviceId ? (
                        <p className="text-xs text-adminGray-500 py-3 text-center border border-dashed border-adminGray-200 rounded-md">
                          Chọn dịch vụ để xem kỹ thuật viên phù hợp
                        </p>
                      ) : techniciansQuery.isLoading ? (
                        <p className="text-xs text-adminGray-500 py-3 text-center">
                          Đang tải danh sách KTV...
                        </p>
                      ) : technicians.length === 0 ? (
                        <p className="text-xs text-adminGray-500 py-3 text-center border border-adminGray-200 rounded-md bg-adminGray-50">
                          Không có kỹ thuật viên làm việc trong ngày này
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {technicians.map((tech: TechnicianDTO) => {
                            const isSelected =
                              selectedTechnician?.isAny === true
                                ? !!tech.isAny
                                : selectedTechnician?.id === tech.id &&
                                  !tech.isAny;
                            const slotsLeft = tech.slotsLeft ?? 0;
                            const isReady = slotsLeft > 0;
                            const statusText =
                              tech.status ||
                              (isReady
                                ? `Còn ${slotsLeft} slot`
                                : "Nghỉ hôm nay");

                            return (
                              <button
                                key={tech.id ?? "any"}
                                type="button"
                                onClick={() => handleSelectTechnician(tech)}
                                className={`relative flex items-center gap-3 rounded-md border p-3 text-left transition-all ${
                                  isSelected
                                    ? "border-adminGreen-600 bg-adminGreen-50"
                                    : "border-adminGray-200 bg-white hover:border-adminGold-600/40"
                                }`}
                              >
                                {isSelected && (
                                  <div className="absolute top-0 right-0 w-5 h-5 bg-adminGreen-600 rounded-bl-md flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                )}
                                <FallbackImage
                                  kind="ktv"
                                  src={tech.avatar}
                                  alt={tech.name}
                                  className="w-10 h-10 rounded-full object-cover shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-adminInk truncate">
                                    {tech.name || "Kỹ thuật viên"}
                                  </p>
                                  <p className="text-xs text-adminGray-500 truncate">
                                    {tech.role || "Nhân viên"}
                                  </p>
                                  <span
                                    className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                      isReady
                                        ? "bg-adminGreen-100 text-adminGreen-800"
                                        : "bg-adminGray-100 text-adminGray-600"
                                    }`}
                                  >
                                    {statusText}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="lotus-admin-form-label">
                          Khung giờ *{" "}
                          <span className="font-normal text-adminGray-500 normal-case tracking-normal">
                            — Chọn tham khảo các khung giờ sau
                          </span>
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-adminGray-500">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full border border-adminGray-300 bg-white inline-block" />
                            Trống
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-300 inline-block" />
                            Đã đặt
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-adminGray-200 inline-block" />
                            Ngoài giờ
                          </span>
                        </div>
                      </div>

                      {!serviceId || !appointmentDate ? (
                        <p className="text-xs text-adminGray-500 py-3 text-center border border-dashed border-adminGray-200 rounded-md">
                          Chọn dịch vụ và ngày để xem khung giờ
                        </p>
                      ) : timeSlotsQuery.isLoading ? (
                        <p className="text-xs text-adminGray-500 py-3 text-center">
                          Đang tải khung giờ...
                        </p>
                      ) : timeSlots.length === 0 ? (
                        <p className="text-xs text-adminGray-500 py-3 text-center border border-adminGray-200 rounded-md bg-adminGray-50">
                          Không có khung giờ trong ngày này
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                          {timeSlots.map((slot: TimeSlotDTO) => {
                            const isSelected =
                              selectedTimeSlot?.slotId === slot.slotId;
                            const s = (slot.status || "").toLowerCase();
                            let label = "Không khả dụng";
                            let isAvailable = false;
                            let classes =
                              "border-adminGray-200 bg-adminGray-50 text-adminGray-400 cursor-not-allowed opacity-60";

                            if (s === "available" || s === "trống") {
                              label = "Chưa có lịch";
                              isAvailable = true;
                              classes = isSelected
                                ? "border-adminGreen-600 bg-adminGreen-600 text-white"
                                : "border-adminGray-200 bg-white text-adminInk hover:border-adminGreen-500";
                            } else if (s === "booked" || s === "đầy") {
                              label = "Đã đặt";
                              classes =
                                "border-red-100 bg-red-50 text-red-600 cursor-not-allowed line-through opacity-70";
                            } else if (s === "outside") {
                              label = "Ngoài giờ";
                            } else if (s === "break" || s === "nghỉ") {
                              label = "Nghỉ";
                            }

                            return (
                              <button
                                key={`slot-${slot.slotId}`}
                                type="button"
                                disabled={!isAvailable}
                                onClick={() => setSlotId(slot.slotId)}
                                className={`py-2 px-1 text-center rounded-md border transition-all flex flex-col items-center justify-center gap-0.5 ${classes}`}
                              >
                                <span className="text-xs font-bold">
                                  {slot.time}
                                </span>
                                <span className="text-[10px] opacity-90">
                                  {label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <FormField label="Phòng / vị trí" className="sm:col-span-2">
                      <SearchableSelect
                        value={positionId != null ? String(positionId) : "none"}
                        onValueChange={(v) =>
                          setPositionId(v === "none" ? null : Number(v))
                        }
                        options={positionOptions}
                        placeholder="Không chọn"
                        searchPlaceholder="Tìm phòng / vị trí..."
                        disabled={!salonId}
                        className="h-9 w-full"
                      />
                      {positionsQuery.isLoading && (
                        <p className="text-xs text-adminGray-500 mt-1">
                          Đang tải trạng thái vị trí...
                        </p>
                      )}
                    </FormField>
                  </div>
                </FormSection>

                <FormSection icon={NotebookPen} title="Ghi chú">
                  <FormField label="Ghi chú lịch hẹn">
                    <AdminTextarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Thông tin ghi chú"
                      rows={3}
                    />
                  </FormField>
                </FormSection>

                {formError && (
                  <p className="text-sm text-red-600">{formError}</p>
                )}
              </div>
            )}
          </div>

          {!success && (
            <div className="flex-shrink-0 flex items-center justify-between gap-3 px-6 py-4 border-t border-adminGold-600/10 bg-white">
              <div className="flex items-center gap-2 text-xs text-adminGray-600 min-w-0">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {selectedSalon?.name ?? "Chưa chọn chi nhánh"}
                </span>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Đóng
                </Button>
                <Button
                  type="button"
                  variant="admin"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu thông tin"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CustomerFormDialog
        open={createCustomerOpen}
        onOpenChange={setCreateCustomerOpen}
        onCreated={handleCreatedCustomer}
      />
    </>
  );
}

export function CashierBookingModal({
  isOpen,
  onClose,
}: CashierBookingModalProps) {
  const [formKey, setFormKey] = useState(0);
  const [wasOpen, setWasOpen] = useState(false);
  
  if (isOpen && !wasOpen) {
    setWasOpen(true);
    setFormKey((k) => k + 1);
  }
  if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  if (!isOpen) return null;

  return <CashierBookingForm key={formKey} onClose={onClose} />;
}
