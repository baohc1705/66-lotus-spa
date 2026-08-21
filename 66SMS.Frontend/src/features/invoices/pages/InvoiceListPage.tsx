import { useState } from "react";

import { InvoiceForm } from "@/features/invoices/components/InvoiceForm";
import { InvoiceTable } from "@/features/invoices/components/InvoiceTable";

export function InvoiceListPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <InvoiceTable onCreate={() => setCreateOpen(true)} />

      <InvoiceForm
        open={createOpen}
        onOpenChange={(open) => {
          if (!open) setCreateOpen(false);
        }}
      />
    </>
  );
}
