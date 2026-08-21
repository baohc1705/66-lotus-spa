import { StaffForm } from "@/features/staffs/components/StaffForm";
import {
  StaffStatCards,
  type StaffStatCardsData,
} from "@/features/staffs/components/StaffStatCards";
import { StaffTable } from "@/features/staffs/components/StaffTable";
import type { StaffDto } from "@/features/staffs/types/staff.types";
import { useState } from "react";

const defaultStats: StaffStatCardsData = {
  totalStaffs: 0,
  activeStaffs: 0,
  inactiveStaffs: 0,
  avgSalary: 0,
  isLoading: true,
};

export function StaffListPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffDto | null>(null);
  const [stats, setStats] = useState<StaffStatCardsData>(defaultStats);

  return (
    <div className="space-y-0 pb-6">
      <StaffStatCards {...stats} />

      <StaffTable
        onEdit={setEditTarget}
        onCreate={() => setCreateOpen(true)}
        onStatsChange={setStats}
      />

      <StaffForm open={createOpen} onOpenChange={setCreateOpen} />

      <StaffForm
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        staff={editTarget}
      />
    </div>
  );
}
