import { ProductForm } from "@/features/products/components/ProductForm";
import { ProductTable } from "@/features/products/components/ProductTable";
import type { ProductDto } from "@/features/products/types/product.types";
import { useState } from "react";

export function ProductListPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductDto | null>(null);

  return (
    <>
      <ProductTable
        onEdit={setEditTarget}
        onCreate={() => setCreateOpen(true)}
      />

      <ProductForm open={createOpen} onOpenChange={setCreateOpen} />

      <ProductForm
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        product={editTarget}
      />
    </>
  );
}
