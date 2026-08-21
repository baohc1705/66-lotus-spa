import { PRODUCT_PERM } from "@/features/products/constants/product.permissions";
import { useProductDetail } from "@/features/products/hooks/useProducts";
import type { ProductFullDto } from "@/features/products/types/product.types";
import { FallbackImage } from "@/shared/components/FallbackImage";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Tabs } from "@/shared/components/Tabs";
import { Button } from "@/shared/elements/Button";
import {
  TableDetailActions,
  TableDetailExpanded,
  TableDetailField,
  TableDetailGrid,
  TableDetailHeader,
} from "@/shared/tables/TableDetailExpanded";
import { formatCurrency } from "@/shared/utils/currency";
import { Package, Pencil } from "lucide-react";
import { useState } from "react";

interface Props {
  productId: number;
  onEdit?: (product: ProductFullDto) => void;
}

export function ProductDetailExpanded({ productId, onEdit }: Props) {
  const { data: result, isLoading } = useProductDetail(productId);
  const product = result?.data;
  const perm = PRODUCT_PERM;
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

  if (!product) {
    return (
      <TableDetailExpanded className="bg-kit-white">
        <p className="py-4 text-center text-sm text-kit-muted">
          Không tìm thấy thông tin sản phẩm
        </p>
      </TableDetailExpanded>
    );
  }

  const images = product.images ?? [];
  let primaryImage: string | undefined;
  for (let index = 0; index < images.length; index++) {
    if (images[index].isPrimary === true && images[index].url) {
      primaryImage = images[index].url;
      break;
    }
  }
  if (!primaryImage && images.length > 0) primaryImage = images[0].url;

  return (
    <TableDetailExpanded className="bg-kit-white">
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
                    primaryImage ? (
                      <FallbackImage
                        kind="product"
                        src={primaryImage}
                        alt={product.name || ""}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-kit-muted" />
                    )
                  }
                  title={product.name}
                  subtitle={`Mã: ${product.code}`}
                />

                <TableDetailGrid cols={2}>
                  <TableDetailField
                    label="Danh mục"
                    value={product.categoryName}
                  />
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
                  <TableDetailField
                    label="Mô tả ngắn"
                    value={product.description}
                    className="md:col-span-2"
                  />
                  <TableDetailField
                    label="Nội dung"
                    value={product.content}
                    className="md:col-span-2"
                  />
                </TableDetailGrid>
              </>
            ),
          },
          {
            id: "images",
            label: "Hình ảnh",
            content: (
              <>
                {images.length === 0 ? (
                  <p className="py-6 text-center text-sm text-kit-muted">
                    Chưa có hình ảnh
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-3 py-1">
                    {images.map((image, index) => (
                      <div
                        key={image.id ?? index}
                        className="flex flex-col items-start gap-1"
                      >
                        <div className="h-28 w-28 overflow-hidden rounded-lg border border-kit bg-kit-page">
                          <FallbackImage
                            kind="product"
                            src={image.url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        {image.isPrimary === true ? (
                          <span className="text-xs font-medium text-kit-primary">
                            Ảnh chính
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ),
          },
        ]}
      />

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
