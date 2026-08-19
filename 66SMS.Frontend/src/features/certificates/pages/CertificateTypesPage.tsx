import { CertificateTypeForm } from "@/features/certificates/components/CertificateTypeForm";
import { CertificateTypeTable } from "@/features/certificates/components/CertificateTypeTable";
import type { CertificateTypeDto } from "@/features/certificates/types/certificateType.types";
import { useState } from "react";

export function CertificateTypesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CertificateTypeDto | null>(null);

  return (
    <>
      <CertificateTypeTable
        onEdit={setEditTarget}
        onCreate={() => setCreateOpen(true)}
      />

      <CertificateTypeForm open={createOpen} onOpenChange={setCreateOpen} />

      <CertificateTypeForm
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        certificateType={editTarget}
      />
    </>
  );
}
