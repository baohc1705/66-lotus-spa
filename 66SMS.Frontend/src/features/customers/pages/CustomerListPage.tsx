import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { CONFIRM_MSG } from "@/shared/constants/confirm.messages";
import { StatusActive } from "@/shared/constants/status.enum";
import { useCallback, useMemo, useState } from "react";

import { CustomerFormDialog } from "../components/CustomerFormDialog";
import { CustomerStatCards } from "../components/CustomerStatCards";
import { useCustomerListState } from "../hooks/useCustomerListState";
import {
  useCustomers,
  useDeleteCustomer,
  useRestoreCustomer,
} from "../hooks/useCustomers";
import type { CustomerDto } from "../types/customer.types";

import { CustomerCrmAppointments } from "../components/CustomerCrmAppointments";
import { CustomerCrmDetail } from "../components/CustomerCrmDetail";
import { CustomerCrmList } from "../components/CustomerCrmList";

const ENTITY = "khách hàng";
const ENTITY_SUBJECT = "Khách hàng";

export function CustomerListPage() {
  const listState = useCustomerListState();
  const {
    queryParams,
    showDeleted,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    restoreTarget,
    setRestoreTarget,
    handleToggleView,
    pageIndex,
    setPageIndex,
    filter,
    selectedGender,
    setSelectedGender,
    selectedSource,
    setSelectedSource,
    handleSearchChange,
  } = listState;

  const { data: customersResult, isLoading } = useCustomers(queryParams);
  const deleteMutation = useDeleteCustomer();
  const restoreMutation = useRestoreCustomer();

  const paged = customersResult?.data;
  const customers = useMemo(() => paged?.items ?? [], [paged?.items]);
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = paged?.totalPages ?? 1;
  const pageSize = paged?.pageSize ?? 10;

  const [selectedCustomerIdState, setSelectedCustomerId] = useState<
    number | null
  >(null);

  const selectedCustomerId = useMemo(() => {
    if (
      selectedCustomerIdState !== null &&
      customers.some((c: CustomerDto) => c.id === selectedCustomerIdState)
    ) {
      return selectedCustomerIdState;
    }
    return customers[0]?.id ?? null;
  }, [customers, selectedCustomerIdState]);

  const activeCustomerCount = useMemo(
    () =>
      customers.filter((c: CustomerDto) => c.status === StatusActive.Active)
        .length,
    [customers],
  );

  const totalPoints = useMemo(
    () =>
      customers.reduce(
        (sum: number, c: CustomerDto) => sum + (c.loyaltyPoint ?? 0),
        0,
      ),
    [customers],
  );

  const walkInCustomerCount = useMemo(
    () =>
      customers.filter(
        (c: CustomerDto) =>
          c.source === "Walk-in" || c.source === "Đến trực tiếp",
      ).length,
    [customers],
  );

  const handleDelete = useCallback(() => {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess) {
          setDeleteTarget(null);    
          if (selectedCustomerId === deleteTarget.id) {
            setSelectedCustomerId(null);
          }
        }
      },
    });
  }, [deleteTarget, deleteMutation, selectedCustomerId, setDeleteTarget]);

  const handleRestore = useCallback(() => {
    if (!restoreTarget?.id) return;
    restoreMutation.mutate(restoreTarget.id, {
      onSuccess: (result) => {
        if (result.isSuccess) setRestoreTarget(null);
      },
    });
  }, [restoreTarget, restoreMutation, setRestoreTarget]);

  return (
    <div className="flex flex-col h-full overflow-hidden gap-2">
      <div className="shrink-0">
        <CustomerStatCards
          totalCustomers={totalCount}
          activeCustomers={activeCustomerCount}
          totalPoints={totalPoints}
          walkInCustomers={walkInCustomerCount}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-12 gap-2 flex-1 min-h-0 overflow-hidden">
        <div className="col-span-3 h-full overflow-hidden">
          <CustomerCrmList
            customers={customers}
            selectedId={selectedCustomerId}
            onSelect={setSelectedCustomerId}
            isLoading={isLoading}
            totalCustomers={totalCount}
            pageIndex={pageIndex}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={setPageIndex}
            filter={filter}
            onFilterChange={handleSearchChange}
            selectedGender={selectedGender}
            onSelectGender={setSelectedGender}
            selectedSource={selectedSource}
            onSelectSource={setSelectedSource}
            onAdd={() => setCreateOpen(true)}
            showDeleted={showDeleted}
            onToggleDeleted={() => handleToggleView(() => {})}
          />
        </div>

        <div className="col-span-6 h-full overflow-hidden">
          <CustomerCrmDetail
            customerId={selectedCustomerId}
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
          />
        </div>

        <div className="col-span-3 h-full overflow-hidden">
          <CustomerCrmAppointments
            key={selectedCustomerId}
            customerId={selectedCustomerId}
          />
        </div>
      </div>

      <CustomerFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <CustomerFormDialog
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
        title={CONFIRM_MSG.deleteTitle(ENTITY)}
        description={CONFIRM_MSG.deleteDescription(
          ENTITY,
          deleteTarget?.fullName ?? "",
        )}
        confirmLabel={COMMON_MSG.delete}
        loading={deleteMutation.isPending}
        variant="danger"
      />

      <ConfirmDialog
        open={!!restoreTarget}
        onOpenChange={(open) => {
          if (!open) setRestoreTarget(null);
        }}
        onConfirm={handleRestore}
        title={CONFIRM_MSG.restoreTitle(ENTITY_SUBJECT)}
        description={CONFIRM_MSG.restoreDescription(
          ENTITY_SUBJECT,
          restoreTarget?.fullName ?? "",
        )}
        confirmLabel={COMMON_MSG.restore}
        loading={restoreMutation.isPending}
        variant="default"
      />
    </div>
  );
}

export default CustomerListPage;
