import { ProductCategoryForm } from "@/features/product-categories/components/ProductCategoryForm";
import { ProductCategoryTable } from "@/features/product-categories/components/ProductCategoryTable";
import type { ProductCategoryDto } from "@/features/product-categories/types/productCategory.types";
import { useState } from "react";

export function ProductCategoryListPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductCategoryDto | null>(null);

  return (
    <>
      <ProductCategoryTable
        onEdit={setEditTarget}
        onCreate={() => setCreateOpen(true)}
      />

      <ProductCategoryForm open={createOpen} onOpenChange={setCreateOpen} />

      <ProductCategoryForm
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        productCategory={editTarget}
      />
    </>
  );
}
