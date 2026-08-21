import { useState } from "react";

import type { MembershipCardDto } from "../types/membershipCard.types";
import { MembershipCardTable } from "../components/MemberShipCardTable";
import { MembershipCardForm } from "../components/MemberShipCardForm";

export function MembershipCardListPage() {
  const [editTarget, setEditTarget] = useState<MembershipCardDto | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <MembershipCardTable
        onEdit={setEditTarget}
        onCreate={() => setCreateOpen(true)}
      />

      <MembershipCardForm open={createOpen} onOpenChange={setCreateOpen} />

      <MembershipCardForm
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        card={editTarget}
      />
    </>
  );
}
