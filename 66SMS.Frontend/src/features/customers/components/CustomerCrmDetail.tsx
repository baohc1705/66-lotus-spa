import { useState } from "react";
import { FileText, Pencil, Trash2, User } from "lucide-react";

import { FallbackImage } from "@/shared/components/FallbackImage";
import { TabNav } from "@/shared/components/Tabs";
import { Badge, type BadgeVariant } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { Card, CardBody } from "@/shared/elements/Card";
import {
  TableDetailField,
  TableDetailGrid,
} from "@/shared/tables/TableDetailExpanded";
import { GENDER_MAP, STATUS_MAP } from "@/shared/constants/display.const";
import { formatDisplayDate } from "@/shared/utils/date.utils";

import { useCustomerDetail } from "../hooks/useCustomers";
import type { CustomerDto } from "../types/customer.types";

interface CustomerCrmDetailProps {
  customerId: number | null;
  onEdit: (customer: CustomerDto) => void;
  onDelete: (customer: CustomerDto) => void;
}

function statusBadge(status: number | null | undefined) {
  if (status == null) return "—";
  const label = STATUS_MAP[status] || "—";
  let variant: BadgeVariant = "secondary";
  if (status === 1) variant = "success";
  else if (status === 2) variant = "warning";
  else if (status === 0) variant = "danger";
  return (
    <Badge variant={variant} soft className="normal-case">
      {label}
    </Badge>
  );
}

export function CustomerCrmDetail({
  customerId,
  onEdit,
  onDelete,
}: CustomerCrmDetailProps) {
  const { data: result, isLoading } = useCustomerDetail(customerId);
  const customer = result?.data;
  const [tab, setTab] = useState("personal");

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded border border-kit bg-kit-white p-6 text-kit-muted shadow-kit-card">
        <p className="text-sm">Đang tải thông tin khách hàng...</p>
      </div>
    );
  }

  if (!customerId || !customer) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded border border-kit bg-kit-white p-6 text-center text-kit-muted shadow-kit-card">
        <User className="mb-2 h-12 w-12 stroke-[1.5] text-kit-muted/60" />
        <p className="text-sm font-medium">
          Chọn một khách hàng để xem chi tiết
        </p>
      </div>
    );
  }

  const code = customer.id ? `CS${String(customer.id).padStart(6, "0")}` : "—";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded border border-kit bg-kit-white shadow-kit-card">
      <div className="flex shrink-0 items-center justify-between border-b border-kit p-4">
        <h3 className="truncate text-sm font-bold text-kit-heading">
          Thông tin khách hàng -{" "}
          <span className="font-mono text-kit-body">{code}</span>
        </h3>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline-danger"
            className="mb-0"
            onClick={() => onDelete(customer)}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Xóa
          </Button>
          <Button
            type="button"
            size="sm"
            variant="primary"
            className="mb-0"
            onClick={() => onEdit(customer)}
          >
            <Pencil className="mr-1 h-3.5 w-3.5" />
            Sửa
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-kit bg-kit-page">
            <FallbackImage
              kind="customer"
              src={customer.avatarUrl}
              alt={customer.fullName || ""}
              className="h-16 w-16 object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-lg font-bold text-kit-heading">
              {customer.fullName || "—"}
            </h4>
            <div className="mt-1 space-y-0.5 text-xs text-kit-body">
              <p>
                Lần mua đầu:{" "}
                {customer.firstPurchaseAt
                  ? formatDisplayDate(customer.firstPurchaseAt)
                  : "chưa có"}
              </p>
              <p>
                Ghé thăm lần cuối:{" "}
                {customer.lastPurchaseAt
                  ? formatDisplayDate(customer.lastPurchaseAt)
                  : "chưa đến"}
              </p>
            </div>
          </div>
          <Badge variant="warning" className="shrink-0 normal-case">
            {customer.loyaltyPoint ?? 0} điểm
          </Badge>
        </div>

        <TabNav
          variant="nav-pills"
          activeId={tab}
          onChange={setTab}
          items={[
            { id: "personal", label: "Thông tin cá nhân" },
            { id: "note", label: "Ghi chú" },
          ]}
        />

        {tab === "personal" ? (
          <TableDetailGrid cols={2}>
            <TableDetailField label="Mã khách hàng" value={code} />
            <TableDetailField label="Số điện thoại" value={customer.phone} />
            <TableDetailField label="Email" value={customer.email} />
            <TableDetailField
              label="Giới tính"
              value={
                customer.gender !== null
                  ? GENDER_MAP[customer.gender] || "Khác"
                  : "—"
              }
            />
            <TableDetailField
              label="Ngày sinh"
              value={
                customer.dateOfBirth
                  ? formatDisplayDate(customer.dateOfBirth)
                  : "—"
              }
            />
            <TableDetailField
              label="Nguồn giới thiệu"
              value={customer.source}
            />
            <TableDetailField
              label="Trạng thái"
              value={statusBadge(customer.status)}
            />
            <TableDetailField
              label="Điểm tích lũy"
              value={String(customer.loyaltyPoint ?? 0)}
            />
            <TableDetailField label="Địa chỉ" value={customer.fullAddress} />
          </TableDetailGrid>
        ) : null}

        {tab === "note" ? (
          <Card className="mb-0 shadow-none">
            <CardBody className="flex items-start gap-2 p-3">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-kit-muted" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-bold text-kit-heading">
                  Ghi chú
                </p>
                <p className="mb-0 text-xs italic text-kit-body">
                  {customer.note || "Không có ghi chú nào"}
                </p>
              </div>
            </CardBody>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
