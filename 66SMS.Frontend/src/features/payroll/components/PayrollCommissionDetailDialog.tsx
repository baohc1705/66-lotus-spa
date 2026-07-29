import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { formatCurrency } from "@/shared/utils/currency";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Chi tiết {appointment.appointmentCode ?? appointment.invoiceCode}
          </DialogTitle>
          <DialogDescription>
            Thông tin lịch hẹn, hóa đơn và hoa hồng từng dòng dịch vụ.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
          <InfoRow label="Khách" value={appointment.customerName} />
          <InfoRow label="SĐT" value={appointment.customerPhone} />
          <InfoRow
            label="Ngày HĐ (local)"
            value={appointment.issuedLocalDate}
          />
          <InfoRow label="Giờ phục vụ" value={timeLabel} />
          <InfoRow label="Mã hóa đơn" value={appointment.invoiceCode} />
          <InfoRow
            label="Tổng HĐ"
            value={formatCurrency(appointment.invoiceTotalAmount)}
          />
          <InfoRow
            label="Hoa hồng tổng"
            value={formatCurrency(appointment.totalCommission)}
          />
          <InfoRow label="Ghi chú LH" value={appointment.appointmentNote} />
        </div>

        <div className="border border-adminGray-100 overflow-auto">
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
          </table>
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
  value?: string | number | null;
}) {
  return (
    <div className="border border-adminGray-100 bg-adminGray-50/40 px-3 py-2">
      <p className="text-xs text-adminGray-600 font-semibold">{label}</p>
      <p className="text-sm text-adminInk font-medium mt-0.5">
        {value == null || value === "" ? "—" : String(value)}
      </p>
    </div>
  );
}
