import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Package,
  Droplet,
  Droplets,
  Flower,
  Leaf,
  Smile,
  Sparkles,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/shared/elements/Button";
import { Badge } from "@/shared/elements/Badge";
import { ListGroup, ListGroupItem } from "@/shared/elements/ListGroup";
import { Input } from "@/shared/forms/Input";
import { useProductCategories } from "@/features/product_categories/hooks/useProductCategories";
import { ProductCategoryFormDialog } from "@/features/product_categories/components/ProductCategoryFormDialog";
import type { ProductCategoryDto } from "@/features/product_categories/types/productCategory.types";
import { useAdminProducts, useDeletedProducts } from "../hooks/useProducts";

interface ProductCategorySidebarProps {
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  showDeleted: boolean;
}

function getCategoryIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("tất cả")) return Package;
  if (n.includes("da") || n.includes("skin")) return Leaf;
  if (n.includes("tóc") || n.includes("hair")) return Sparkles;
  if (n.includes("rửa mặt") || n.includes("cleanser")) return Droplet;
  if (n.includes("dầu") || n.includes("oil")) return Droplets;
  if (n.includes("kem") || n.includes("cream")) return Flower;
  if (n.includes("nạ") || n.includes("mask")) return Smile;
  if (n.includes("serum") || n.includes("essence")) return Droplet;
  if (n.includes("tẩy") || n.includes("remover")) return Sparkles;
  if (n.includes("toner") || n.includes("nước hoa hồng")) return Droplet;
  return Tag;
}

export function ProductCategorySidebar({
  selectedCategoryId,
  onSelectCategory,
  showDeleted,
}: ProductCategorySidebarProps) {
  const [searchText, setSearchText] = useState("");
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);

  const { data: categoriesResult, isLoading: isLoadingCategories } =
    useProductCategories({ pageIndex: 1, pageSize: 100 });

  const categories = useMemo(
    () => categoriesResult?.data?.items ?? [],
    [categoriesResult?.data?.items],
  );

  const { data: activeProductsResult } = useAdminProducts(
    { pageIndex: 1, pageSize: 10000 },
    !showDeleted,
  );
  const { data: deletedProductsResult } = useDeletedProducts(
    { pageIndex: 1, pageSize: 10000 },
    showDeleted,
  );

  const countProducts = useMemo(() => {
    const res = showDeleted ? deletedProductsResult : activeProductsResult;
    return res?.data?.items ?? [];
  }, [showDeleted, activeProductsResult, deletedProductsResult]);

  const countMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const p of countProducts) {
      if (p.categoryId != null) {
        map.set(p.categoryId, (map.get(p.categoryId) ?? 0) + 1);
      }
    }
    return map;
  }, [countProducts]);

  const totalCount = countProducts.length;

  const filteredCategories = useMemo(() => {
    if (!searchText.trim()) return categories;
    const lower = searchText.toLowerCase();
    return categories.filter((c: ProductCategoryDto) =>
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
              <Package className="h-4 w-4 shrink-0" />
              <span className="truncate">Tất cả sản phẩm</span>
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
            : filteredCategories.map((cat: ProductCategoryDto) => {
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

      <ProductCategoryFormDialog
        open={createCategoryOpen}
        onOpenChange={setCreateCategoryOpen}
      />
    </>
  );
}
