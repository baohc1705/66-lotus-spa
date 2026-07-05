import { useState, useMemo } from "react";
import { Search, Award, ShieldCheck } from "lucide-react";
import { useCertificateTypes } from "../hooks/useCertificateTypes";
import { useStaffCertificates } from "../hooks/useStaffCertificates";

interface CertificateTypeSidebarProps {
  selectedTypeId: number | null;
  onSelectType: (id: number | null) => void;
}

export function CertificateTypeSidebar({
  selectedTypeId,
  onSelectType,
}: CertificateTypeSidebarProps) {
  const [searchText, setSearchText] = useState("");

  const { data: typesResult, isLoading: isLoadingTypes } = useCertificateTypes({
    pageIndex: 1,
    pageSize: 100,
  });

  const types = useMemo(
    () => typesResult?.data?.items ?? [],
    [typesResult?.data?.items],
  );

  // Fetch all certificates without type filter for counting
  const { data: allCertsResult } = useStaffCertificates({
    pageIndex: 1,
    pageSize: 10000,
  });

  const countCerts = useMemo(
    () => allCertsResult?.data?.items ?? [],
    [allCertsResult],
  );

  const countMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const c of countCerts) {
      if (c.certificateTypeId != null) {
        map.set(c.certificateTypeId, (map.get(c.certificateTypeId) ?? 0) + 1);
      }
    }
    return map;
  }, [countCerts]);

  const totalCount = countCerts.length;

  const filteredTypes = useMemo(() => {
    if (!searchText.trim()) return types;
    const lower = searchText.toLowerCase();
    return types.filter((t) => (t.name ?? "").toLowerCase().includes(lower));
  }, [types, searchText]);

  return (
    <aside className="w-56 shrink-0 flex flex-col h-full bg-white rounded border border-stone-200/60 overflow-hidden">
      {/* Search */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm loại chứng chỉ..."
            className="w-full h-8 pl-8 pr-3 text-[12px] bg-stone-50 border border-stone-200 rounded focus:outline-none focus:ring-1 focus:ring-lotus-leaf/40 focus:border-lotus-leaf/60 placeholder:text-stone-400 text-stone-700"
          />
        </div>
      </div>

      {/* Type list */}
      <nav className="flex-1 flex-col h-full overflow-y-auto custom-scrollbar px-2 pb-2 space-y-0.5">
        {/* Tất cả loại */}
        <button
          type="button"
          onClick={() => onSelectType(null)}
          className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-[13px] transition-all duration-150 rounded ${
            selectedTypeId === null
              ? "bg-lotus-leaf/10 text-lotus-leaf font-semibold border-l-[3px] border-lotus-leaf"
              : "text-lotus-deep/70 hover:bg-lotus-leaf/5 hover:text-lotus-leaf border-l-[3px] border-transparent"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Award
              className={`w-4 h-4 shrink-0 ${
                selectedTypeId === null ? "text-lotus-leaf" : "text-stone-400"
              }`}
            />
            <span className="truncate">Tất cả loại</span>
          </div>
          <span
            className={`text-[11px] shrink-0 font-medium px-1.5 py-0.5 rounded-full ${
              selectedTypeId === null
                ? "bg-lotus-leaf/20 text-lotus-leaf"
                : "bg-stone-100 text-stone-500"
            }`}
          >
            {totalCount}
          </span>
        </button>

        {isLoadingTypes ? (
          <div className="space-y-1 px-1 mt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-7 bg-stone-100/50 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          filteredTypes.map((type) => {
            const isActive = selectedTypeId === type.id;
            const count = type.id != null ? (countMap.get(type.id) ?? 0) : 0;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => onSelectType(type.id ?? null)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-[13px] transition-all duration-150 rounded group ${
                  isActive
                    ? "bg-lotus-leaf/10 text-lotus-leaf font-semibold border-l-[3px] border-lotus-leaf"
                    : "text-lotus-deep/70 hover:bg-lotus-leaf/5 hover:text-lotus-leaf border-l-[3px] border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? "text-lotus-leaf"
                        : "text-stone-400 group-hover:text-stone-500"
                    }`}
                  />
                  <span className="truncate">{type.name ?? "—"}</span>
                </div>
                <span
                  className={`text-[11px] shrink-0 font-medium px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-lotus-leaf/20 text-lotus-leaf"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })
        )}
      </nav>
    </aside>
  );
}
