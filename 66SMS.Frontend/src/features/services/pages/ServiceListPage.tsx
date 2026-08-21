import { ServiceForm } from "@/features/services/components/ServiceForm";
import { ServiceTable } from "@/features/services/components/ServiceTable";
import type { ServiceDto } from "@/features/services/types/service.types";
import { useState } from "react";

export function ServiceListPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ServiceDto | null>(null);

  return (
    <>
      <ServiceTable
        onEdit={setEditTarget}
        onCreate={() => setCreateOpen(true)}
      />

      <ServiceForm open={createOpen} onOpenChange={setCreateOpen} />

      <ServiceForm
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        service={editTarget}
      />
    </>
  );
}
