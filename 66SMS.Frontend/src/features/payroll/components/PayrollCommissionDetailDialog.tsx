import { Modal } from "@/shared/components/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/tables/Table";
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

type PayrollCommissionDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: PayrollCommissionAppointmentDto | null;
};

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
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={`Chi tiết ${titleCode}`}
      size="lg"
      scrollable
    >
      <div className="space-y-4">
        <div className="space-y-2 rounded border border-kit bg-kit-page p-3 text-sm">
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
          {appointment.invoiceCode ? (
            <InfoRow label="Mã hóa đơn" value={appointment.invoiceCode} />
          ) : null}
          {appointment.appointmentNote ? (
            <InfoRow label="Ghi chú" value={appointment.appointmentNote} />
          ) : null}
        </div>

        <div className="overflow-auto rounded border border-kit">
          <Table bordered={false} hover striped>
            <TableHead className="bg-kit-page">
              <TableRow>
                <TableHeaderCell>Dịch vụ</TableHeaderCell>
                <TableHeaderCell className="text-right">SL</TableHeaderCell>
                <TableHeaderCell className="text-right">Đơn giá</TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Thành tiền
                </TableHeaderCell>
                <TableHeaderCell className="text-right">% HH</TableHeaderCell>
                <TableHeaderCell className="text-right">Hoa hồng</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointment.lines.map((line: PayrollCommissionLineDto) => (
                <TableRow
                  key={
                    line.invoiceItemId ?? `${line.itemName}-${line.lineTotal}`
                  }
                >
                  <TableCell className="text-kit-heading">
                    {line.itemName ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-kit-muted">
                    {line.quantity ?? 0}
                  </TableCell>
                  <TableCell className="text-right text-kit-muted">
                    {formatCurrency(line.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right text-kit-heading">
                    {formatCurrency(line.lineTotal)}
                  </TableCell>
                  <TableCell className="text-right text-kit-muted">
                    {line.commissionRate != null
                      ? `${line.commissionRate}%`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-kit-primary">
                    {formatCurrency(line.commissionAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableBody>
              <TableRow className="bg-kit-page">
                <TableCell colSpan={3} className="font-medium text-kit-muted">
                  Tổng
                </TableCell>
                <TableCell className="text-right font-semibold text-kit-heading">
                  {formatCurrency(appointment.invoiceTotalAmount)}
                </TableCell>
                <TableCell />
                <TableCell className="text-right font-semibold text-kit-primary">
                  {formatCurrency(appointment.totalCommission)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </Modal>
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
      <span className="shrink-0 text-kit-muted">{label}</span>
      <span className="text-right font-medium text-kit-heading">{value}</span>
    </div>
  );
}
