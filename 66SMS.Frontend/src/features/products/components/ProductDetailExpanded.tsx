import { Package, Pencil } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { useProductDetail } from "../hooks/useProducts";
import type { ProductDto } from "../types/product.types";
import { PRODUCT_PERM } from "../constants/product.permissions";
import { formatCurrency } from "@/shared/utils/currency";

interface ProductDetailExpandedProps {
  productId: number;
  onEdit?: (product: ProductDto) => void;
}

export function ProductDetailExpanded({
  productId,
  onEdit,
}: ProductDetailExpandedProps) {
  const { data: result, isLoading } = useProductDetail(productId);
  const product = result?.data;
  const perm = PRODUCT_PERM;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 bg-adminGray-50/30">
        <div className="flex gap-4 mb-4">
          <Skeleton className="w-14 h-14 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 mt-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 text-center text-adminGray-600 text-sm bg-adminGray-50/30">
        Không tìm thấy thông tin sản phẩm
      </div>
    );
  }

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url;

  return (
    <div className="bg-adminGray-50/30 w-full overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar p-4 m-0">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 pb-4 border-b border-adminGray-100/50">
          <div className="w-16 h-16 rounded-xl bg-adminGray-50/50 flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-adminGray-100/50 p-1">
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={product.name ?? ""}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="w-8 h-8 text-adminGray-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-adminInk truncate">
              {product.name ?? "—"}
            </h3>
            <p className="text-xs text-adminGray-600 mt-0.5 font-medium">
              Mã: {product.code || "—"} · Danh mục:{" "}
              {product.categoryName || "—"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
          <div className="flex flex-col">
            <DetailField label="Đơn vị tính" value={product.unit} />
            <DetailField
              label="Giá vốn"
              value={formatCurrency(product.costPrice)}
            />
            <DetailField
              label="Giá bán"
              value={formatCurrency(product.sellingPrice)}
            />
            <DetailField
              label="Tồn kho"
              value={product.stockQuantity?.toString()}
            />
            <DetailField
              label="Tồn kho tối thiểu"
              value={product.minStock?.toString()}
            />
          </div>
          <div className="flex flex-col">
            <DetailField label="Mô tả ngắn" value={product.description} />
            <DetailField label="Nội dung" value={product.content} />
          </div>
        </div>

        <div className="flex items-end justify-end mt-2 pt-4 border-t border-adminGray-100/80">
          <PermissionGate resource={perm.resource} action={perm.update}>
            <Button
              variant="admin"
              size="sm"
              onClick={() => onEdit?.(product)}
              className="bg-adminGreen-600 hover:opacity-90 text-white shadow-sm h-8 px-4 text-sm gap-1.5 rounded-md transition-opacity"
            >
              <Pencil className="w-3.5 h-3.5" />
              Cập nhật
            </Button>
          </PermissionGate>
        </div>
      </div>
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
      <p className="text-sm font-medium text-adminInk break-words whitespace-pre-wrap">
        {value || "—"}
      </p>
    </div>
  );
}
