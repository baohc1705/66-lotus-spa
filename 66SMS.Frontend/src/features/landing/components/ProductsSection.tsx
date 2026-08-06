import { motion } from "motion/react";
import { Eye } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { useProducts } from "@/features/products/hooks/useProducts";
import type { ProductDto } from "@/features/products/types/product.types";
import { FallbackImage } from "@/shared/components/FallbackImage";

function formatPrice(price?: number | null) {
  return `${(price || 0).toLocaleString("vi-VN")}đ`;
}

export const ProductsSection = () => {
  const { data, isLoading, isError } = useProducts({
    pageIndex: 1,
    pageSize: 8,
  });
  const products = data?.data?.items ?? [];

  return (
    <section
      id="products"
      className="landing-section bg-page"
      aria-labelledby="products-heading"
    >
      <div className="landing-container">
        <SectionHeader
          title="Sản phẩm"
          titleId="products-heading"
          variant="lotus"
          className="mb-10"
        />

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse border border-card-border bg-warm-100"
              />
            ))}
          </div>
        ) : isError ? (
          <p className="py-12 text-center font-geist text-sm text-warm-600">
            Không tải được danh sách sản phẩm. Vui lòng thử lại sau.
          </p>
        ) : products.length === 0 ? (
          <p className="py-12 text-center font-geist text-sm text-warm-600">
            Hiện chưa có sản phẩm nào.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {products.map((product: ProductDto, i: number) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="group flex flex-col overflow-hidden border border-card-border bg-surface transition-all duration-300 hover:border-rose-200 hover:shadow-[0_8px_28px_rgba(157,23,77,0.14)]"
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-rose-50">
                  <FallbackImage
                    kind="product"
                    src={product.imageUrl}
                    alt={product.name || "Sản phẩm"}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />

                  <div
                    className="absolute inset-0 bg-black/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden="true"
                  />

                  {product.categoryName ? (
                    <span className="absolute left-2.5 top-2.5 z-10 rounded-sm bg-rose-100 px-2 py-1 font-geist text-xs font-medium text-rose-800">
                      {product.categoryName}
                    </span>
                  ) : null}

                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                      <Eye className="h-5 w-5 text-ink" aria-hidden="true" />
                    </span>
                    <span className="font-geist text-sm font-medium text-white">
                      Xem chi tiết
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                  <h3 className="mb-1.5 font-geist text-base font-semibold leading-snug text-ink">
                    {product.name}
                  </h3>

                  {product.unit ? (
                    <p className="mb-3 line-clamp-2 font-geist text-sm leading-[1.5] text-warm-600">
                      Đơn vị: {product.unit}
                    </p>
                  ) : (
                    <div className="mb-3" />
                  )}

                  <p className="mt-auto font-geist text-base font-bold tabular-nums text-rose-600">
                    {formatPrice(product.sellingPrice)}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
