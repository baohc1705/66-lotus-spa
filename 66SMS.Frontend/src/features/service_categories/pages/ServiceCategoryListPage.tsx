import { ServiceCategoryForm } from "@/features/service_categories/components/ServiceCategoryForm";
import { ServiceCategoryTable } from "@/features/service_categories/components/ServiceCategoryTable";
import type { ServiceCategoryDto } from "@/features/service_categories/types/serviceCategory.types";
import { useState } from "react";

export function ServiceCategoryListPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ServiceCategoryDto | null>(null);

  return (
    <>
      <ServiceCategoryTable
        onEdit={setEditTarget}
        onCreate={() => setCreateOpen(true)}
      />

      <ServiceCategoryForm open={createOpen} onOpenChange={setCreateOpen} />

      <ServiceCategoryForm
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        serviceCategory={editTarget}
      />
    </>
  );
}
