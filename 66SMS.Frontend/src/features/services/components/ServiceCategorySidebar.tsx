import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Activity,
  Sparkles,
  Heart,
  Flower,
  Smile,
  Star,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/shared/elements/Button";
import { Badge } from "@/shared/elements/Badge";
import { ListGroup, ListGroupItem } from "@/shared/elements/ListGroup";
import { Input } from "@/shared/forms/Input";
import { useServiceCategories } from "@/features/service_categories/hooks/useServiceCategories";
import { ServiceCategoryFormDialog } from "@/features/service_categories/components/ServiceCategoryFormDialog";
import { useAdminServices, useDeletedServices } from "../hooks/useServices";
import type { ServiceCategoryDto } from "@/features/service_categories/types/serviceCategory.types";

interface ServiceCategorySidebarProps {
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  showDeleted: boolean;
}

function getCategoryIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("tất cả")) return Activity;
  if (n.includes("da") || n.includes("skin")) return Sparkles;
  if (n.includes("tóc") || n.includes("hair")) return Star;
  if (n.includes("massage") || n.includes("trị liệu")) return Heart;
  if (n.includes("móng") || n.includes("nail")) return Flower;
  if (n.includes("mặt") || n.includes("facial")) return Smile;
  return Tag;
}

export function ServiceCategorySidebar({
  selectedCategoryId,
  onSelectCategory,
  showDeleted,
}: ServiceCategorySidebarProps) {
  const [searchText, setSearchText] = useState("");
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);

  const { data: categoriesResult, isLoading: isLoadingCategories } =
    useServiceCategories({ pageIndex: 1, pageSize: 100 });

  const categories = useMemo(
    () => categoriesResult?.data?.items ?? [],
    [categoriesResult?.data?.items],
  );

  const { data: activeServicesResult } = useAdminServices(
    { pageIndex: 1, pageSize: 10000 },
    !showDeleted,
  );
  const { data: deletedServicesResult } = useDeletedServices(
    { pageIndex: 1, pageSize: 10000 },
    showDeleted,
  );

  const countServices = useMemo(() => {
    const res = showDeleted ? deletedServicesResult : activeServicesResult;
    return res?.data?.items ?? [];
  }, [showDeleted, activeServicesResult, deletedServicesResult]);

  const countMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const s of countServices) {
      if (s.categoryId != null) {
        map.set(s.categoryId, (map.get(s.categoryId) ?? 0) + 1);
      }
    }
    return map;
  }, [countServices]);

  const totalCount = countServices.length;

  const filteredCategories = useMemo(() => {
    if (!searchText.trim()) return categories;
    const lower = searchText.toLowerCase();
    return categories.filter((c: ServiceCategoryDto) =>
      (c.name ?? "").toLowerCase().includes(lower),
    );
  }, [categories, searchText]);

  return (
    <>
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
            placeholder="Tìm danh mục..."
            className="h-9 pl-8"
          />
        </div>

        <ListGroup className="mb-0 max-h-96 overflow-y-auto">
          <ListGroupItem
            action
            active={selectedCategoryId === null}
            onClick={() => onSelectCategory(null)}
          >
            <span className="flex min-w-0 items-center gap-2">
              <Activity className="h-4 w-4 shrink-0" />
              <span className="truncate">Tất cả dịch vụ</span>
            </span>
            <Badge
              variant={selectedCategoryId === null ? "light" : "secondary"}
              pill
            >
              {totalCount}
            </Badge>
          </ListGroupItem>

          {isLoadingCategories
            ? Array.from({ length: 6 }).map((_, i: number) => (
                <ListGroupItem key={i} disabled>
                  <span className="h-4 w-28 animate-pulse rounded bg-kit-page" />
                  <span className="h-4 w-6 animate-pulse rounded-full bg-kit-page" />
                </ListGroupItem>
              ))
            : filteredCategories.map((cat: ServiceCategoryDto) => {
                const isActive = selectedCategoryId === cat.id;
                const count = cat.id != null ? (countMap.get(cat.id) ?? 0) : 0;
                const Icon = getCategoryIcon(cat.name ?? "");
                return (
                  <ListGroupItem
                    key={cat.id}
                    action
                    active={isActive}
                    onClick={() => onSelectCategory(cat.id ?? null)}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{cat.name ?? "—"}</span>
                    </span>
                    <Badge variant={isActive ? "light" : "secondary"} pill>
                      {count}
                    </Badge>
                  </ListGroupItem>
                );
              })}
        </ListGroup>

        <Button
          variant="admin"
          size="sm"
          className="mb-0 w-full"
          onClick={() => setCreateCategoryOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm danh mục
        </Button>
      </div>

      <ServiceCategoryFormDialog
        open={createCategoryOpen}
        onOpenChange={setCreateCategoryOpen}
      />
    </>
  );
}
