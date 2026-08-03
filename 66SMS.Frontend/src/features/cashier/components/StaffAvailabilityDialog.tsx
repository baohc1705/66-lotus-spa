import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTimeSlots } from "@/features/booking/hooks/useBookingData";
import type { TimeSlotDTO } from "@/features/booking/types/booking.types";
import { useServices } from "@/features/services/hooks/useServices";
import type { ServiceDto } from "@/features/services/types/service.types";
import { SearchableSelect } from "@/shared/components/ui/searchable-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
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

function statusClass(status: StaffAvailabilityStatus): string {
  if (status === "available") return "text-adminGreen-600 font-semibold";
  if (status === "busy") return "text-red-600 font-semibold";
  return "text-adminGray-600 font-semibold";
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
  const [slotId, setSlotId] = useState<number | null>(null);

  const dateStr = formatDate(currentDate).format("YYYY-MM-DD");

  const servicesQuery = useServices({ pageIndex: 1, pageSize: 200 });

  const timeSlotsQuery = useTimeSlots(
    serviceId ? dateStr : null,
    serviceId ?? undefined,
    undefined,
    salonId ?? undefined,
  );

  const availabilityQuery = useStaffAvailability(
    open,
    currentDate,
    slotId,
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
    return slots.map((s: TimeSlotDTO) => ({
      value: String(s.slotId),
      label: s.time,
    }));
  }, [timeSlotsQuery.data]);

  const handleServiceChange = (value: string) => {
    const id = value ? Number(value) : null;
    setServiceId(id);
    setSlotId(null);
  };

  const handleSlotChange = (value: string) => {
    setSlotId(value ? Number(value) : null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setServiceId(null);
      setSlotId(null);
    }
    onOpenChange(next);
  };

  const showLoading =
    availabilityQuery.isFetching ||
    (serviceId != null && timeSlotsQuery.isFetching);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl font-sans">
        <DialogHeader>
          <DialogTitle className="text-base">Tình trạng nhân viên</DialogTitle>
          <DialogDescription className="text-xs">
            Ngày {currentDate.toLocaleDateString("vi-VN")} — chọn dịch vụ và giờ
            để xem ai rảnh / bận.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-adminInk">
              Dịch vụ
            </label>
            <SearchableSelect
              options={serviceOptions}
              value={serviceId ? String(serviceId) : ""}
              onValueChange={handleServiceChange}
              placeholder="Chọn dịch vụ..."
              searchPlaceholder="Tìm dịch vụ..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-adminInk">Giờ</label>
            <SearchableSelect
              options={slotOptions}
              value={slotId ? String(slotId) : ""}
              onValueChange={handleSlotChange}
              placeholder={
                serviceId ? "Chọn khung giờ..." : "Chọn dịch vụ trước"
              }
              searchPlaceholder="Tìm giờ..."
              disabled={!serviceId}
            />
          </div>
        </div>

        {!serviceId || !slotId ? (
          <p className="text-xs text-adminGray-600 py-6 text-center">
            Chọn dịch vụ và giờ để xem danh sách nhân viên.
          </p>
        ) : showLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-adminGreen-600 animate-spin" />
          </div>
        ) : availabilityQuery.isError ? (
          <p className="text-xs text-red-600 py-6 text-center">
            Không tải được tình trạng nhân viên.
          </p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-adminGray-600 py-6 text-center">
            Không có nhân viên phù hợp.
          </p>
        ) : (
          <div className="overflow-auto max-h-[50vh] border border-adminGray-100 rounded-[3px]">
            <table className="w-full text-xs">
              <thead className="bg-adminGray-50 sticky top-0">
                <tr className="text-left text-adminInk/80">
                  <th className="px-3 py-2 font-semibold">Nhân viên</th>
                  <th className="px-3 py-2 font-semibold w-24">Trạng thái</th>
                  <th className="px-3 py-2 font-semibold">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: StaffAvailabilityDto) => (
                  <tr
                    key={r.staffId}
                    className="border-t border-adminGray-100 hover:bg-adminGray-50/40"
                  >
                    <td className="px-3 py-2 text-adminInk">{r.staffName}</td>
                    <td className={`px-3 py-2 ${statusClass(r.status)}`}>
                      {statusLabel(r.status)}
                    </td>
                    <td className="px-3 py-2 text-adminGray-600">
                      {noteText(r)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
