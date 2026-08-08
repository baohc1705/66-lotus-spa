import { useMemo, useState } from "react";
import { Pencil, Box, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Tabs } from "@/shared/components/Tabs";
import { Tooltip } from "@/shared/components/Tooltip";
import { FallbackImage } from "@/shared/components/FallbackImage";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import {
  TableDetailActions,
  TableDetailExpanded,
  TableDetailField,
  TableDetailGrid,
  TableDetailHeader,
} from "@/shared/tables/TableDetailExpanded";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/tables/Table";
import { formatCurrency } from "@/shared/utils/currency";

import {
  useDeleteServiceProduct,
  useServiceDetail,
} from "../hooks/useServices";
import type {
  ServiceDetailDto,
  ServiceProductResponse,
} from "../types/service.types";
import { SERVICE_PERM } from "../constants/service.permissions";
import {
  getProfitLabel,
  getProfitTone,
} from "../utils/servicePricing";

interface ServiceDetailExpandedProps {
  serviceId: number;
  onEdit?: (service: ServiceDetailDto) => void;
}

function profitBadgeVariant(
  tone: ReturnType<typeof getProfitTone>,
): "success" | "danger" | "secondary" {
  if (tone === "profit") return "success";
  if (tone === "loss") return "danger";
  return "secondary";
}

function productStatusBadge(status?: number) {
  if (status === 1) {
    return (
      <Badge variant="success" soft>
        Đang dùng
      </Badge>
    );
  }
  return (
    <Badge variant="danger" soft>
      Ngừng dùng
    </Badge>
  );
}

