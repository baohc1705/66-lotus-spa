import { useState } from "react";
import { Pagination } from "@/shared/components/Pagination";
import { DemoPageShell, DemoSection } from "../../components/DemoPageShell";

export function PaginationPage() {
  const [page, setPage] = useState(2);
  const [pageAdvanced, setPageAdvanced] = useState(10);
  const [pageSm, setPageSm] = useState(1);
  const [pageMd, setPageMd] = useState(1);
  const [pageLg, setPageLg] = useState(1);
  const [pageDanger, setPageDanger] = useState(2);
  const [pageSuccess, setPageSuccess] = useState(2);

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
            Nhập số vào ô &quot;...&quot; rồi Enter để nhảy trang.
          </p>
          <Pagination
            page={pageAdvanced}
            pageCount={20}
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

        <DemoSection title="Colors">
          <Pagination
            page={pageSuccess}
            pageCount={5}
            tone="success"
            onPageChange={setPageSuccess}
          />
          <hr className="my-4 border-kit" />
          <Pagination
            page={pageDanger}
            pageCount={5}
            tone="danger"
            onPageChange={setPageDanger}
          />
        </DemoSection>
      </div>
    </DemoPageShell>
  );
}
