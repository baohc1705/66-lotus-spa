import { Activity, Pencil, Box } from "lucide-react";
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
import { useServiceDetail } from "../hooks/useServices";
import type { ServiceDTO } from "../types/service.types";

interface ServiceDetailExpandedProps {
  serviceId: number;
  onEdit?: (service: ServiceDTO) => void;
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

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 bg-stone-50/30">
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
      <div className="p-6 text-center text-lotus-stone text-sm bg-stone-50/30">
        Không tìm thấy thông tin dịch vụ
      </div>
    );
  }

  const products = service.serviceProducts || [];
  // Lấy ảnh đại diện nếu có
  const primaryImage =
    service.images?.find((img) => img.isPrimary)?.url ||
    service.images?.[0]?.url;

  return (
    <div className="bg-stone-50/30 w-full overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar">
      <Tabs defaultValue="info" className="w-full flex-col">
        {/* Tab Headers */}
        <div className="px-4 pt-2 sticky top-0 bg-stone-50/95 backdrop-blur-sm z-10">
          <TabsList className="h-10 border-b border-stone-200/80 justify-start rounded-none bg-transparent p-0 flex flex-nowrap overflow-x-auto overflow-y-hidden hide-scrollbar">
            <TabsTrigger
              value="info"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-[13px] font-medium text-lotus-stone hover:text-lotus-leaf/80 data-[state=active]:border-lotus-leaf data-[state=active]:text-lotus-leaf data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Thông tin chung
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="relative h-10 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-[13px] font-medium text-lotus-stone hover:text-lotus-leaf/80 data-[state=active]:border-lotus-leaf data-[state=active]:text-lotus-leaf data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none whitespace-nowrap transition-colors"
            >
              Sản phẩm tiêu hao ({products.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content - Info */}
        <TabsContent value="info" className="p-4 m-0 border-none outline-none">
          <div className="flex flex-col gap-4">
            {/* Header info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-lotus-cream/50 flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-stone-200/50">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={service.name ?? ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Activity className="w-7 h-7 text-lotus-stone" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-lotus-deep truncate">
                  {service.name ?? "—"}
                </h3>
                <p className="text-[12px] text-lotus-stone mt-0.5">
                  Mã: {service.code || "—"} · Thời gian:{" "}
                  {service.durationMins || 0} phút
                </p>
              </div>
            </div>

            {/* Grid for fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
              <div className="flex flex-col">
                <DetailField
                  label="Nhóm dịch vụ"
                  value={service.categoryName}
                />
                <DetailField label="Mô tả ngắn" value={service.description} />
                <DetailField
                  label="Giá cơ bản"
                  value={
                    service.costPrice
                      ? `${service.costPrice.toLocaleString()} ₫`
                      : "—"
                  }
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
                  value={
                    service.sellingPrice
                      ? `${service.sellingPrice.toLocaleString()} ₫`
                      : "—"
                  }
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-end justify-end mt-2 pt-4 border-t border-stone-100/80">
              <PermissionGate resource="services" action="update">
                <Button
                  variant="admin"
                  size="sm"
                  onClick={() => onEdit?.(service)}
                  className="bg-lotus-leaf hover:opacity-90 text-white shadow-sm h-8 px-4 text-[13px] gap-1.5 rounded-md transition-opacity"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Cập nhật
                </Button>
              </PermissionGate>
            </div>
          </div>
        </TabsContent>

        {/* Tab Content - Products */}
        <TabsContent
          value="products"
          className="p-4 m-0 border-none outline-none"
        >
          {products.length === 0 ? (
            <div className="py-8 text-center text-lotus-stone text-sm">
              Chưa có sản phẩm tiêu hao nào được cấu hình cho dịch vụ này
            </div>
          ) : (
            <div className="rounded-md border border-stone-200 overflow-x-auto w-full">
              <table className="w-full text-left text-[13px] min-w-[600px]">
                <thead className="bg-stone-50 border-b border-stone-200 text-lotus-stone">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Tên sản phẩm</th>
                    <th className="py-2.5 px-4 font-semibold">Giá bán</th>
                    <th className="py-2.5 px-4 font-semibold text-center w-24">
                      Số lượng
                    </th>
                    <th className="py-2.5 px-4 font-semibold">Thành tiền</th>
                    <th className="py-2.5 px-4 font-semibold">Trạng thái</th>
                    <th className="py-2.5 px-4 font-semibold">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {products.map((prod) => (
                    <tr
                      key={prod.id || prod.productId}
                      className="hover:bg-stone-50/50 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-medium text-lotus-deep">
                        <div className="flex items-center gap-2">
                          <Box className="w-3.5 h-3.5 text-lotus-leaf/70" />
                          {prod.productName || "—"}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-lotus-stone text-center">
                        {prod.sellingPrice ?? "-"}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-lotus-stone text-center">
                        {prod.quantityUsed ?? "-"}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-lotus-stone text-center">
                        {(prod.quantityUsed ?? 0) * (prod.sellingPrice ?? 0)}
                      </td>

                      <td className="py-2.5 px-4">
                        <StatusBadge
                          status={prod.status?.toString()}
                          statusMap={PRODUCT_STATUS_MAP}
                        />
                      </td>
                      <td
                        className="py-2.5 px-4 text-lotus-stone truncate max-w-[200px]"
                        title={prod.note}
                      >
                        {prod.note || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
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
    <div className="py-3.5 border-b border-stone-100/80 last:border-b-0 group">
      <p className="text-[12px] text-lotus-stone mb-1">{label}</p>
      <p className="text-[13px] font-medium text-lotus-deep truncate">
        {value || "—"}
      </p>
    </div>
  );
}
