import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { formatDate } from "@/shared/utils/date.utils";
import { cashierApi } from "../api/cashier.api";
import type { CashierPosition } from "../types";

interface PositionAvailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate: Date;
  salonId?: number | null;
}

export function PositionAvailabilityDialog({
  open,
  onOpenChange,
  currentDate,
  salonId,
}: PositionAvailabilityDialogProps) {
  const dateStr = formatDate(currentDate).format("YYYY-MM-DD");

  const positionsQuery = useQuery({
    queryKey: ["cashier-position-availability", salonId, dateStr],
    queryFn: async () => {
      const res = await cashierApi.getPositions(salonId, dateStr);
      return res.data ?? [];
    },
    enabled: open,
    staleTime: 30_000,
  });

  const rows = positionsQuery.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl font-sans">
        <DialogHeader>
          <DialogTitle className="text-base">Tình trạng vị trí</DialogTitle>
          <DialogDescription className="text-xs">
            Ngày {currentDate.toLocaleDateString("vi-VN")} — vị trí trống / đã
            có lịch.
          </DialogDescription>
        </DialogHeader>

        {positionsQuery.isFetching ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-adminGreen-600 animate-spin" />
          </div>
        ) : positionsQuery.isError ? (
          <p className="text-xs text-red-600 py-6 text-center">
            Không tải được danh sách vị trí.
          </p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-adminGray-600 py-6 text-center">
            Không có vị trí nào.
          </p>
        ) : (
          <div className="overflow-auto max-h-[50vh] border border-adminGray-100 rounded-[3px]">
            <table className="w-full text-xs">
              <thead className="bg-adminGray-50 sticky top-0">
                <tr className="text-left text-adminInk/80">
                  <th className="px-3 py-2 font-semibold">Phòng / Vị trí</th>
                  <th className="px-3 py-2 font-semibold w-32">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p: CashierPosition) => (
                  <tr
                    key={p.id}
                    className="border-t border-adminGray-100 hover:bg-adminGray-50/40"
                  >
                    <td className="px-3 py-2 text-adminInk">
                      {p.roomName} · {p.name}
                    </td>
                    <td
                      className={`px-3 py-2 font-semibold ${
                        p.isSelectable
                          ? "text-adminGreen-600"
                          : "text-red-600"
                      }`}
                    >
                      {p.statusLabel}
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
