import { useEffect } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { AdminInput } from "@/shared/components/forms/AdminInput";
import { AdminTextarea } from "@/shared/components/forms/AdminTextarea";
import { AdminSelectTrigger } from "@/shared/components/forms/AdminSelectTrigger";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import { SearchableSelect } from "@/shared/components/ui/searchable-select";
import { Plus, Trash2, Leaf, ListOrdered } from "lucide-react";
import { FormSection } from "@/shared/components/forms/FormSection";
import { FormField } from "@/shared/components/forms/FormField";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import {
  treatmentCourseSchema,
  type TreatmentCourseFormValues,
} from "../schemas/treatmentCourse.schema";
import {
  useCreateTreatmentCourse,
  useUpdateTreatmentCourse,
} from "../hooks/useTreatmentCourses";
import { useServices } from "@/features/services/hooks/useServices";
import type {
  TreatmentCourseDto,
  TreatmentCourseItemDto,
  TreatmentCourseItemPayload,
} from "../types/treatmentCourse.types";
import type { ServiceDto } from "@/features/services/types/service.types";
import type { ServiceCategoryDto } from "@/features/service_categories/types/serviceCategory.types";
import type {
  CreateTreatmentCoursePayload,
  UpdateTreatmentCoursePayload,
} from "../types/treatmentCourse.types";
import { useServiceCategories } from "@/features/service_categories/hooks/useServiceCategories";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: TreatmentCourseDto | null;
}

const STATUS_OPTIONS = [
  { value: "0", label: "Ngưng hoạt động" },
  { value: "1", label: "Hoạt động" },
];

