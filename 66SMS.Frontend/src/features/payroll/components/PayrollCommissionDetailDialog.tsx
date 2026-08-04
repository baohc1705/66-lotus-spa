import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { formatCurrency } from "@/shared/utils/currency";
import { formatDisplayDate } from "@/shared/utils/date.utils";
import type {
  PayrollCommissionAppointmentDto,
  PayrollCommissionLineDto,
} from "../types/payroll.types";
import {
  formatSlotTime,
  resolveServiceEndTime,
} from "../utils/payrollStats.utils";

interface PayrollCommissionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: PayrollCommissionAppointmentDto | null;
}

export function PayrollCommissionDetailDialog({
  open,
  onOpenChange,
  appointment,
}: PayrollCommissionDetailDialogProps) {
  if (!appointment) return null;

  const start = formatSlotTime(appointment.slotStartTime);
  const end = resolveServiceEndTime(
    appointment.slotStartTime,
    appointment.slotEndTime,
    appointment.durationMins,
  );
  const timeLabel = start === "--:--" ? "—" : `${start} – ${end}`;
  const dateLabel =
    formatDisplayDate(appointment.issuedLocalDate) ||
    appointment.issuedLocalDate ||
    "—";
  const titleCode =
    appointment.appointmentCode ?? appointment.invoiceCode ?? "chi tiết";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết {titleCode}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-[5px] border border-adminGray-100 bg-adminGray-50/40 p-3 space-y-2 text-sm">
            <InfoRow
              label="Khách"
              value={
                appointment.customerPhone
                  ? `${appointment.customerName ?? "—"} · ${appointment.customerPhone}`
                  : (appointment.customerName ?? "—")
              }
            />
            <InfoRow label="Ngày HĐ" value={dateLabel} />
            <InfoRow label="Giờ phục vụ" value={timeLabel} />
            {appointment.invoiceCode && (
              <InfoRow label="Mã hóa đơn" value={appointment.invoiceCode} />
            )}
            {appointment.appointmentNote && (
              <InfoRow label="Ghi chú" value={appointment.appointmentNote} />
            )}
          </div>

          <div className="border border-adminGray-100 overflow-auto rounded-[5px]">
            <table className="w-full text-sm">
              <thead className="bg-adminGray-50 border-b border-adminGray-100">
                <tr className="text-left text-xs text-adminGray-600">
                  <th className="px-3 py-2 font-semibold">Dịch vụ</th>
                  <th className="px-3 py-2 font-semibold text-right">SL</th>
                  <th className="px-3 py-2 font-semibold text-right">Đơn giá</th>
                  <th className="px-3 py-2 font-semibold text-right">
                    Thành tiền
                  </th>
                  <th className="px-3 py-2 font-semibold text-right">% HH</th>
                  <th className="px-3 py-2 font-semibold text-right">Hoa hồng</th>
                </tr>
              </thead>
              <tbody>
                {appointment.lines.map((line: PayrollCommissionLineDto) => (
                  <tr
                    key={
                      line.invoiceItemId ?? `${line.itemName}-${line.lineTotal}`
                    }
                    className="border-b border-adminGray-100"
                  >
                    <td className="px-3 py-2 text-adminInk">
                      {line.itemName ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-right text-adminGray-600">
                      {line.quantity ?? 0}
                    </td>
                    <td className="px-3 py-2 text-right text-adminGray-600">
                      {formatCurrency(line.unitPrice)}
                    </td>
                    <td className="px-3 py-2 text-right text-adminInk">
                      {formatCurrency(line.lineTotal)}
                    </td>
                    <td className="px-3 py-2 text-right text-adminGray-600">
                      {line.commissionRate != null
                        ? `${line.commissionRate}%`
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-primary">
                      {formatCurrency(line.commissionAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-adminGray-50/80 border-t border-adminGray-100 text-sm">
                  <td
                    colSpan={3}
                    className="px-3 py-2.5 text-adminGray-600 font-medium"
                  >
                    Tổng
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-adminInk">
                    {formatCurrency(appointment.invoiceTotalAmount)}
                  </td>
                  <td className="px-3 py-2.5" />
                  <td className="px-3 py-2.5 text-right font-semibold text-primary">
                    {formatCurrency(appointment.totalCommission)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-adminGray-600 shrink-0">{label}</span>
      <span className="font-medium text-adminInk text-right">{value}</span>
    </div>
  );
}
