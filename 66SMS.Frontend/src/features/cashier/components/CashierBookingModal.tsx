import { useMemo, useState } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  MapPin,
  NotebookPen,
  Search,
  User,
} from "lucide-react";
import { toast } from "@/shared/utils/kitToast";
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
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import { Textarea } from "@/shared/forms/Textarea";
import { FallbackImage } from "@/shared/components/FallbackImage";
import type { Result } from "@/shared/types/common.types";
import { formatDate } from "@/shared/utils/date.utils";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cashierApi } from "../api/cashier.api";
import { CASHIER_POSITIONS } from "../cashierQueryKey";
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
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
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

  const hasSelectedServices = selectedServiceIds.length > 0;

  const techniciansQuery = useTechnicians({
    date: appointmentDate ?? undefined,
    serviceIds: selectedServiceIds,
    salonId: salonId ?? undefined,
  });
  const technicians = techniciansQuery.data ?? [];
  const noComboStaff =
    hasSelectedServices &&
    !techniciansQuery.isLoading &&
    technicians.length === 0;

  const timeSlotsQuery = useTimeSlots({
    date: appointmentDate ?? undefined,
    serviceIds: selectedServiceIds,
    staffId: technicianIdForApi,
    salonId: salonId ?? undefined,
  });
  const timeSlots = useMemo(
    () => filterSlotsAfterNow(timeSlotsQuery.data ?? [], appointmentDate),
    [timeSlotsQuery.data, appointmentDate],
  );

  const positionsQuery = useQuery({
    queryKey: [CASHIER_POSITIONS, salonId, appointmentDate],
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

  const serviceOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    for (let index = 0; index < serviceItems.length; index++) {
      const service = serviceItems[index];
      if (service.id == null) continue;
      let alreadySelected = false;
      for (let selectedIndex = 0; selectedIndex < selectedServiceIds.length; selectedIndex++) {
        if (selectedServiceIds[selectedIndex] === service.id) {
          alreadySelected = true;
          break;
        }
      }
      if (alreadySelected) continue;
      const parts = [service.name ?? ""];
      if (service.durationMins) parts.push(`${service.durationMins} phút`);
      if (service.sellingPrice != null)
        parts.push(`${service.sellingPrice.toLocaleString("vi-VN")}đ`);
      options.push({ value: String(service.id), label: parts.join(" · ") });
    }
    return options;
  }, [serviceItems, selectedServiceIds]);

  const selectedServiceLabels = useMemo(() => {
    const labels: { id: number; label: string }[] = [];
    for (let selectedIndex = 0; selectedIndex < selectedServiceIds.length; selectedIndex++) {
      const id = selectedServiceIds[selectedIndex];
      let label = `Dịch vụ #${id}`;
      for (let index = 0; index < serviceItems.length; index++) {
        if (serviceItems[index].id === id) {
          label = serviceItems[index].name ?? label;
          break;
        }
      }
      labels.push({ id, label });
    }
    return labels;
  }, [selectedServiceIds, serviceItems]);

  const positionOptions = useMemo(
    () => [
      { value: "none", label: "Không chọn" },
      ...positions
        .filter(
          (position: CashierPosition) =>
            position.isSelectable || position.id === positionId,
        )
        .map((position: CashierPosition) => ({
          value: String(position.id),
          label: `${position.name} · ${position.roomName} — ${position.statusLabel}`,
        })),
    ],
    [positions, positionId],
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

  const handleServiceAdd = (value: string) => {
    if (!value) return;
    const id = Number(value);
    if (!id || Number.isNaN(id)) return;
    let exists = false;
    for (let index = 0; index < selectedServiceIds.length; index++) {
      if (selectedServiceIds[index] === id) {
        exists = true;
        break;
      }
    }
    if (exists) return;
    setSelectedServiceIds([...selectedServiceIds, id]);
    setSelectedTechnician(null);
    setSlotId(null);
  };

  const handleServiceRemove = (id: number) => {
    const next: number[] = [];
    for (let index = 0; index < selectedServiceIds.length; index++) {
      if (selectedServiceIds[index] === id) continue;
      next.push(selectedServiceIds[index]);
    }
    setSelectedServiceIds(next);
    setSelectedTechnician(null);
    setSlotId(null);
  };

  const handleSelectTechnician = (tech: TechnicianDTO) => {
    setSelectedTechnician(tech);
    setSlotId(null);
  };

  const handleCreateAnother = () => {
    setSuccess(false);
    setSelectedServiceIds([]);
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
    if (selectedServiceIds.length === 0) {
      setFormError("Vui lòng chọn ít nhất 1 dịch vụ");
      return;
    }
    if (noComboStaff) {
      setFormError(
        "Không có kỹ thuật viên nào thực hiện được tất cả dịch vụ đã chọn. Vui lòng bớt dịch vụ hoặc đặt tách lịch.",
      );
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

    const slotStartTime =
      selectedTimeSlot?.startTime || selectedTimeSlot?.time || undefined;

    const servicesPayload: { serviceId: number; quantity: number }[] = [];
    for (let index = 0; index < selectedServiceIds.length; index++) {
      servicesPayload.push({
        serviceId: selectedServiceIds[index],
        quantity: 1,
      });
    }

    try {
      const lockResult = await createSlotLockMutation.mutateAsync({
        locks: [
          {
            slotId: effectiveSlotId,
            startTime: slotStartTime,
            staffId: selectedTechnician?.isAny
              ? null
              : (selectedTechnician?.id ?? null),
            positionId: positionId,
            appointmentDate,
            serviceId: selectedServiceIds[0],
            serviceIds: selectedServiceIds,
            salonId,
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
            startTime: slotStartTime,
            appointmentDate,
            salonId,
            positionId: positionId ?? undefined,
            note: note.trim() || undefined,
            services: servicesPayload,
          },
        ],
      });

      if (!bookingResult.isSuccess) {
        toast.error(bookingResult.message || "Đặt lịch thất bại");
        return;
      }

      await queryClient.invalidateQueries({ queryKey: [CASHIER_POSITIONS] });
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

  function renderTechnicianList() {
    const list = [];
    for (let index = 0; index < technicians.length; index++) {
      const tech = technicians[index];
      let isSelected = false;
      if (selectedTechnician?.isAny === true) {
        isSelected = !!tech.isAny;
      } else if (selectedTechnician?.id === tech.id && !tech.isAny) {
        isSelected = true;
      }

      const slotsLeft = tech.slotsLeft ?? 0;
      const isReady = slotsLeft > 0;
      let statusText = tech.status || "";
      if (!statusText) {
        if (isReady) {
          statusText = "Còn " + slotsLeft + " khung giờ";
        } else {
          statusText = "Nghỉ hôm nay";
        }
      }

      let cardClass =
        "relative flex items-center gap-3 rounded border p-3 text-left ";
      if (isSelected) {
        cardClass = cardClass + "border-kit-success bg-kit-page";
      } else {
        cardClass =
          cardClass + "border-kit bg-kit-white hover:border-kit-primary";
      }

      let statusClass =
        "mt-1 inline-block rounded px-1.5 py-0.5 text-xs font-bold ";
      if (isReady) {
        statusClass = statusClass + "bg-kit-page text-kit-success";
      } else {
        statusClass = statusClass + "bg-kit-page text-kit-muted";
      }

      list.push(
        <button
          key={tech.id ?? "any"}
          type="button"
          onClick={() => handleSelectTechnician(tech)}
          className={cardClass}
        >
          {isSelected ? (
            <div className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-bl bg-kit-success">
              <Check className="h-3 w-3 text-kit-white" />
            </div>
          ) : null}
          <FallbackImage
            kind="ktv"
            src={tech.avatar}
            alt={tech.name}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-kit-heading">
              {tech.name || "Kỹ thuật viên"}
            </p>
            <p className="truncate text-xs text-kit-muted">
              {tech.role || "Nhân viên"}
            </p>
            <span className={statusClass}>{statusText}</span>
          </div>
        </button>,
      );
    }

    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{list}</div>
    );
  }

  function renderTimeSlotList() {
    const list = [];
    for (let index = 0; index < timeSlots.length; index++) {
      const slot = timeSlots[index];
      const isSelected = selectedTimeSlot?.slotId === slot.slotId;
      const slotStatus = (slot.status || "").toLowerCase();

      let label = "Không khả dụng";
      let isAvailable = false;
      let classes =
        "border-kit bg-kit-page text-kit-muted cursor-not-allowed opacity-60";

      if (slotStatus === "available" || slotStatus === "trống") {
        label = "Chưa có lịch";
        isAvailable = true;
        if (isSelected) {
          classes = "border-kit-success bg-kit-success text-kit-white";
        } else {
          classes =
            "border-kit bg-kit-white text-kit-heading hover:border-kit-success";
        }
      } else if (slotStatus === "booked" || slotStatus === "đầy") {
        label = "Đã đặt";
        classes =
          "border-kit bg-kit-page text-kit-danger cursor-not-allowed line-through opacity-70";
      } else if (slotStatus === "short") {
        label = "Không đủ giờ";
      } else if (slotStatus === "outside") {
        label = "Ngoài giờ";
      } else if (slotStatus === "break" || slotStatus === "nghỉ") {
        label = "Nghỉ";
      }

      list.push(
        <button
          key={"slot-" + slot.slotId}
          type="button"
          disabled={!isAvailable}
          onClick={() => setSlotId(slot.slotId)}
          className={
            "flex flex-col items-center justify-center gap-0.5 rounded border px-1 py-2 text-center " +
            classes
          }
        >
          <span className="text-xs font-bold">{slot.time}</span>
          <span className="text-xs opacity-90">{label}</span>
        </button>,
      );
    }

    return (
      <div className="grid max-h-60 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 md:grid-cols-6">
        {list}
      </div>
    );
  }

  const footer = success ? undefined : (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2 text-xs text-kit-muted">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">
          {selectedSalon?.name ?? "Chưa chọn chi nhánh"}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mb-0 mr-0"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Đóng
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="mb-0 mr-0"
          onClick={handleSubmit}
          loading={isSubmitting}
        >
          Lưu thông tin
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title="Thêm Lịch Khách Hàng Mới"
        size="xl"
        scrollable
        tone="primary"
        footer={footer}
      >
        {success ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-kit bg-kit-page">
              <CheckCircle2 className="h-8 w-8 text-kit-success" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-kit-heading">
              Đặt Lịch Thành Công!
            </h3>
            <p className="mb-6 text-sm text-kit-muted">
              Hệ thống đã ghi nhận lịch hẹn cho{" "}
              {selectedCustomer?.fullName ?? "khách hàng"}.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="mb-0 mr-0"
                onClick={handleCreateAnother}
              >
                Tạo thêm lịch mới
              </Button>
              <Button
                variant="success"
                size="sm"
                className="mb-0 mr-0"
                onClick={onClose}
              >
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <FormSection icon={User} title="Khách hàng">
              <FormField label="Tìm khách hàng">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kit-muted" />
                  <Input
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
                  customerSearch.trim().length > 0 ? (
                    <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded border border-kit bg-kit-white shadow-lg">
                      {customerList.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-kit-muted">
                          Không tìm thấy khách hàng
                        </p>
                      ) : (
                        customerList.map((customer: CustomerDto) => (
                          <button
                            key={customer.id ?? customer.phone}
                            type="button"
                            className="w-full border-b border-kit px-3 py-2 text-left text-sm last:border-0 hover:bg-kit-page"
                            onClick={() => handleSelectCustomer(customer)}
                          >
                            <span className="font-medium text-kit-heading">
                              {customer.fullName}
                            </span>
                            <span className="ml-2 text-kit-muted">
                              {customer.phone}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  ) : null}
                </div>
              </FormField>

              <FormRow>
                <FormField label="Họ tên">
                  <Input
                    value={selectedCustomer?.fullName ?? ""}
                    readOnly
                    placeholder="Chọn khách hàng"
                  />
                </FormField>
                <FormField label="Điện thoại">
                  <Input
                    value={selectedCustomer?.phone ?? ""}
                    readOnly
                    placeholder="Số điện thoại"
                  />
                </FormField>
              </FormRow>

              <Button
                type="button"
                variant="outline-primary"
                size="sm"
                className="mb-0 mr-0"
                onClick={() => setCreateCustomerOpen(true)}
              >
                + Thêm khách hàng mới
              </Button>
            </FormSection>

            <FormSection icon={Calendar} title="Thông tin lịch hẹn">
              <FormRow>
                <FormField label="Chi nhánh" required>
                  <SearchableSelect
                    value={salonId ? String(salonId) : ""}
                    onChange={handleSalonChange}
                    options={salonOptions}
                    placeholder="Chọn chi nhánh"
                    searchPlaceholder="Tìm chi nhánh..."
                    className="w-full"
                  />
                </FormField>
                <FormField label="Ngày hẹn" required>
                  <Input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                </FormField>
              </FormRow>

              <FormField
                label="Dịch vụ"
                required
                help="Có thể chọn nhiều dịch vụ; một kỹ thuật viên sẽ làm hết combo"
              >
                <SearchableSelect
                  value=""
                  onChange={handleServiceAdd}
                  options={serviceOptions}
                  placeholder="Thêm dịch vụ..."
                  searchPlaceholder="Tìm dịch vụ..."
                  className="w-full"
                />
                {selectedServiceLabels.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedServiceLabels.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleServiceRemove(item.id)}
                        className="rounded-full border border-kit bg-kit-page px-3 py-1 text-xs font-semibold text-kit-ink hover:border-kit-danger hover:text-kit-danger"
                        title="Bỏ dịch vụ này"
                      >
                        {item.label} ×
                      </button>
                    ))}
                  </div>
                ) : null}
              </FormField>

              <FormField label="Nhân viên phục vụ">
                {!hasSelectedServices ? (
                  <p className="rounded border border-dashed border-kit py-3 text-center text-xs text-kit-muted">
                    Chọn dịch vụ để xem kỹ thuật viên phù hợp
                  </p>
                ) : null}
                {hasSelectedServices && techniciansQuery.isLoading ? (
                  <p className="py-3 text-center text-xs text-kit-muted">
                    Đang tải kỹ thuật viên...
                  </p>
                ) : null}
                {noComboStaff ? (
                  <p className="rounded border border-kit bg-kit-page py-3 text-center text-xs text-kit-muted">
                    Không có kỹ thuật viên nào thực hiện được tất cả dịch vụ đã
                    chọn. Vui lòng bớt dịch vụ hoặc đặt tách lịch.
                  </p>
                ) : null}
                {hasSelectedServices &&
                !techniciansQuery.isLoading &&
                technicians.length > 0
                  ? renderTechnicianList()
                  : null}
              </FormField>

              <FormField
                label="Khung giờ"
                required
                help="Chọn tham khảo các khung giờ sau"
              >
                <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-kit-muted">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-full border border-kit bg-kit-white" />
                    Trống
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-kit-danger" />
                    Đã đặt
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-kit-muted" />
                    Không đủ giờ
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-kit-page" />
                    Ngoài giờ
                  </span>
                </div>

                {!hasSelectedServices || !appointmentDate ? (
                  <p className="rounded border border-dashed border-kit py-3 text-center text-xs text-kit-muted">
                    Chọn dịch vụ và ngày để xem khung giờ
                  </p>
                ) : null}
                {noComboStaff ? (
                  <p className="rounded border border-kit bg-kit-page py-3 text-center text-xs text-kit-muted">
                    Không thể chọn giờ khi chưa có kỹ thuật viên phù hợp combo
                  </p>
                ) : null}
                {hasSelectedServices &&
                appointmentDate &&
                !noComboStaff &&
                timeSlotsQuery.isLoading ? (
                  <p className="py-3 text-center text-xs text-kit-muted">
                    Đang tải khung giờ...
                  </p>
                ) : null}
                {hasSelectedServices &&
                appointmentDate &&
                !noComboStaff &&
                !timeSlotsQuery.isLoading &&
                timeSlots.length === 0 ? (
                  <p className="rounded border border-kit bg-kit-page py-3 text-center text-xs text-kit-muted">
                    Không có khung giờ trong ngày này
                  </p>
                ) : null}
                {hasSelectedServices &&
                appointmentDate &&
                !noComboStaff &&
                !timeSlotsQuery.isLoading &&
                timeSlots.length > 0
                  ? renderTimeSlotList()
                  : null}
              </FormField>

              <FormField
                label="Phòng / vị trí"
                help={
                  positionsQuery.isLoading
                    ? "Đang tải trạng thái vị trí..."
                    : undefined
                }
              >
                <SearchableSelect
                  value={positionId != null ? String(positionId) : "none"}
                  onChange={(value) =>
                    setPositionId(value === "none" ? null : Number(value))
                  }
                  options={positionOptions}
                  placeholder="Không chọn"
                  searchPlaceholder="Tìm vị trí..."
                  disabled={!salonId}
                  className="w-full"
                />
              </FormField>
            </FormSection>

            <FormSection icon={NotebookPen} title="Ghi chú">
              <FormField label="Ghi chú lịch hẹn">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Thông tin ghi chú"
                  rows={3}
                />
              </FormField>
            </FormSection>

            {formError ? (
              <p className="text-sm text-kit-danger">{formError}</p>
            ) : null}
          </div>
        )}
      </Modal>

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
