import { useState } from "react";
import { Pagination } from "@/shared/components/Pagination";
import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

export function PaginationPage() {
  const [page, setPage] = useState(2);
  const [pageAdvanced, setPageAdvanced] = useState(10);
  const [pageSm, setPageSm] = useState(1);
  const [pageMd, setPageMd] = useState(1);
  const [pageLg, setPageLg] = useState(1);

  return (
    <DemoPageShell
      title="Pagination"
      subtitle="Basic and advanced pagination for listing and tables."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <DemoSection title="Basic">
          <Pagination page={page} pageCount={5} onPageChange={setPage} />
        </DemoSection>

        <DemoSection title="Advanced (jump)">
          <p className="mb-2 text-sm text-kit-muted">
            Nhap so o o &quot;..&quot; roi Enter de nhay trang.
          </p>
          <Pagination
            page={pageAdvanced}
            pageCount={21}
            onPageChange={setPageAdvanced}
          />
        </DemoSection>

        <DemoSection title="Sizing">
          <Pagination page={pageSm} pageCount={5} size="sm" onPageChange={setPageSm} />
          <hr className="my-4 border-kit" />
          <Pagination page={pageMd} pageCount={3} onPageChange={setPageMd} />
          <hr className="my-4 border-kit" />
          <Pagination page={pageLg} pageCount={3} size="lg" onPageChange={setPageLg} />
        </DemoSection>
      </div>
    </DemoPageShell>
  );
}
