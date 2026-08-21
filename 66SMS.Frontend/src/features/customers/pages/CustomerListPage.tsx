import { useState } from "react";
import { Calendar, User } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";

import type { CustomerDto } from "../types/customer.types";

import { CustomerAppointments } from "../components/CustomerAppointments";
import { CustomerDetail } from "../components/CustomerDetail";
import { CustomerList } from "../components/CustomerList";

import { useDeleteCustomer } from "../hooks/useCustomers";
import { CustomerForm } from "../components/CutomerForm";

export function CustomerListPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CustomerDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerDto | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null,
  );

  const deleteMutation = useDeleteCustomer();

  // Xử lý khi nhấn vào nút xóa khách hàng
  function handleDelete() {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess === true) setDeleteTarget(null);
      },
    });
  }

  return (
    <div className="flex h-dvh min-h-dvh max-h-dvh flex-col gap-2 overflow-hidden font-sans text-sm text-kit-body">
      <div className="grid h-full min-h-0 flex-1 grid-cols-12 gap-2 overflow-hidden">
        {/* Customer List */}
        <div className="col-span-3 h-full min-h-0 max-h-full overflow-y-auto">
          <CustomerList
            onCreate={() => setCreateOpen(true)}
            selectedId={selectedCustomerId}
            onSelect={(id) => setSelectedCustomerId(id)}
          />
        </div>

        {/* Customer Detail */}
        <div className="col-span-6 h-full min-h-0 max-h-full overflow-y-auto">
          {selectedCustomerId ? (
            <CustomerDetail
              customerId={selectedCustomerId}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
          ) : (
            <div className="flex h-full min-h-full flex-col items-center justify-center rounded border border-kit bg-kit-white p-6 text-center text-kit-muted shadow-kit-card">
              <User className="mb-2 h-12 w-12 stroke-[1.5] text-kit-muted/60" />

              <p className="text-sm font-medium">
                Chọn một khách hàng để xem chi tiết
              </p>
            </div>
          )}
        </div>

        {/* Customer Appointments */}
        <div className="col-span-3 h-full min-h-0 max-h-full overflow-y-auto">
          {selectedCustomerId ? (
            <CustomerAppointments customerId={selectedCustomerId} />
          ) : (
            <div className="flex h-full min-h-full flex-col items-center justify-center rounded border border-kit bg-kit-white p-6 text-center text-kit-muted shadow-kit-card">
              <Calendar className="mb-2 h-12 w-12 stroke-[1.5] text-kit-muted/60" />

              <p className="text-sm font-medium">
                Chọn một khách hàng để xem lịch hẹn
              </p>
            </div>
          )}
        </div>
      </div>

      <CustomerForm open={createOpen} onOpenChange={setCreateOpen} />

      <CustomerForm
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        customer={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title={`Xóa khách hàng`}
        description={`Bạn có chắc muốn xóa khách hàng "${deleteTarget?.fullName ?? ""}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}

export default CustomerListPage;