export function ServiceDetailExpanded({
  serviceId,
  onEdit,
}: ServiceDetailExpandedProps) {
  const { data: result, isLoading } = useServiceDetail(serviceId);
  const service = result?.data;
  const deleteMutation = useDeleteServiceProduct();
  const [deleteTarget, setDeleteTarget] =
    useState<ServiceProductResponse | null>(null);
  const [tabId, setTabId] = useState("info");

  const products = service?.serviceProducts ?? [];
  const profitTone = getProfitTone(service?.grossProfit);

  const tabs = useMemo(() => {
    if (!service) return [];

    return [
      {
        id: "info",
        label: "Thông tin chung",
        content: (
          <>
            <TableDetailHeader
              icon={
                <FallbackImage
                  kind="service"
                  src={service.imageUrl}
                  alt={service.name ?? ""}
                  className="h-full w-full object-cover"
                />
              }
              title={
                <span className="flex flex-wrap items-center gap-2">
                  <span>{service.name ?? "—"}</span>
                  <Badge variant={profitBadgeVariant(profitTone)} soft>
                    {getProfitLabel(profitTone)}
                  </Badge>
                </span>
              }
              subtitle={`Mã: ${service.code || "—"} · Thời gian: ${service.durationMins || 0} phút`}
            />

            <TableDetailGrid>
              <TableDetailField
                label="Nhóm dịch vụ"
                value={service.categoryName}
              />
              <TableDetailField
                label="Hoa hồng"
                value={
                  service.commissionRate != null
                    ? `${service.commissionRate}%`
                    : "—"
                }
              />
              <TableDetailField
                label="Mô tả ngắn"
                value={service.description}
              />
              <TableDetailField
                label="Tiền hoa hồng"
                value={formatCurrency(service.commissionAmount)}
              />
              <TableDetailField
                label="Giá cơ bản"
                value={formatCurrency(service.costPrice)}
              />
              <TableDetailField
                label="Giá bán tối thiểu"
                value={formatCurrency(service.minSellingPrice)}
              />
              <TableDetailField
                label="Chi phí tiêu hao"
                value={formatCurrency(service.productCost)}
              />
              <TableDetailField
                label="Giá bán"
                value={
                  <span className="font-bold text-kit-primary">
                    {formatCurrency(service.sellingPrice)}
                  </span>
                }
              />
              <TableDetailField
                label="Tổng giá vốn"
                value={formatCurrency(service.totalCost)}
              />
              <TableDetailField
                label="Lãi gộp"
                value={formatCurrency(service.grossProfit)}
              />
              <TableDetailField
                label="Biên lãi %"
                value={
                  service.grossMarginPercent != null
                    ? `${service.grossMarginPercent}%`
                    : "—"
                }
              />
            </TableDetailGrid>

            {service.content ? (
              <TableDetailField label="Nội dung" value={service.content} />
            ) : null}

            <TableDetailActions>
              <PermissionGate
                resource={SERVICE_PERM.resource}
                action={SERVICE_PERM.update}
              >
                <Button
                  variant="admin"
                  size="sm"
                  className="mb-0"
                  onClick={() => onEdit?.(service)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Cập nhật
                </Button>
              </PermissionGate>
            </TableDetailActions>
          </>
        ),
      },
      {
        id: "products",
        label: `Sản phẩm tiêu hao (${products.length})`,
        content:
          products.length === 0 ? (
            <p className="py-6 text-center text-sm text-kit-muted">
              Chưa có sản phẩm tiêu hao nào được cấu hình cho dịch vụ này
            </p>
          ) : (
            <div className="overflow-x-auto rounded border border-kit bg-kit-white">
              <Table size="sm" hover>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Tên sản phẩm</TableHeaderCell>
                    <TableHeaderCell>Giá gốc</TableHeaderCell>
                    <TableHeaderCell className="text-center">
                      Số lượng
                    </TableHeaderCell>
                    <TableHeaderCell>Thành tiền</TableHeaderCell>
                    <TableHeaderCell>Trạng thái</TableHeaderCell>
                    <TableHeaderCell>Ghi chú</TableHeaderCell>
                    <TableHeaderCell className="w-16 text-center">
                      Xóa
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((prod: ServiceProductResponse) => (
                    <TableRow key={prod.id || prod.productId}>
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium text-kit-heading">
                          <Box className="h-3.5 w-3.5 text-kit-primary" />
                          {prod.productName || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-kit-muted">
                        {formatCurrency(prod.unitCost)}
                      </TableCell>
                      <TableCell className="text-center text-kit-muted">
                        {prod.quantityUsed ?? "-"}
                      </TableCell>
                      <TableCell className="text-kit-muted">
                        {formatCurrency(
                          (prod.quantityUsed ?? 0) * (prod.unitCost ?? 0),
                        )}
                      </TableCell>
                      <TableCell>
                        {productStatusBadge(prod.status)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-kit-muted">
                        {prod.note || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <PermissionGate
                          resource={SERVICE_PERM.resource}
                          action={SERVICE_PERM.update}
                        >
                          <Tooltip text="Xóa sản phẩm khỏi dịch vụ">
                            <Button
                              size="icon-sm"
                              variant="outline-danger"
                              className="mb-0 mr-0"
                              disabled={!prod.id}
                              onClick={() => setDeleteTarget(prod)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </Tooltip>
                        </PermissionGate>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ),
      },
    ];
  }, [service, products, profitTone, onEdit]);

  if (isLoading) {
    return (
      <TableDetailExpanded>
        <p className="text-sm text-kit-muted">Đang tải chi tiết dịch vụ...</p>
      </TableDetailExpanded>
    );
  }

  if (!service) {
    return (
      <TableDetailExpanded>
        <p className="text-sm text-kit-muted">Không tìm thấy thông tin dịch vụ</p>
      </TableDetailExpanded>
    );
  }

  return (
    <TableDetailExpanded maxHeightClass="max-h-100">
      <Tabs
        tabs={tabs}
        activeId={tabId}
        onChange={setTabId}
        variant="body"
        navClassName="mb-2"
      />

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (!deleteTarget?.id) return;
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
        title="Xóa sản phẩm tiêu hao"
        description={
          <>
            Bạn có chắc muốn xóa{" "}
            <span className="font-semibold text-kit-heading">
              {deleteTarget?.productName || "sản phẩm này"}
            </span>{" "}
            khỏi dịch vụ? Hành động không thể hoàn tác.
          </>
        }
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </TableDetailExpanded>
  );
}
