import { useCreateStaffService } from "@/features/staffs/hooks/useStaffServices";
import type {
  StaffDto,
  StaffFullDto,
} from "@/features/staffs/types/staff.types";
import type { CreateStaffServiceRequest } from "@/features/staffs/types/staffService.types";
import { useServicesAdmin } from "@/features/services/hooks/useServices";
import { Modal } from "@/shared/components/Modal";
import { Pagination } from "@/shared/components/Pagination";
import { Tabs } from "@/shared/components/Tabs";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "@/shared/constants/display.const";
import { StatusActive } from "@/shared/constants/status.enum";
import { Button } from "@/shared/elements/Button";
import { Checkbox } from "@/shared/forms/Checkbox";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableResponsive,
  TableRow,
} from "@/shared/tables/Table";
import { zodResolver } from "@hookform/resolvers/zod";
import { Scissors, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";

// Giải thích:
// Validate dữ liệu client side
const staffServiceSchema = z.object({
  serviceIds: z.array(z.number()).min(1, "Vui lòng chọn ít nhất 1 dịch vụ"),
});

type StaffServiceFormData = z.infer<typeof staffServiceSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: StaffDto | StaffFullDto | null;
  onSuccess?: () => void;
}

// Hàm getDefaultValues để lấy giá trị mặc định cho form
function getDefaultValues(): StaffServiceFormData {
  return { serviceIds: [] };
}

