import { useEffect } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Leaf, ListOrdered } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Textarea } from "@/shared/forms/Textarea";
import { Select } from "@/shared/forms/Select";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";

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
  CreateTreatmentCoursePayload,
  UpdateTreatmentCoursePayload,
} from "../types/treatmentCourse.types";
import type { ServiceDto } from "@/features/services/types/service.types";
import type { ServiceCategoryDto } from "@/features/service_categories/types/serviceCategory.types";
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

  const categoryOptions: { value: string; label: string }[] = [];
  for (let index = 0; index < categories.length; index++) {
    const category = categories[index];
    categoryOptions.push({
      value: String(category.id ?? ""),
      label: category.name ?? "",
    });
  }

  const serviceOptions: { value: string; label: string }[] = [];
  for (let index = 0; index < services.length; index++) {
    const service = services[index];
    serviceOptions.push({
      value: String(service.id ?? ""),
      label: service.name ?? "",
    });
  }

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
    const items: TreatmentCourseItemPayload[] = [];
    for (let index = 0; index < data.items.length; index++) {
      const item = data.items[index];
      items.push({
        serviceId: item.serviceId,
        sessionNumber: item.sessionNumber,
        quantity: item.quantity,
        note: item.note || undefined,
        status: item.status ?? 1,
      });
    }

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
        items,
      };
      updateMutation.mutate(
        { id: course.id, payload },
        {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        },
      );
      return;
    }

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
      items,
    };
    createMutation.mutate(payload, {
      onSuccess: (result) => {
        if (result.isSuccess) onOpenChange(false);
      },
    });
  };

  function renderItemRows() {
    const rows = [];
    for (let index = 0; index < fields.length; index++) {
      const field = fields[index];
      rows.push(
        <div
          key={field.id}
          className="grid grid-cols-12 items-start gap-2 rounded-lg border border-kit bg-kit-page p-3"
        >
          <p className="text-xs font-semibold text-kit-muted">#{index + 1}</p>
          <div className="col-span-4">
            <p className="mb-1 text-xs font-medium text-kit-heading">
              Dịch vụ *
            </p>
            <SearchableSelect
              value={watch(`items.${index}.serviceId`)?.toString() ?? ""}
              onChange={(value) =>
                setValue(`items.${index}.serviceId`, Number(value))
              }
              options={serviceOptions}
              placeholder="Chọn dịch vụ"
              searchPlaceholder="Tìm dịch vụ..."
            />
            {errors.items?.[index]?.serviceId ? (
              <p className="mt-0.5 text-xs text-kit-danger">
                {errors.items[index]?.serviceId?.message}
              </p>
            ) : null}
          </div>
          <div className="col-span-2">
            <p className="mb-1 text-xs font-medium text-kit-heading">
              Buổi thứ *
            </p>
            <Input
              {...register(`items.${index}.sessionNumber`)}
              type="number"
              min={1}
            />
            {errors.items?.[index]?.sessionNumber ? (
              <p className="mt-0.5 text-xs text-kit-danger">
                {errors.items[index]?.sessionNumber?.message}
              </p>
            ) : null}
          </div>
          <div className="col-span-2">
            <p className="mb-1 text-xs font-medium text-kit-heading">Số lần</p>
            <Input
              {...register(`items.${index}.quantity`)}
              type="number"
              min={1}
            />
          </div>
          <div className="col-span-2">
            <p className="mb-1 text-xs font-medium text-kit-heading">Ghi chú</p>
            <Input
              {...register(`items.${index}.note`)}
              placeholder="Ghi chú..."
            />
          </div>
          <div className="col-span-1 mt-5 flex items-end justify-center">
            <Button
              type="button"
              variant="outline-danger"
              size="icon-sm"
              className="mb-0 mr-0"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>,
      );
    }
    return rows;
  }

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa liệu trình" : "Thêm liệu trình mới"}
      size="xl"
      scrollable
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormSection icon={Leaf} title="Thông tin liệu trình">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <FormField label="Mã liệu trình *" error={errors.code?.message}>
              <Input
                {...register("code")}
                placeholder="LT001"
                invalid={!!errors.code}
              />
            </FormField>
            <FormField label="Tên liệu trình *" error={errors.name?.message}>
              <Input
                {...register("name")}
                placeholder="Trị mụn chuyên sâu"
                invalid={!!errors.name}
              />
            </FormField>
            <FormField
              label="Giá gốc *"
              error={errors.originalPrice?.message}
            >
              <Input
                {...register("originalPrice")}
                type="number"
                min={0}
                placeholder="0"
                invalid={!!errors.originalPrice}
              />
            </FormField>
            <FormField label="Giá bán *" error={errors.sellingPrice?.message}>
              <Input
                {...register("sellingPrice")}
                type="number"
                min={0}
                placeholder="0"
                invalid={!!errors.sellingPrice}
              />
            </FormField>
            <FormField label="Nhóm dịch vụ">
              <SearchableSelect
                value={watch("categoryId")?.toString() ?? ""}
                onChange={(value) =>
                  setValue("categoryId", value ? Number(value) : undefined)
                }
                options={categoryOptions}
                placeholder="Chọn nhóm dịch vụ"
                searchPlaceholder="Tìm nhóm..."
              />
            </FormField>
            <FormField label="Trạng thái">
              <Select
                value={watch("status")?.toString() ?? "1"}
                onChange={(e) => setValue("status", Number(e.target.value))}
                options={STATUS_OPTIONS}
                placeholder="Chọn trạng thái"
              />
            </FormField>
            <FormField label="Thứ tự sắp xếp">
              <Input
                {...register("sortOrder")}
                type="number"
                placeholder="0"
              />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Mô tả" error={errors.description?.message}>
                <Textarea
                  {...register("description")}
                  placeholder="Mô tả ngắn về liệu trình..."
                  rows={3}
                  invalid={!!errors.description}
                />
              </FormField>
            </div>
          </div>
        </FormSection>

        <FormSection icon={ListOrdered} title="Danh sách buổi dịch vụ">
          {errors.items?.root?.message ? (
            <p className="mb-2 text-xs font-medium text-kit-danger">
              {errors.items.root.message}
            </p>
          ) : null}
          {typeof errors.items?.message === "string" ? (
            <p className="mb-2 text-xs font-medium text-kit-danger">
              {errors.items.message}
            </p>
          ) : null}
          <div className="space-y-3">{renderItemRows()}</div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mb-0 mt-3"
            onClick={() =>
              append({
                serviceId: 0,
                sessionNumber: fields.length + 1,
                quantity: 1,
                note: "",
                status: 1,
              })
            }
          >
            <Plus className="h-3.5 w-3.5" /> Thêm buổi
          </Button>
        </FormSection>

        <div className="flex justify-end gap-2 border-t border-kit pt-3">
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
            variant="admin"
            size="sm"
            className="mb-0"
            loading={isPending}
          >
            {isEdit ? "Cập nhật" : "Tạo liệu trình"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function getDefaultValues(
  course?: TreatmentCourseDto | null,
): TreatmentCourseFormValues {
  if (course) {
    const items: TreatmentCourseFormValues["items"] = [];
    const sourceItems = course.items ?? [];
    for (let index = 0; index < sourceItems.length; index++) {
      const item: TreatmentCourseItemDto = sourceItems[index];
      items.push({
        serviceId: item.serviceId ?? 0,
        sessionNumber: item.sessionNumber ?? 0,
        quantity: item.quantity ?? 1,
        note: item.note ?? "",
        status: item.status ?? 1,
      });
    }
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
      items,
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
