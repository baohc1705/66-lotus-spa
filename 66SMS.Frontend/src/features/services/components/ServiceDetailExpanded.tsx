import { useState } from "react";
import { Pencil, Box, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { StatusBadge, type StatusMap } from "@/shared/components/StatusBadge";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { FallbackImage } from "@/shared/components/FallbackImage";
import {
  useDeleteServiceProduct,
  useServiceDetail,
} from "../hooks/useServices";
import type {
  ServiceDetailDto,
  ServiceProductResponse,
} from "../types/service.types";
import { SERVICE_PERM } from "../constants/service.permissions";
import { formatCurrency } from "@/shared/utils/currency";

interface ServiceDetailExpandedProps {
  serviceId: number;
  onEdit?: (service: ServiceDetailDto) => void;
}

const PRODUCT_STATUS_MAP: StatusMap = {
  "0": { label: "Ngừng dùng", variant: "error" },
  "1": { label: "Đang dùng", variant: "success", dot: true },
};

export function ServiceDetailExpanded({
  serviceId,
  onEdit,
}: ServiceDetailExpandedProps) {
  const { data: result, isLoading } = useServiceDetail(serviceId);
  const service = result?.data;
  const deleteMutation = useDeleteServiceProduct();
  const [deleteTarget, setDeleteTarget] =
    useState<ServiceProductResponse | null>(null);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 bg-adminGray-50/30">
        <div className="flex gap-4 mb-4">
          <Skeleton className="w-24 h-8" />
          <Skeleton className="w-24 h-8" />
        </div>
        <Skeleton className="w-48 h-6" />
        <div className="grid grid-cols-2 gap-8">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="p-6 text-center text-adminGray-600 text-sm bg-adminGray-50/30">
        Không tìm thấy thông tin dịch vụ
      </div>
    );
  }

  const products = service.serviceProducts || [];
  const primaryImage = service.imageUrl;

  return (
    <div className="bg-adminGray-50/30 w-full overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar">
      <Tabs defaultValue="info" className="w-full flex-col">
        <div className="px-4 pt-2 sticky top-0 bg-adminGray-50/95 backdrop-blur-sm z-10">
          <TabsList className="h-10 border-b border-adminGray-100/80 justify-start rounded-none bg-transparent p-0 flex flex-nowrap overflow-x-auto overflow-y-hidden hide-scrollbar">
            <TabsTrigger
              value="info"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-sm font-medium text-adminGray-600 hover:text-adminGreen-600/80 data-[state=active]:border-adminGreen-600 data-[state=active]:text-adminGreen-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Thông tin chung
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-sm font-medium text-adminGray-600 hover:text-adminGreen-600/80 data-[state=active]:border-adminGreen-600 data-[state=active]:text-adminGreen-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Sản phẩm tiêu hao ({products.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="info" className="p-4 m-0 border-none outline-none">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-adminGray-50/50 flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-adminGray-100/50">
                <FallbackImage
                  kind="service"
                  src={primaryImage}
                  alt={service.name ?? ""}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-adminInk truncate">
                  {service.name ?? "—"}
                </h3>
                <p className="text-xs text-adminGray-600 mt-0.5">
                  Mã: {service.code || "—"} · Thời gian:{" "}
                  {service.durationMins || 0} phút
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
              <div className="flex flex-col">
                <DetailField
                  label="Nhóm dịch vụ"
                  value={service.categoryName}
                />
                <DetailField label="Mô tả ngắn" value={service.description} />
                <DetailField
                  label="Giá cơ bản"
                  value={formatCurrency(service.costPrice)}
                />
              </div>
              <div className="flex flex-col">
                <DetailField
                  label="Hoa hồng"
                  value={
                    service.commissionRate != null
                      ? `${service.commissionRate}%`
                      : "—"
                  }
                />
                <DetailField label="Nội dung" value={service.content} />
                <DetailField
                  label="Giá bán"
                  value={formatCurrency(service.sellingPrice)}
                />
              </div>
            </div>

            <div className="flex items-end justify-end mt-2 pt-4 border-t border-adminGray-100/80">
              <PermissionGate
                resource={SERVICE_PERM.resource}
                action={SERVICE_PERM.update}
              >
                <Button
                  variant="admin"
                  size="sm"
                  onClick={() => onEdit?.(service)}
                  className="bg-adminGreen-600 hover:opacity-90 text-white shadow-sm h-8 px-4 text-sm gap-1.5 rounded-md transition-opacity"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Cập nhật
                </Button>
              </PermissionGate>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="products"
          className="p-4 m-0 border-none outline-none"
        >
          {products.length === 0 ? (
            <div className="py-8 text-center text-adminGray-600 text-sm">
              Chưa có sản phẩm tiêu hao nào được cấu hình cho dịch vụ này
            </div>
          ) : (
            <div className="rounded-md border border-adminGray-100 overflow-x-auto w-full">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead className="bg-adminGray-50 border-b border-adminGray-100 text-adminGray-600">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Tên sản phẩm</th>
                    <th className="py-2.5 px-4 font-semibold">Giá bán</th>
                    <th className="py-2.5 px-4 font-semibold text-center w-24">
                      Số lượng
                    </th>
                    <th className="py-2.5 px-4 font-semibold">Thành tiền</th>
                    <th className="py-2.5 px-4 font-semibold">Trạng thái</th>
                    <th className="py-2.5 px-4 font-semibold">Ghi chú</th>
                    <th className="py-2.5 px-4 font-semibold text-center w-16">
                      Xóa
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-adminGray-100 bg-white">
                  {products.map((prod: ServiceProductResponse) => (
                    <tr
                      key={prod.id || prod.productId}
                      className="hover:bg-adminGray-50/50 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-medium text-adminInk">
                        <div className="flex items-center gap-2">
                          <Box className="w-3.5 h-3.5 text-adminGreen-600/70" />
                          {prod.productName || "—"}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-adminGray-600">
                        {formatCurrency(prod.sellingPrice)}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-adminGray-600 text-center">
                        {prod.quantityUsed ?? "-"}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-adminGray-600">
                        {formatCurrency(
                          (prod.quantityUsed ?? 0) * (prod.sellingPrice ?? 0),
                        )}
                      </td>

                      <td className="py-2.5 px-4">
                        <StatusBadge
                          status={prod.status?.toString()}
                          statusMap={PRODUCT_STATUS_MAP}
                        />
                      </td>
                      <td
                        className="py-2.5 px-4 text-adminGray-600 truncate max-w-[200px]"
                        title={prod.note}
                      >
                        {prod.note || "—"}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <PermissionGate
                          resource={SERVICE_PERM.resource}
                          action={SERVICE_PERM.update}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-state-danger-text hover:text-state-danger-text hover:bg-state-danger-bg"
                            disabled={!prod.id}
                            onClick={() => setDeleteTarget(prod)}
                            title="Xóa sản phẩm khỏi dịch vụ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </PermissionGate>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

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
            <span className="font-semibold text-adminInk">
              {deleteTarget?.productName || "sản phẩm này"}
            </span>{" "}
            khỏi dịch vụ? Hành động không thể hoàn tác.
          </>
        }
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="py-3.5 border-b border-adminGray-100/80 last:border-b-0 group">
      <p className="text-xs text-adminGray-600 mb-1">{label}</p>
      <p className="text-sm font-medium text-adminInk truncate">
        {value || "—"}
      </p>
    </div>
  );
}
