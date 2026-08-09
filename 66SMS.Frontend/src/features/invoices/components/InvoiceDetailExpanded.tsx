import { useState } from "react";
import { Ban, Printer, Receipt } from "lucide-react";

import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/elements/Button";
import { Nav, NavItem, NavLink } from "@/shared/elements/Nav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/tables/Table";
import {
  TableDetailActions,
  TableDetailExpanded,
  TableDetailField,
  TableDetailGrid,
  TableDetailHeader,
} from "@/shared/tables/TableDetailExpanded";
import { formatCurrency } from "@/shared/utils/currency";

import { INVOICE_PERM } from "../constants/invoice.permissions";
import { useInvoiceDetail } from "../hooks/useInvoices";
import {
  INVOICE_ITEM_TYPE,
  INVOICE_STATUS,
  type InvoiceItemDto,
} from "../types/invoice.types";

interface Props {
  invoiceId: number;
  onCancel: (id: number) => void;
}

const ITEM_TYPE_LABEL: Record<number, string> = {
  [INVOICE_ITEM_TYPE.SERVICE]: "Dịch vụ",
  [INVOICE_ITEM_TYPE.PRODUCT]: "Sản phẩm",
  [INVOICE_ITEM_TYPE.TREATMENT_COURSE]: "Liệu trình",
};

export function InvoiceDetailExpanded({ invoiceId, onCancel }: Props) {
  const { data, isLoading } = useInvoiceDetail(invoiceId);
  const invoice = data?.data;
  const [tab, setTab] = useState<"money" | "detail">("money");

  if (isLoading) {
    return (
      <TableDetailExpanded>
        <p className="text-sm text-kit-muted">Đang tải chi tiết...</p>
      </TableDetailExpanded>
    );
  }

  if (!invoice) {
    return (
      <TableDetailExpanded>
        <p className="text-sm text-kit-muted">Không tải được chi tiết.</p>
      </TableDetailExpanded>
    );
  }

  const items = invoice.items ?? [];
  const canCancel =
    invoice.status !== INVOICE_STATUS.CANCELLED &&
    invoice.status !== INVOICE_STATUS.REFUNDED;

  const customerLabel =
    (invoice.customerName ?? "Khách vãng lai") +
    (invoice.customerPhone ? ` (${invoice.customerPhone})` : "");

  return (
    <TableDetailExpanded maxHeightClass="max-h-100">
      <TableDetailHeader
        icon={<Receipt className="h-5 w-5 text-kit-primary" />}
        title={invoice.invoiceCode ?? "Hóa đơn"}
        subtitle={
          customerLabel + (invoice.salonName ? ` · ${invoice.salonName}` : "")
        }
      />

      <Nav pills className="mb-2">
        <NavItem>
          <NavLink active={tab === "money"} onClick={() => setTab("money")}>
            Tiền
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink active={tab === "detail"} onClick={() => setTab("detail")}>
            Chi tiết ({items.length})
          </NavLink>
        </NavItem>
      </Nav>

      {tab === "money" ? (
        <TableDetailGrid cols={2}>
          <TableDetailField
            label="Tạm tính"
            value={formatCurrency(invoice.subTotal)}
          />
          {(invoice.discountAmount ?? 0) > 0 ? (
            <TableDetailField
              label="Giảm giá"
              value={`-${formatCurrency(invoice.discountAmount)}`}
            />
          ) : null}
          {(invoice.membershipDiscountAmount ?? 0) > 0 ? (
            <TableDetailField
              label="Giảm hạng TV"
              value={`-${formatCurrency(invoice.membershipDiscountAmount)}`}
            />
          ) : null}
          {(invoice.loyaltyPointsValue ?? 0) > 0 ? (
            <TableDetailField
              label={`Điểm dùng (${invoice.loyaltyPointsUsed ?? 0}đ)`}
              value={`-${formatCurrency(invoice.loyaltyPointsValue)}`}
            />
          ) : null}
          {(invoice.taxAmount ?? 0) > 0 ? (
            <TableDetailField
              label="Thuế"
              value={`+${formatCurrency(invoice.taxAmount)}`}
            />
          ) : null}
          <TableDetailField
            label="Tổng"
            value={formatCurrency(invoice.totalAmount)}
          />
          <TableDetailField
            label="Khách trả"
            value={formatCurrency(invoice.paidAmount)}
          />
          {(invoice.changeAmount ?? 0) > 0 ? (
            <TableDetailField
              label="Tiền thối"
              value={formatCurrency(invoice.changeAmount)}
            />
          ) : null}
          {(invoice.loyaltyPointsEarned ?? 0) > 0 ? (
            <TableDetailField
              label="Điểm tích lũy"
              value={`+${invoice.loyaltyPointsEarned} điểm`}
            />
          ) : null}
          {invoice.note ? (
            <TableDetailField label="Ghi chú" value={invoice.note} />
          ) : null}
        </TableDetailGrid>
      ) : items.length === 0 ? (
        <p className="py-4 text-center text-sm text-kit-muted">
          Không có dòng nào.
        </p>
      ) : (
        <div className="overflow-x-auto rounded border border-kit bg-kit-white">
          <Table size="sm" hover>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Loại</TableHeaderCell>
                <TableHeaderCell>Mặt hàng</TableHeaderCell>
                <TableHeaderCell className="text-right">Đơn giá</TableHeaderCell>
                <TableHeaderCell className="text-center">SL</TableHeaderCell>
                <TableHeaderCell className="text-right">Giảm</TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Thành tiền
                </TableHeaderCell>
                <TableHeaderCell>Kỹ thuật viên</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item: InvoiceItemDto) => (
                <TableRow key={item.id}>
                  <TableCell className="text-kit-muted">
                    {ITEM_TYPE_LABEL[item.itemType ?? 0] ?? "—"}
                  </TableCell>
                  <TableCell className="font-medium text-kit-heading">
                    {item.itemName ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-kit-muted">
                    {formatCurrency(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-center text-kit-muted">
                    {item.quantity ?? 1}
                  </TableCell>
                  <TableCell className="text-right text-kit-muted">
                    {formatCurrency(item.discountAmount)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-kit-heading">
                    {formatCurrency(item.lineTotal)}
                  </TableCell>
                  <TableCell className="text-kit-muted">
                    {item.staffName ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TableDetailActions>
        <Button
          variant="secondary"
          size="sm"
          className="mb-0"
          onClick={() => window.print()}
        >
          <Printer className="h-3.5 w-3.5" />
          In
        </Button>
        {canCancel && invoice.id ? (
          <PermissionGate
            resource={INVOICE_PERM.resource}
            action={INVOICE_PERM.update}
          >
            <Button
              variant="outline-danger"
              size="sm"
              className="mb-0"
              onClick={() => onCancel(invoice.id!)}
            >
              <Ban className="h-3.5 w-3.5" />
              Hủy
            </Button>
          </PermissionGate>
        ) : null}
      </TableDetailActions>
    </TableDetailExpanded>
  );
}
