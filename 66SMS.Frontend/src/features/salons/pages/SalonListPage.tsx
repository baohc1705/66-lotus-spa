import { SalonForm } from "@/features/salons/components/SalonForm";
import { SalonTable } from "@/features/salons/components/SalonTable";
import type { SalonDto } from "@/features/salons/types/salon.types";
import { useState } from "react";

export function SalonListPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SalonDto | null>(null);

  return (
    <>
      <SalonTable
        onEdit={setEditTarget}
        onCreate={() => setCreateOpen(true)}
      />

      <SalonForm open={createOpen} onOpenChange={setCreateOpen} />

      <SalonForm
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        salon={editTarget}
      />
    </>
  );
}
