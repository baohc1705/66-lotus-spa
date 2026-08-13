import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableResponsive,
  TableRow,
} from "@/shared/tables/Table";
import { formatCurrency } from "@/shared/utils/currency";
import { addMinutesToTime, toLocalTimeOnly } from "@/shared/utils/date.utils";

export type AppointmentServiceTableItem = {
  name?: string;
  durationMins?: number;
  price?: number;
};

type AppointmentServicesTableProps = {
  services: AppointmentServiceTableItem[];
  startTime?: string | null;
  size?: "sm" | "md";
};

export function AppointmentServicesTable({
  services,
  startTime,
  size = "sm",
}: AppointmentServicesTableProps) {
  if (!services || services.length === 0) {
    return <div className="text-sm text-kit-muted">Không có dịch vụ</div>;
  }

  const startHm = toLocalTimeOnly(startTime);
  let cursorMinsAdded = 0;
  let totalMins = 0;
  let totalPrice = 0;

  const rows: {
    key: string;
    name: string;
    timeRange: string;
    durationLabel: string;
    priceLabel: string;
  }[] = [];

  for (let index = 0; index < services.length; index++) {
    const service = services[index];
    const duration = service.durationMins ?? 0;
    const price = service.price ?? 0;
    totalMins += duration;
    totalPrice += price;

    let timeRange = "—";
    if (startHm && duration > 0) {
      const rowStart = addMinutesToTime(startHm, cursorMinsAdded);
      const rowEnd = addMinutesToTime(startHm, cursorMinsAdded + duration);
      timeRange = rowStart + " - " + rowEnd;
    }
    cursorMinsAdded += duration;

    rows.push({
      key: (service.name ?? "service") + "-" + index,
      name: service.name || "Dịch vụ",
      timeRange,
      durationLabel: duration > 0 ? duration + " phút" : "—",
      priceLabel: formatCurrency(price),
    });
  }

  function renderServiceRows() {
    const nodes = [];
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      nodes.push(
        <TableRow key={row.key}>
          <TableCell className="font-semibold text-kit-ink">
            {row.name}
          </TableCell>
          <TableCell className="whitespace-nowrap">{row.timeRange}</TableCell>
          <TableCell className="whitespace-nowrap">
            {row.durationLabel}
          </TableCell>
          <TableCell className="whitespace-nowrap text-right">
            {row.priceLabel}
          </TableCell>
        </TableRow>,
      );
    }
    return nodes;
  }

  return (
    <TableResponsive>
      <Table size={size} bordered>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Tên dịch vụ</TableHeaderCell>
            <TableHeaderCell className="whitespace-nowrap">
              Thời gian (bắt đầu - kết thúc)
            </TableHeaderCell>
            <TableHeaderCell className="whitespace-nowrap">
              Số thời gian phục vụ
            </TableHeaderCell>
            <TableHeaderCell className="whitespace-nowrap text-right">
              Tiền dịch vụ
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {renderServiceRows()}
          <TableRow>
            <TableCell colSpan={2} className="font-semibold text-kit-ink">
              Tổng
            </TableCell>
            <TableCell className="whitespace-nowrap font-semibold">
              {totalMins > 0 ? totalMins + " phút" : "—"}
            </TableCell>
            <TableCell className="whitespace-nowrap text-right font-semibold">
              {formatCurrency(totalPrice)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableResponsive>
  );
}