export function TreatmentCourseFormDialog({
  open,
  onOpenChange,
  course,
}: Props) {
  "use no memo";
  const isEdit = !!course;
  const createMutation = useCreateTreatmentCourse();
  const updateMutation = useUpdateTreatmentCourse();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const servicesQuery = useServices({ pageIndex: 1, pageSize: 200 });
  const services: ServiceDto[] = servicesQuery.data?.data?.items ?? [];

  const categoriesQuery = useServiceCategories({
    pageIndex: 1,
    pageSize: 200,
  });
  const categories: ServiceCategoryDto[] =
    categoriesQuery.data?.data?.items ?? [];

  const form = useForm<TreatmentCourseFormValues>({
    resolver: zodResolver(
      treatmentCourseSchema,
    ) as Resolver<TreatmentCourseFormValues>,
    defaultValues: getDefaultValues(course),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (open) reset(getDefaultValues(course));
  }, [open, course, reset]);

  const onSubmit = (data: TreatmentCourseFormValues) => {
    if (isEdit && course?.id) {
      const payload: UpdateTreatmentCoursePayload = {
        code: data.code,
        name: data.name,
        description: data.description || undefined,
        content: data.content || undefined,
        categoryId: data.categoryId || undefined,
        originalPrice: data.originalPrice,
        sellingPrice: data.sellingPrice,
        imageUrl: data.imageUrl || undefined,
        sortOrder: data.sortOrder,
        status: data.status,
        items: data.items.map((i: TreatmentCourseItemPayload) => ({
          serviceId: i.serviceId,
          sessionNumber: i.sessionNumber,
          quantity: i.quantity,
          note: i.note || undefined,
          status: i.status ?? 1,
        })),
      };
      updateMutation.mutate(
        { id: course.id, payload },
        {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        },
      );
    } else {
      const payload: CreateTreatmentCoursePayload = {
        code: data.code,
        name: data.name,
        description: data.description || undefined,
        content: data.content || undefined,
        categoryId: data.categoryId || undefined,
        originalPrice: data.originalPrice,
        sellingPrice: data.sellingPrice,
        imageUrl: data.imageUrl || undefined,
        sortOrder: data.sortOrder,
        status: data.status ?? 1,
        items: data.items.map((i: TreatmentCourseItemPayload) => ({
          serviceId: i.serviceId,
          sessionNumber: i.sessionNumber,
          quantity: i.quantity,
          note: i.note || undefined,
          status: i.status ?? 1,
        })),
      };
      createMutation.mutate(payload, {
        onSuccess: (result) => {
          if (result.isSuccess) onOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa liệu trình" : "Thêm liệu trình mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Cập nhật thông tin liệu trình "${course?.name ?? ""}"`
              : "Điền thông tin để tạo liệu trình mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormSection icon={Leaf} title="Thông tin liệu trình">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FormField label="Mã liệu trình *" error={errors.code?.message}>
                <AdminInput {...register("code")} placeholder="LT001" />
              </FormField>
              <FormField label="Tên liệu trình *" error={errors.name?.message}>
                <AdminInput
                  {...register("name")}
                  placeholder="Trị mụn chuyên sâu"
                />
              </FormField>
              <FormField
                label="Giá gốc *"
                error={errors.originalPrice?.message}
              >
                <AdminInput
                  {...register("originalPrice")}
                  type="number"
                  min={0}
                  placeholder="0"
                />
              </FormField>
              <FormField label="Giá bán *" error={errors.sellingPrice?.message}>
                <AdminInput
                  {...register("sellingPrice")}
                  type="number"
                  min={0}
                  placeholder="0"
                />
              </FormField>
              <FormField label="Nhóm dịch vụ">
                <SearchableSelect
                  value={watch("categoryId")?.toString() ?? ""}
                  onValueChange={(v) =>
                    setValue("categoryId", v ? Number(v) : undefined)
                  }
                  options={categories.map((c: ServiceCategoryDto) => ({
                    value: String(c.id ?? ""),
                    label: c.name ?? "",
                  }))}
                  placeholder="Chọn nhóm dịch vụ"
                  searchPlaceholder="Tìm nhóm..."
                />
              </FormField>
              <FormField label="Trạng thái">
                <Select
                  value={watch("status")?.toString() ?? "1"}
                  onValueChange={(v) => setValue("status", Number(v))}
                >
                  <AdminSelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </AdminSelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Thứ tự sắp xếp">
                <AdminInput
                  {...register("sortOrder")}
                  type="number"
                  placeholder="0"
                />
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="Mô tả" error={errors.description?.message}>
                  <AdminTextarea
                    {...register("description")}
                    placeholder="Mô tả ngắn về liệu trình..."
                    className="min-h-[60px] resize-none"
                  />
                </FormField>
              </div>
            </div>
          </FormSection>

          <FormSection icon={ListOrdered} title="Danh sách buổi dịch vụ">
            {errors.items?.root?.message && (
              <p className="text-xs text-state-danger-text font-medium mb-2">
                {errors.items.root.message}
              </p>
            )}
            {typeof errors.items?.message === "string" && (
              <p className="text-xs text-state-danger-text font-medium mb-2">
                {errors.items.message}
              </p>
            )}
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-2 items-start p-3 bg-adminGray-50 rounded-lg border border-adminGray-100"
                >
                  <p className="text-xs font-semibold text-adminGray-600">
                    #{index + 1}
                  </p>
                  <div className="col-span-4">
                    <p className="lotus-admin-form-label mb-1">Dịch vụ *</p>
                    <SearchableSelect
                      value={
                        watch(`items.${index}.serviceId`)?.toString() ?? ""
                      }
                      onValueChange={(v) =>
                        setValue(`items.${index}.serviceId`, Number(v))
                      }
                      options={services.map((s: ServiceDto) => ({
                        value: String(s.id ?? ""),
                        label: s.name ?? "",
                      }))}
                      placeholder="Chọn dịch vụ"
                      searchPlaceholder="Tìm dịch vụ..."
                    />
                    {errors.items?.[index]?.serviceId && (
                      <p className="text-xs text-state-danger-text mt-0.5">
                        {errors.items[index]?.serviceId?.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="lotus-admin-form-label mb-1">Buổi thứ *</p>
                    <AdminInput
                      {...register(`items.${index}.sessionNumber`)}
                      type="number"
                      min={1}
                    />
                    {errors.items?.[index]?.sessionNumber && (
                      <p className="text-xs text-state-danger-text mt-0.5">
                        {errors.items[index]?.sessionNumber?.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="lotus-admin-form-label mb-1">Số lần</p>
                    <AdminInput
                      {...register(`items.${index}.quantity`)}
                      type="number"
                      min={1}
                    />
                  </div>
                  <div className="col-span-2">
                    <p className="lotus-admin-form-label mb-1">Ghi chú</p>
                    <AdminInput
                      {...register(`items.${index}.note`)}
                      placeholder="Ghi chú..."
                    />
                  </div>
                  <div className="col-span-1 flex items-end justify-center mt-5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => remove(index)}
                      className="text-state-danger-text hover:text-state-danger-text hover:bg-state-danger-bg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  serviceId: 0,
                  sessionNumber: fields.length + 1,
                  quantity: 1,
                  note: "",
                  status: 1,
                })
              }
              className="mt-3 text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm buổi
            </Button>
          </FormSection>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {COMMON_MSG.cancel}
            </Button>
            <Button type="submit" variant="admin" size="sm" loading={isPending}>
              {isEdit ? "Cập nhật" : "Tạo liệu trình"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getDefaultValues(
  course?: TreatmentCourseDto | null,
): TreatmentCourseFormValues {
  if (course) {
    return {
      code: course.code ?? "",
      name: course.name ?? "",
      description: course.description ?? "",
      content: course.content ?? "",
      categoryId: course.categoryId ?? undefined,
      originalPrice: course.originalPrice ?? 0,
      sellingPrice: course.sellingPrice ?? 0,
      imageUrl: course.imageUrl ?? "",
      sortOrder: course.sortOrder ?? undefined,
      status: course.status ?? 1,
      items: (course.items ?? []).map((i: TreatmentCourseItemDto) => ({
        serviceId: i.serviceId ?? 0,
        sessionNumber: i.sessionNumber ?? 0,
        quantity: i.quantity ?? 1,
        note: i.note ?? "",
        status: i.status ?? 1,
      })),
    };
  }
  return {
    code: "",
    name: "",
    description: "",
    content: "",
    categoryId: undefined,
    originalPrice: 0,
    sellingPrice: 0,
    imageUrl: "",
    sortOrder: undefined,
    status: 1,
    items: [],
  };
}
