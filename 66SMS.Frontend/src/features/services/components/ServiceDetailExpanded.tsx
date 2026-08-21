import { SERVICE_PERM } from "@/features/services/constants/service.permissions";
import {
  useDeleteServiceProduct,
  useServiceDetail,
} from "@/features/services/hooks/useServices";
import type {
  ServiceFullDto,
  ServiceProductDto,
} from "@/features/services/types/service.types";
import {
  layMauLai,
  layNhanLai,
  type MauLai,
} from "@/features/services/utils/servicePricing";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { FallbackImage } from "@/shared/components/FallbackImage";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tabs } from "@/shared/components/Tabs";
import { Tooltip } from "@/shared/components/Tooltip";
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
import { Box, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface Props {
  serviceId: number;
  onEdit?: (service: ServiceFullDto) => void;
}

function profitBadgeVariant(
  mauLai: MauLai,
): "success" | "danger" | "secondary" {
  if (mauLai === "lai") return "success";
  if (mauLai === "lo") return "danger";
  return "secondary";
}

export function ServiceDetailExpanded({ serviceId, onEdit }: Props) {
  const { data: result, isLoading } = useServiceDetail(serviceId);
  const service = result?.data;
  const perm = SERVICE_PERM;
  const deleteMutation = useDeleteServiceProduct();
  const [deleteTarget, setDeleteTarget] = useState<ServiceProductDto | null>(
    null,
  );
  const [tabId, setTabId] = useState("info");

  if (isLoading) {
    return (
      <TableDetailExpanded className="bg-kit-white">
        <div className="flex items-center gap-3 pb-2">
          <div className="h-11 w-11 animate-pulse rounded-lg bg-kit-page" />
          <div className="space-y-2">
            <div className="h-4 w-48 animate-pulse rounded bg-kit-page" />
            <div className="h-3 w-32 animate-pulse rounded bg-kit-page" />
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div className="h-24 animate-pulse rounded bg-kit-page" />
          <div className="h-24 animate-pulse rounded bg-kit-page" />
        </div>
      </TableDetailExpanded>
    );
  }

  if (!service) {
    return (
      <TableDetailExpanded className="bg-kit-white">
        <p className="py-4 text-center text-sm text-kit-muted">
          Không tìm thấy thông tin dịch vụ
        </p>
      </TableDetailExpanded>
    );
  }

  const products = service.serviceProducts ?? [];
  const profitTone = layMauLai(service.grossProfit);

  return (
    <TableDetailExpanded className="bg-kit-white" maxHeightClass="max-h-100">
      <Tabs
        variant="body"
        activeId={tabId}
        onChange={setTabId}
        navClassName="mb-2"
        tabs={[
          {
            id: "info",
            label: "Thông tin",
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
                        {layNhanLai(profitTone)}
                      </Badge>
                    </span>
                  }
                  subtitle={`Mã: ${service.code || "—"} · Thời gian: ${service.durationMins || 0} phút`}
                />

                <TableDetailGrid cols={3}>
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
                  <TableDetailField
                    label="Nội dung"
                    value={service.content}
                    className="md:col-span-3"
                  />
                </TableDetailGrid>
              </>
            ),
          },
          {
            id: "products",
            label: `Sản phẩm tiêu hao (${products.length})`,
            content: (
              <>
                {products.length === 0 ? (
                  <p className="py-6 text-center text-sm text-kit-muted">
                    Chưa có sản phẩm tiêu hao
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
                          {onEdit ? (
                            <TableHeaderCell className="w-16 text-center">
                              Xóa
                            </TableHeaderCell>
                          ) : null}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id || product.productId}>
                            <TableCell>
                              <div className="flex items-center gap-2 font-medium text-kit-heading">
                                <Box className="h-3.5 w-3.5 text-kit-primary" />
                                {product.productName || "—"}
                              </div>
                            </TableCell>
                            <TableCell className="text-kit-muted">
                              {formatCurrency(product.unitCost)}
                            </TableCell>
                            <TableCell className="text-center text-kit-muted">
                              {product.quantityUsed ?? "-"}
                            </TableCell>
                            <TableCell className="text-kit-muted">
                              {formatCurrency(
                                (product.quantityUsed ?? 0) *
                                  (product.unitCost ?? 0),
                              )}
                            </TableCell>
                            <TableCell>
                              {product.status === 1 ? (
                                <Badge variant="success" soft>
                                  Đang dùng
                                </Badge>
                              ) : (
                                <Badge variant="danger" soft>
                                  Ngừng dùng
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs truncate text-kit-muted">
                              {product.note || "—"}
                            </TableCell>
                            {onEdit ? (
                              <TableCell className="text-center">
                                <PermissionGate
                                  resource={perm.resource}
                                  action={perm.update}
                                >
                                  <Tooltip text="Xóa sản phẩm khỏi dịch vụ">
                                    <Button
                                      size="icon-sm"
                                      variant="outline-danger"
                                      className="mb-0 mr-0"
                                      disabled={!product.id}
                                      onClick={() => setDeleteTarget(product)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </Tooltip>
                                </PermissionGate>
                              </TableCell>
                            ) : null}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            ),
          },
        ]}
      />

      {onEdit ? (
        <TableDetailActions>
          <PermissionGate resource={perm.resource} action={perm.update}>
            <Button
              variant="admin"
              size="sm"
              className="mb-0"
              onClick={() => onEdit(service)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Cập nhật
            </Button>
          </PermissionGate>
        </TableDetailActions>
      ) : null}

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
