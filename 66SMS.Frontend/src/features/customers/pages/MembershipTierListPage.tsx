import { useState } from "react";

import { MembershipTierForm } from "../components/MemberShipTierForm";
import { MembershipTierTable } from "../components/MembershipTierTable";
import type { MembershipTierDto } from "../types/membershipTier.types";

export function MembershipTierListPage() {
  const [editTarget, setEditTarget] = useState<MembershipTierDto | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  return (
    <>
      <MembershipTierTable
        onEdit={setEditTarget}
        onCreate={() => setCreateOpen(true)}
      />

      <MembershipTierForm open={createOpen} onOpenChange={setCreateOpen} />

      <MembershipTierForm
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        tier={editTarget}
      />
    </>
  );
}
