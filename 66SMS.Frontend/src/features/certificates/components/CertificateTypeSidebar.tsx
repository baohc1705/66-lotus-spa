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
    <aside className="w-56 shrink-0 flex flex-col h-full bg-white rounded border border-adminGray-100/60 overflow-hidden">
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-adminGray-400 pointer-events-none" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm loại chứng chỉ..."
            className="lotus-admin-sidebar-search"
          />
        </div>
      </div>

      <nav className="flex-1 flex-col h-full overflow-y-auto custom-scrollbar px-2 pb-2 space-y-0.5">
        <button
          type="button"
          onClick={() => onSelectType(null)}
          className={`lotus-admin-sidebar-item ${
            selectedTypeId === null
              ? "bg-adminGreen-100 text-adminGreen-600 font-semibold border-l-[3px] border-adminGreen-600"
              : "text-adminInk/70 hover:bg-adminGreen-50 hover:text-adminGreen-600 border-l-[3px] border-transparent"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Award
              className={`w-4 h-4 shrink-0 ${
                selectedTypeId === null
                  ? "text-adminGreen-600"
                  : "text-adminGray-400"
              }`}
            />
            <span className="truncate">Tất cả loại</span>
          </div>
          <span
            className={`lotus-admin-sidebar-badge ${
              selectedTypeId === null
                ? "bg-adminGreen-600/20 text-adminGreen-600"
                : "bg-adminGray-100 text-adminGray-600"
            }`}
          >
            {totalCount}
          </span>
        </button>

        {isLoadingTypes ? (
          <div className="space-y-1 px-1 mt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-7 bg-adminGray-100/50 rounded animate-pulse"
              />
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
                className={`lotus-admin-sidebar-item group ${
                  isActive
                    ? "bg-adminGreen-100 text-adminGreen-600 font-semibold border-l-[3px] border-adminGreen-600"
                    : "text-adminInk/70 hover:bg-adminGreen-50 hover:text-adminGreen-600 border-l-[3px] border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? "text-adminGreen-600"
                        : "text-adminGray-400 group-hover:text-adminGray-600"
                    }`}
                  />
                  <span className="truncate">{type.name ?? "—"}</span>
                </div>
                <span
                  className={`lotus-admin-sidebar-badge ${
                    isActive
                      ? "bg-adminGreen-600/20 text-adminGreen-600"
                      : "bg-adminGray-100 text-adminGray-600"
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
