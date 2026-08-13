import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTimeSlots } from "@/features/booking/hooks/useBookingData";
import { useServices } from "@/features/services/hooks/useServices";
import type { ServiceDto } from "@/features/services/types/service.types";
import { Modal } from "@/shared/components/Modal";
import { Badge } from "@/shared/elements/Badge";
import { FormField } from "@/shared/forms/FormField";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/tables/Table";
import { formatDate } from "@/shared/utils/date.utils";
import { useStaffAvailability } from "../hooks/useStaffAvailability";
import type { StaffAvailabilityDto, StaffAvailabilityStatus } from "../types";

interface StaffAvailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate: Date;
  salonId?: number | null;
}

function statusLabel(status: StaffAvailabilityStatus): string {
  if (status === "available") return "Rảnh";
  if (status === "busy") return "Bận";
  return "Nghỉ";
}

function statusBadgeVariant(
  status: StaffAvailabilityStatus,
): "success" | "danger" | "secondary" {
  if (status === "available") return "success";
  if (status === "busy") return "danger";
  return "secondary";
}

function noteText(row: StaffAvailabilityDto): string {
  if (row.status === "busy") {
    const parts = [row.busyTimeRange, row.busyCustomerName].filter(Boolean);
    if (parts.length > 0) return parts.join(" · ");
    return row.reason ?? "—";
  }
  return row.reason ?? "—";
}

export function StaffAvailabilityDialog({
  open,
  onOpenChange,
  currentDate,
  salonId,
}: StaffAvailabilityDialogProps) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<string | null>(null);

  const dateStr = formatDate(currentDate).format("YYYY-MM-DD");
  const hasSelectedServices = selectedServiceIds.length > 0;

  const servicesQuery = useServices({ pageIndex: 1, pageSize: 200 });
  const serviceItems = servicesQuery.data?.data?.items ?? [];

  const timeSlotsQuery = useTimeSlots({
    date: hasSelectedServices ? dateStr : undefined,
    serviceIds: selectedServiceIds,
    salonId: salonId ?? undefined,
  });

  const availabilityQuery = useStaffAvailability(
    open,
    currentDate,
    startTime,
    selectedServiceIds,
    salonId,
  );

  const rows = availabilityQuery.data?.data ?? [];

  const serviceOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    for (let index = 0; index < serviceItems.length; index++) {
      const service = serviceItems[index] as ServiceDto;
      if (service.id == null) continue;
      let alreadySelected = false;
      for (let selectedIndex = 0; selectedIndex < selectedServiceIds.length; selectedIndex++) {
        if (selectedServiceIds[selectedIndex] === service.id) {
          alreadySelected = true;
          break;
        }
      }
      if (alreadySelected) continue;
      options.push({
        value: String(service.id),
        label: service.name ?? "",
      });
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

  const slotOptions = useMemo(() => {
    const slots = timeSlotsQuery.data ?? [];
    const options: { value: string; label: string }[] = [];
    for (let index = 0; index < slots.length; index++) {
      const slot = slots[index];
      if (!slot.time) continue;
      options.push({
        value: slot.time,
        label: slot.time,
      });
    }
    return options;
  }, [timeSlotsQuery.data]);

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
    setStartTime(null);
  };

  const handleServiceRemove = (id: number) => {
    const next: number[] = [];
    for (let index = 0; index < selectedServiceIds.length; index++) {
      if (selectedServiceIds[index] === id) continue;
      next.push(selectedServiceIds[index]);
    }
    setSelectedServiceIds(next);
    setStartTime(null);
  };

  const handleSlotChange = (value: string) => {
    setStartTime(value ? value : null);
  };

  const handleClose = () => {
    setSelectedServiceIds([]);
    setStartTime(null);
    onOpenChange(false);
  };

  const showLoading =
    availabilityQuery.isFetching ||
    (hasSelectedServices && timeSlotsQuery.isFetching);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Tình trạng nhân viên"
      size="lg"
      scrollable
    >
      <p className="text-xs text-kit-muted mb-4">
        Ngày {currentDate.toLocaleDateString("vi-VN")} — chọn dịch vụ (có thể
        nhiều) và giờ để xem ai rảnh / bận cho combo.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <FormField label="Dịch vụ">
          <SearchableSelect
            options={serviceOptions}
            value=""
            onChange={handleServiceAdd}
            placeholder="Thêm dịch vụ..."
            searchPlaceholder="Tìm dịch vụ..."
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
        <FormField label="Giờ">
          <SearchableSelect
            options={slotOptions}
            value={startTime ?? ""}
            onChange={handleSlotChange}
            placeholder={
              hasSelectedServices ? "Chọn khung giờ..." : "Chọn dịch vụ trước"
            }
            searchPlaceholder="Tìm giờ..."
            disabled={!hasSelectedServices}
          />
        </FormField>
      </div>

      {!hasSelectedServices || !startTime ? (
        <p className="text-xs text-kit-muted py-6 text-center">
          Chọn dịch vụ và giờ để xem danh sách nhân viên.
        </p>
      ) : showLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-kit-primary animate-spin" />
        </div>
      ) : availabilityQuery.isError ? (
        <p className="text-xs text-kit-danger py-6 text-center">
          Không tải được tình trạng nhân viên.
        </p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-kit-muted py-6 text-center">
          Không có nhân viên phù hợp.
        </p>
      ) : (
        <div className="overflow-auto max-h-[50vh] rounded border border-kit">
          <Table hover striped size="sm">
            <TableHead className="bg-kit-page sticky top-0">
              <TableRow>
                <TableHeaderCell>Nhân viên</TableHeaderCell>
                <TableHeaderCell className="w-24">Trạng thái</TableHeaderCell>
                <TableHeaderCell>Ghi chú</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row: StaffAvailabilityDto) => (
                <TableRow key={row.staffId}>
                  <TableCell>{row.staffName}</TableCell>
                  <TableCell>
                    <Badge
                      variant={statusBadgeVariant(row.status)}
                      soft
                      pill
                    >
                      {statusLabel(row.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-kit-muted">
                    {noteText(row)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Modal>
  );
}