export function StaffServiceForm({
  open,
  onOpenChange,
  staff,
  onSuccess,
}: Props) {
  const staffId = staff?.id ?? null;
  const createMutation = useCreateStaffService();
  // Kiểm tra xem có phải là đang xử lý không
  const isPending = createMutation.isPending;
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("");
  const [activeTab, setActiveTab] = useState("services");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // formKey đổi khi đóng/mở modal hoặc đổi nhân viên. Khác appliedFormKey thì xóa ô tìm ngay lúc render (không dùng useEffect để tránh eslint set-state-in-effect).
  const formKey = !open ? "closed" : `staff-${staffId ?? "none"}`;
  const [appliedFormKey, setAppliedFormKey] = useState(formKey);
  if (formKey !== appliedFormKey) {
    setAppliedFormKey(formKey);
    if (open === true) {
      setSearchText("");
      setFilter("");
      setActiveTab("services");
      setPageIndex(1);
      setPageSize(DEFAULT_PAGE_SIZE);
    }
  }

  const { data: servicesResult, isLoading } = useServicesAdmin(
    {
      pageIndex,
      pageSize,
      // BE lọc theo keyword (tên, mã), không dùng filter
      keyword: filter || undefined,
      status: StatusActive.Active,
      excludeStaffId: staffId ?? undefined,
    },
    open && staffId != null && staffId > 0,
  );

  // Sử dụng hook useForm để quản lý form
  // Sử dụng zodResolver để validate dữ liệu client side
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<StaffServiceFormData>({
    resolver: zodResolver(staffServiceSchema) as Resolver<StaffServiceFormData>,
    defaultValues: getDefaultValues(),
  });

  // Sử dụng hook useWatch để theo dõi danh sách dịch vụ đã chọn
  const selectedIds = useWatch({ control, name: "serviceIds" }) ?? [];

  // Sử dụng hook useEffect để reset form khi mở modal
  useEffect(() => {
    if (!open) return;
    reset(getDefaultValues());
  }, [open, staffId, reset]);

  // Đợi 300ms sau khi gõ mới gửi keyword lên API, tránh gọi liên tục
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      setFilter(searchText);
      setPageIndex(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchText, open]);

  const services = servicesResult?.data?.items ?? [];

  // Biến phân trang
  const paged = servicesResult?.data;
  const totalCount = paged?.totalCount ?? 0;
  const totalPages = Math.max(1, paged?.totalPages ?? 0);
  const safePage = Math.min(pageIndex, totalPages);
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  const pageIds: number[] = [];
  for (let index = 0; index < services.length; index++) {
    const id = services[index].id;
    if (id == null) continue;
    pageIds.push(id);
  }

  let allPageSelected = pageIds.length > 0;
  for (let index = 0; index < pageIds.length; index++) {
    if (!selectedIds.includes(pageIds[index])) {
      allPageSelected = false;
      break;
    }
  }

  // Hàm setServiceChecked để chọn hoặc bỏ chọn một dịch vụ
  function setServiceChecked(id: number, checked: boolean) {
    if (checked === true) {
      if (selectedIds.includes(id)) return;
      setValue("serviceIds", [...selectedIds, id], { shouldValidate: true });
      return;
    }

    const next: number[] = [];
    for (let index = 0; index < selectedIds.length; index++) {
      if (selectedIds[index] === id) continue;
      next.push(selectedIds[index]);
    }
    setValue("serviceIds", next, { shouldValidate: true });
  }

  // Hàm toggleAll để chọn hoặc bỏ chọn dịch vụ trên trang hiện tại
  function toggleAll() {
    if (allPageSelected) {
      const next: number[] = [];
      for (let index = 0; index < selectedIds.length; index++) {
        if (pageIds.includes(selectedIds[index])) continue;
        next.push(selectedIds[index]);
      }
      setValue("serviceIds", next, { shouldValidate: true });
      return;
    }

    const next = [...selectedIds];
    for (let index = 0; index < pageIds.length; index++) {
      if (next.includes(pageIds[index])) continue;
      next.push(pageIds[index]);
    }
    setValue("serviceIds", next, { shouldValidate: true });
  }

  // Hàm handlePageSizeChange để đổi số dòng mỗi trang
  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPageIndex(1);
  }

  // Hàm onSubmit để xử lý dữ liệu form khi submit
  function onSubmit(values: StaffServiceFormData) {
    if (staffId == null || staffId <= 0) return;

    const payload: CreateStaffServiceRequest = {
      staffId,
      serviceIds: values.serviceIds,
    };

    createMutation.mutate(payload, {
      onSuccess: (result) => {
        if (result.isSuccess !== true) return;
        onOpenChange(false);
        onSuccess?.();
      },
    });
  }

  let emptyMessage = "Tất cả dịch vụ đã được phân công cho nhân viên này";
  if (filter) {
    emptyMessage = "Không tìm thấy dịch vụ phù hợp";
  }

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Phân công dịch vụ"
      size="xl"
      scrollable
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mb-0"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="staff-service-form"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={isPending}
          >
            Phân công ({selectedIds.length})
          </Button>
        </>
      }
    >
      <form
        id="staff-service-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Tabs
          variant="body"
          activeId={activeTab}
          onChange={setActiveTab}
          tabs={[
            {
              id: "services",
              label: "Dịch vụ",
              content: (
                <FormSection icon={Scissors} title="Chọn dịch vụ">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute top-1/2 left-2.5 z-10 h-3.5 w-3.5 -translate-y-1/2 text-kit-muted" />
                      <Input
                        type="text"
                        inputSize="sm"
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                        placeholder="Tìm theo tên hoặc mã..."
                        className="h-9 pl-8"
                      />
                    </div>
                  </div>

                  <div className="overflow-hidden rounded border border-kit">
                    {isLoading ? (
                      <div className="py-8 text-center text-sm text-kit-muted">
                        Đang tải danh sách dịch vụ...
                      </div>
                    ) : null}
                    {!isLoading && services.length === 0 ? (
                      <div className="py-8 text-center text-sm text-kit-muted">
                        {emptyMessage}
                      </div>
                    ) : null}
                    {!isLoading && services.length > 0 ? (
                      <>
                        <TableResponsive>
                          <Table hover striped>
                            <TableHead>
                              <TableRow>
                                <TableHeaderCell className="w-10">
                                  <Checkbox
                                    checked={allPageSelected}
                                    onChange={toggleAll}
                                    className="mb-0 shrink-0"
                                  />
                                </TableHeaderCell>
                                <TableHeaderCell>Mã dịch vụ</TableHeaderCell>
                                <TableHeaderCell>Tên dịch vụ</TableHeaderCell>
                                <TableHeaderCell>Danh mục</TableHeaderCell>
                                <TableHeaderCell>Thời lượng</TableHeaderCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {services.map((service) => {
                                const serviceId = service.id ?? 0;
                                return (
                                  <TableRow key={serviceId}>
                                    <TableCell>
                                      <Checkbox
                                        checked={selectedIds.includes(
                                          serviceId,
                                        )}
                                        onChange={(checked) =>
                                          setServiceChecked(serviceId, checked)
                                        }
                                        className="mb-0 shrink-0"
                                      />
                                    </TableCell>
                                    <TableCell>{service.code}</TableCell>
                                    <TableCell>{service.name}</TableCell>
                                    <TableCell>
                                      {service.categoryName}
                                    </TableCell>
                                    <TableCell>
                                      {service.durationMins != null
                                        ? `${service.durationMins} phút`
                                        : "—"}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableResponsive>
                        {totalCount > 0 ? (
                          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-kit px-4 py-3">
                            <div className="flex items-center gap-3 text-xs text-kit-dark">
                              <span>
                                {rangeEnd} / {pageSize}
                              </span>
                              <span>Hiển thị: </span>
                              <Select
                                inputSize="sm"
                                className="mb-0 w-28"
                                value={pageSize}
                                onChange={(event) =>
                                  handlePageSizeChange(
                                    Number(event.target.value),
                                  )
                                }
                              >
                                {PAGE_SIZE_OPTIONS.map((size) => (
                                  <option key={size} value={size}>
                                    {size}
                                  </option>
                                ))}
                              </Select>
                            </div>
                            <Pagination
                              page={safePage}
                              pageCount={totalPages}
                              onPageChange={setPageIndex}
                              size="sm"
                            />
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>

                  <div className="mt-2 flex min-h-5 items-center justify-between">
                    {selectedIds.length > 0 ? (
                      <span className="text-xs font-medium text-kit-primary">
                        Đã chọn {selectedIds.length} dịch vụ
                      </span>
                    ) : (
                      <span />
                    )}
                    {errors.serviceIds?.message ? (
                      <span className="text-xs text-kit-danger">
                        {errors.serviceIds.message}
                      </span>
                    ) : null}
                  </div>
                </FormSection>
              ),
            },
          ]}
        />
      </form>
    </Modal>
  );
}
