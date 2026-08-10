import { Package, Pencil } from "lucide-react";

import { FallbackImage } from "@/shared/components/FallbackImage";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/elements/Button";
import {
  TableDetailActions,
  TableDetailExpanded,
  TableDetailField,
  TableDetailGrid,
  TableDetailHeader,
} from "@/shared/tables/TableDetailExpanded";
import { formatCurrency } from "@/shared/utils/currency";

import { useProductDetail } from "../hooks/useProducts";
import type { ProductFullDto } from "../types/product.types";
import { PRODUCT_PERM } from "../constants/product.permissions";

interface ProductDetailExpandedProps {
  productId: number;
  onEdit?: (product: ProductFullDto) => void;
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
      <TableDetailExpanded>
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

  if (!product) {
    return (
      <TableDetailExpanded>
        <p className="py-4 text-center text-sm text-kit-muted">
          Không tìm thấy thông tin sản phẩm
        </p>
      </TableDetailExpanded>
    );
  }

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url;

  return (
    <TableDetailExpanded>
      <TableDetailHeader
        icon={
          primaryImage ? (
            <FallbackImage
              kind="product"
              src={primaryImage}
              alt={product.name ?? ""}
              className="h-full w-full object-cover"
            />
          ) : (
            <Package className="h-6 w-6 text-kit-muted" />
          )
        }
        title={product.name ?? "—"}
        subtitle={`Mã: ${product.code || "—"} · Danh mục: ${product.categoryName || "—"}`}
      />

      <TableDetailGrid cols={2}>
        <TableDetailField label="Đơn vị tính" value={product.unit} />
        <TableDetailField
          label="Giá vốn"
          value={formatCurrency(product.costPrice)}
        />
        <TableDetailField
          label="Giá bán"
          value={
            <span className="font-bold text-kit-primary">
              {formatCurrency(product.sellingPrice)}
            </span>
          }
        />
        <TableDetailField
          label="Tồn kho"
          value={product.stockQuantity?.toString()}
        />
        <TableDetailField
          label="Tồn kho tối thiểu"
          value={product.minStock?.toString()}
        />
        <TableDetailField label="Mô tả ngắn" value={product.description} />
        <TableDetailField label="Nội dung" value={product.content} />
      </TableDetailGrid>

      <TableDetailActions>
        <PermissionGate resource={perm.resource} action={perm.update}>
          <Button
            variant="admin"
            size="sm"
            className="mb-0"
            onClick={() => onEdit?.(product)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Cập nhật
          </Button>
        </PermissionGate>
      </TableDetailActions>
    </TableDetailExpanded>
  );
}
