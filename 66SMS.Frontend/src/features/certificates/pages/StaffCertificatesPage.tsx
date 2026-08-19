import { StaffCertificateForm } from "@/features/certificates/components/StaffCertificateForm";
import { StaffCertificateTable } from "@/features/certificates/components/StaffCertificateTable";
import type { StaffCertificateDto } from "@/features/certificates/types/certificate.types";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

interface Props {
  staffId?: number;
  submitMode?: boolean;
}

export function StaffCertificatesPage({ staffId, submitMode = false }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffCertificateDto | null>(null);

  const user = useAuthStore((s) => s.user);
  const [searchParams] = useSearchParams();
  const staffIdFromQuery = Number(searchParams.get("staffId"));
  const myStaffId = user?.staffInfo?.id;

  // Xác định staffId hiệu dụng
  let effectiveStaffId = staffId;
  if (!effectiveStaffId) {
    if (Number.isFinite(staffIdFromQuery) && staffIdFromQuery > 0) {
      effectiveStaffId = staffIdFromQuery;
    } else if (submitMode && myStaffId) {
      effectiveStaffId = myStaffId;
    }
  }

  return (
    <>
      <StaffCertificateTable
        onEdit={setEditTarget}
        onCreate={() => setCreateOpen(true)}
        staffId={effectiveStaffId}
        submitMode={submitMode}
      />

      <StaffCertificateForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        staffId={effectiveStaffId}
        submitMode={submitMode}
      />

      {!submitMode ? (
        <StaffCertificateForm
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          staffCertificate={editTarget}
          staffId={effectiveStaffId}
        />
      ) : null}
    </>
  );
}

export default StaffCertificatesPage;
