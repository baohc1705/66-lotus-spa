import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { Badge } from "@/shared/elements/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/tables/Table";
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
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Tình trạng vị trí"
      size="md"
      scrollable
    >
      <p className="text-xs text-kit-muted mb-4">
        Ngày {currentDate.toLocaleDateString("vi-VN")} — vị trí trống / đã có
        lịch.
      </p>

      {positionsQuery.isFetching ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-kit-primary animate-spin" />
        </div>
      ) : positionsQuery.isError ? (
        <p className="text-xs text-kit-danger py-6 text-center">
          Không tải được danh sách vị trí.
        </p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-kit-muted py-6 text-center">
          Không có vị trí nào.
        </p>
      ) : (
        <div className="overflow-auto max-h-[50vh] rounded border border-kit">
          <Table hover striped size="sm">
            <TableHead className="bg-kit-page sticky top-0">
              <TableRow>
                <TableHeaderCell>Phòng / Vị trí</TableHeaderCell>
                <TableHeaderCell className="w-32">Trạng thái</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((position: CashierPosition) => (
                <TableRow key={position.id}>
                  <TableCell>
                    {position.roomName} · {position.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={position.isSelectable ? "success" : "danger"}
                      soft
                      pill
                    >
                      {position.statusLabel}
                    </Badge>
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
