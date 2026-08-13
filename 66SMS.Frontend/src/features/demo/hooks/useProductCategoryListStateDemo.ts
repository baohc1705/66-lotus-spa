import { useTableQueryParams } from "@/shared/hooks/useTableQueryParams";
import { useCallback, useState } from "react";
import type { ProductCategoryDemo } from "../types/productCategoryDemo.type";
// Giải thích lợi ích của useProductCategoryListStateDemo là gì? useProductCategoryListStateDemo là một hook từ features/demo/hooks/useProductCategoryListStateDemo.ts, nó giúp quản lý các trạng thái của danh sách sản phẩm trong bảng.
// Giải thích state là gì? State là một khái niệm trong React, nó là một biến để lưu trữ dữ liệu. State có thể được sử dụng để lưu trữ dữ liệu của component, và khi state thay đổi, component sẽ được render lại.
// Giải thích useCallback là gì? useCallback là một hook trong React, nó giúp quản lý các callback function. useCallback sẽ trả về một callback function mới, và callback function mới này sẽ được gọi lại khi state thay đổi.

export function useProductCategoryListStateDemo() {
  const table = useTableQueryParams(); // Giải thích: useTableQueryParams là một hook từ shared/hooks/useTableQueryParams.ts, nó giúp quản lý các tham số trang, sắp xếp, lọc, và hiển thị dữ liệu trong bảng.
  const [showDeleted, setShowDeleted] = useState(false); // Giải thích: showDeleted là một state để kiểm tra xem có hiển thị danh sách sản phẩm đã xóa hay không.
  const [createOpen, setCreateOpen] = useState(false); // Giải thích: createOpen là một state để kiểm tra xem có hiển thị form tạo sản phẩm hay không.
  const [editTarget, setEditTarget] = useState<ProductCategoryDemo | null>(
    null,
  ); // Giải thích: editTarget là một state để lưu trữ dữ liệu của sản phẩm được chọn để chỉnh sửa.
  const [deleteTarget, setDeleteTarget] = useState<ProductCategoryDemo | null>(
    null,
  ); // Giải thích: deleteTarget là một state để lưu trữ dữ liệu của sản phẩm được chọn để xóa.
  const [restoreTarget, setRestoreTarget] =
    useState<ProductCategoryDemo | null>(null); // Giải thích: restoreTarget là một state để lưu trữ dữ liệu của sản phẩm được chọn để khôi phục.
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false); // Giải thích: bulkDeleteOpen là một state để kiểm tra xem có hiển thị form xóa nhiều sản phẩm hay không.
  const handleToggleView = useCallback(
    // Giải thích: handleToggleView là một callback để chuyển đổi giữa hiển thị danh sách sản phẩm và danh sách sản phẩm đã xóa.
    (onClearSelection: () => void) => {
      setShowDeleted((prev) => !prev);
      table.resetPage();
      onClearSelection();
    },
    [table],
  );

  return {
    ...table,
    showDeleted,
    createOpen,
    setCreateOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    restoreTarget,
    setRestoreTarget,
    bulkDeleteOpen,
    setBulkDeleteOpen,
    handleToggleView,
  };
}
