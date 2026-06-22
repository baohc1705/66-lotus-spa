import { productCategoryApi } from "@/features/product_categories/api/productCategory.api";
import type { PageRequest } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateProductCategoryPayload,
  UpdateProductCategoryPayload,
} from "../types/product_category.types";

// ---------------------------------------------------------------------------
// Query Key Factory
// Tổ chức cache keys theo hierarchy để invalidate linh hoạt:
//   all     → ["product-categories"]
//   lists() → ["product-categories", "list"]
//   list(p) → ["product-categories", "list", { page, pageSize, ... }]
//   details()  → ["product-categories", "detail"]
//   detail(id) → ["product-categories", "detail", 5]
// ---------------------------------------------------------------------------
const PRODUCT_CATEGORY_KEYS = {
  all: ["product-categories"] as const,
  lists: () => [...PRODUCT_CATEGORY_KEYS.all, "list"] as const,
  list: (params: PageRequest) =>
    [...PRODUCT_CATEGORY_KEYS.lists(), params] as const,
  details: () => [...PRODUCT_CATEGORY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...PRODUCT_CATEGORY_KEYS.details(), id] as const,
};

// ---------------------------------------------------------------------------
// GET LIST — phân trang
// queryKey thay đổi theo params → mỗi bộ params có cache riêng
// ---------------------------------------------------------------------------
export function useProductCategories(params: PageRequest) {
  return useQuery({
    queryKey: PRODUCT_CATEGORY_KEYS.list(params),
    queryFn: () => productCategoryApi.getAll(params),
  });
}

// ---------------------------------------------------------------------------
// GET DETAIL — theo id
// enabled: chỉ gọi API khi id hợp lệ (không null, không âm/0)
// id! — non-null assertion an toàn vì đã guard bằng enabled
// ---------------------------------------------------------------------------
export function useProductCategoryDetail(id: number | null) {
  return useQuery({
    queryKey: PRODUCT_CATEGORY_KEYS.detail(id!),
    queryFn: () => productCategoryApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

// ---------------------------------------------------------------------------
// CREATE
// onSuccess:
//   - API trả isSuccess=true  → invalidate lists() để refetch danh sách
//   - API trả isSuccess=false → hiện lỗi từ server (không throw nên không vào onError)
// onError: lỗi network / exception thật sự
// ---------------------------------------------------------------------------
export function useCreateProductCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductCategoryPayload) =>
      productCategoryApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        // Chỉ cần refetch list, detail chưa tồn tại nên không cần invalidate
        qc.invalidateQueries({ queryKey: PRODUCT_CATEGORY_KEYS.lists() });
        toast.success("Tạo thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi tạo danh mục sản phẩm");
    },
  });
}

// ---------------------------------------------------------------------------
// UPDATE
// mutationFn nhận object { id, payload } vì useMutation chỉ nhận 1 argument
// onSuccess: invalidate all → refetch cả list lẫn detail vì data có thể thay đổi ở cả 2
// ---------------------------------------------------------------------------
export function useUpdateProductCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateProductCategoryPayload;
    }) => productCategoryApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        // invalidate all thay vì lists() vì detail cache cũng bị stale sau khi update
        qc.invalidateQueries({ queryKey: PRODUCT_CATEGORY_KEYS.all });
        toast.success("Cập nhật thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật danh mục sản phẩm");
    },
  });
}

// ---------------------------------------------------------------------------
// DELETE
// onSuccess: invalidate all → item bị xóa khỏi list, detail cache cũng nên bị clear
// ---------------------------------------------------------------------------
export function useDeleteProductCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productCategoryApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: PRODUCT_CATEGORY_KEYS.all });
        toast.success("Xóa thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xóa danh mục sản phẩm");
    },
  });
}
