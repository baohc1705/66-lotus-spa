import { useState, useMemo } from "react";
import { Search, Award, ShieldCheck } from "lucide-react";
import { Badge } from "@/shared/elements/Badge";
import { ListGroup, ListGroupItem } from "@/shared/elements/ListGroup";
import { Input } from "@/shared/forms/Input";
import { useCertificateTypes } from "../hooks/useCertificateTypes";
import { useStaffCertificates } from "../hooks/useStaffCertificates";
import type {
  CertificateTypeDTO,
  StaffCertificateDTO,
} from "../types/certificate.types";

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
    for (const cert of countCerts) {
      const item: StaffCertificateDTO = cert;
      if (item.certificateTypeId != null) {
        map.set(
          item.certificateTypeId,
          (map.get(item.certificateTypeId) ?? 0) + 1,
        );
      }
    }
    return map;
  }, [countCerts]);

  const totalCount = countCerts.length;

  const filteredTypes = useMemo(() => {
    if (!searchText.trim()) return types;
    const lower = searchText.toLowerCase();
    return types.filter((type: CertificateTypeDTO) =>
      (type.name ?? "").toLowerCase().includes(lower),
    );
  }, [types, searchText]);

  return (
    <div className="flex w-56 shrink-0 flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 z-10 h-3.5 w-3.5 -translate-y-1/2 text-kit-muted" />
        <Input
          type="text"
          inputSize="sm"
          value={searchText}
          onChange={(e: { target: { value: string } }) =>
            setSearchText(e.target.value)
          }
          placeholder="Tìm loại chứng chỉ..."
          className="h-9 pl-8"
        />
      </div>

      <ListGroup className="mb-0 max-h-96 overflow-y-auto">
        <ListGroupItem
          action
          active={selectedTypeId === null}
          onClick={() => onSelectType(null)}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Award className="h-4 w-4 shrink-0" />
            <span className="truncate">Tất cả loại</span>
          </span>
          <Badge variant={selectedTypeId === null ? "light" : "secondary"} pill>
            {totalCount}
          </Badge>
        </ListGroupItem>

        {isLoadingTypes
          ? Array.from({ length: 4 }).map((_, index: number) => (
              <ListGroupItem key={index} disabled>
                <span className="h-4 w-28 animate-pulse rounded bg-kit-page" />
                <span className="h-4 w-6 animate-pulse rounded-full bg-kit-page" />
              </ListGroupItem>
            ))
          : filteredTypes.map((type: CertificateTypeDTO) => {
              const isActive = selectedTypeId === type.id;
              const count =
                type.id != null ? (countMap.get(type.id) ?? 0) : 0;
              return (
                <ListGroupItem
                  key={type.id}
                  action
                  active={isActive}
                  onClick={() => onSelectType(type.id ?? null)}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span className="truncate">{type.name ?? "—"}</span>
                  </span>
                  <Badge variant={isActive ? "light" : "secondary"} pill>
                    {count}
                  </Badge>
                </ListGroupItem>
              );
            })}
      </ListGroup>
    </div>
  );
}
