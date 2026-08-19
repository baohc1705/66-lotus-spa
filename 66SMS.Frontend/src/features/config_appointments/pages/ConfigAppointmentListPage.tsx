import { useState } from "react";

import type { ConfigAppointmentDTO } from "../types/configAppointment.types";
import { ConfigAppointmentForm } from "../components/ConfigAppointmentForm";
import { ConfigAppointmentTable } from "../components/ConfigAppointmentTable";

export function ConfigAppointmentListPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ConfigAppointmentDTO | null>(null);

  return (
    <>
      <ConfigAppointmentTable
        onEdit={setEditTarget}
        onCreate={() => setCreateOpen(true)}
      />
      <ConfigAppointmentForm
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <ConfigAppointmentForm
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        configAppointment={editTarget}
      />
    </>
  );
}
