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
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);

  const dateStr = formatDate(currentDate).format("YYYY-MM-DD");

  const servicesQuery = useServices({ pageIndex: 1, pageSize: 200 });

  const timeSlotsQuery = useTimeSlots({
    date: serviceId ? dateStr : undefined,
    serviceId: serviceId ?? undefined,
    salonId: salonId ?? undefined,
  });

  const availabilityQuery = useStaffAvailability(
    open,
    currentDate,
    startTime,
    serviceId,
    salonId,
  );

  const rows = availabilityQuery.data?.data ?? [];

  const serviceOptions = useMemo(() => {
    const items = servicesQuery.data?.data?.items ?? [];
    return items
      .filter((s: ServiceDto) => s.id != null)
      .map((s: ServiceDto) => ({
        value: String(s.id),
        label: s.name ?? "",
      }));
  }, [servicesQuery.data?.data?.items]);

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

  const handleServiceChange = (value: string) => {
    const id = value ? Number(value) : null;
    setServiceId(id);
    setStartTime(null);
  };

  const handleSlotChange = (value: string) => {
    setStartTime(value ? value : null);
  };

  const handleClose = () => {
    setServiceId(null);
    setStartTime(null);
    onOpenChange(false);
  };

  const showLoading =
    availabilityQuery.isFetching ||
    (serviceId != null && timeSlotsQuery.isFetching);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Tình trạng nhân viên"
      size="lg"
      scrollable
    >
      <p className="text-xs text-kit-muted mb-4">
        Ngày {currentDate.toLocaleDateString("vi-VN")} — chọn dịch vụ và giờ để
        xem ai rảnh / bận.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <FormField label="Dịch vụ">
          <SearchableSelect
            options={serviceOptions}
            value={serviceId ? String(serviceId) : ""}
            onChange={handleServiceChange}
            placeholder="Chọn dịch vụ..."
            searchPlaceholder="Tìm dịch vụ..."
          />
        </FormField>
        <FormField label="Giờ">
          <SearchableSelect
            options={slotOptions}
            value={startTime ?? ""}
            onChange={handleSlotChange}
            placeholder={
              serviceId ? "Chọn khung giờ..." : "Chọn dịch vụ trước"
            }
            searchPlaceholder="Tìm giờ..."
            disabled={!serviceId}
          />
        </FormField>
      </div>

      {!serviceId || !startTime ? (
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
