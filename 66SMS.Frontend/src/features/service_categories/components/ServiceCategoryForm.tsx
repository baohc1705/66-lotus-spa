import {
  useCreateServiceCategory,
  useUpdateServiceCategory,
} from "@/features/service_categories/hooks/useServiceCategories";
import type {
  CreateServiceCategoryRequest,
  ServiceCategoryDto,
  UpdateServiceCategoryRequest,
} from "@/features/service_categories/types/serviceCategory.types";
import { Modal } from "@/shared/components/Modal";
import { Tabs } from "@/shared/components/Tabs";
import { StatusActive } from "@/shared/constants/status.enum";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { ImageUpload } from "@/shared/forms/ImageUpload";
import { Input } from "@/shared/forms/Input";
import { Switch } from "@/shared/forms/Switch";
import { Textarea } from "@/shared/forms/Textarea";
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";

// Giải thích:
// Validate dữ liệu client side
const serviceCategorySchema = z.object({
  name: z
    .string()
    .nonempty("Tên nhóm dịch vụ không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  description: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  sortOrder: z.coerce.number().min(0, "Phải lớn hơn hoặc bằng 0").optional(),
  status: z.coerce.number().optional(),
});

type ServiceCategoryFormData = z.infer<typeof serviceCategorySchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceCategory?: ServiceCategoryDto | null;
  onSuccess?: (category: ServiceCategoryDto) => void;
}

// Giải thích:
// Hàm getDefaultValues để lấy giá trị mặc định cho form
function getDefaultValues(
  serviceCategory?: ServiceCategoryDto | null,
): ServiceCategoryFormData {
  return {
    name: serviceCategory?.name ?? "",
    description: serviceCategory?.description ?? "",
    sortOrder: serviceCategory?.sortOrder ?? 0,
    status: serviceCategory?.status ?? StatusActive.Active,
  };
}

export function ServiceCategoryForm({
  open,
  onOpenChange,
  serviceCategory,
  onSuccess,
}: Props) {
  // Kiểm tra xem có phải là chỉnh sửa không
  const isEdit = !!serviceCategory;
  const createMutation = useCreateServiceCategory();
  const updateMutation = useUpdateServiceCategory();
  // Kiểm tra xem có phải là đang xử lý không
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [activeTab, setActiveTab] = useState("info");
  const [pendingIconFile, setPendingIconFile] = useState<File | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Giải thích:
  // formKey đổi khi đóng/mở modal hoặc đổi bản ghi sửa. Khác appliedFormKey thì reset tab và file ảnh ngay lúc render (không dùng useEffect để tránh eslint set-state-in-effect).
  const formKey = !open
    ? "closed"
    : isEdit
      ? `edit-${serviceCategory?.id ?? "new"}`
      : "new";
  const [appliedFormKey, setAppliedFormKey] = useState(formKey);
  if (formKey !== appliedFormKey) {
    setAppliedFormKey(formKey);
    if (open === true) {
      setActiveTab("info");
      setPendingIconFile(null);
      setPendingImageFile(null);
    }
  }

  // Sử dụng hook useForm để quản lý form
  // Sử dụng zodResolver để validate dữ liệu client side
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ServiceCategoryFormData>({
    resolver: zodResolver(
      serviceCategorySchema,
    ) as Resolver<ServiceCategoryFormData>,
    defaultValues: getDefaultValues(serviceCategory),
  });

  // Giải thích:
  // Sử dụng hook useWatch để theo dõi trạng thái của switch
  const status = useWatch({ control, name: "status" });

  // Giải thích:
  // Reset form khi mở modal
  useEffect(() => {
    if (!open) return;
    reset(getDefaultValues(serviceCategory));
  }, [open, serviceCategory, reset]);

  // Giải thích:
  // Hàm onSubmit để xử lý dữ liệu form khi submit
  async function onSubmit(values: ServiceCategoryFormData) {
    setIsUploading(true);
    try {
      let icon: string | undefined;
      let imageUrl: string | undefined;
      if (pendingIconFile) {
        icon = await fileToBase64(pendingIconFile);
      }
      if (pendingImageFile) {
        imageUrl = await fileToBase64(pendingImageFile);
      }

      // Nếu là chỉnh sửa thì dùng type update và gọi update mutation
      if (isEdit && serviceCategory?.id) {
        const data: UpdateServiceCategoryRequest = {
          name: values.name,
          description: values.description || undefined,
          sortOrder: values.sortOrder,
          status: values.status,
        };
        if (icon) data.icon = icon;
        if (imageUrl) data.imageUrl = imageUrl;

        updateMutation.mutate(
          { id: serviceCategory.id, data },
          {
            onSuccess: (result) => {
              if (result.isSuccess !== true) return;
              onOpenChange(false);
              onSuccess?.({ ...serviceCategory, ...data });
            },
          },
        );
        return;
      }

      // Mặc định tạo mới với type create request và gọi create mutation
      const payload: CreateServiceCategoryRequest = {
        name: values.name,
        description: values.description || undefined,
        sortOrder: values.sortOrder,
        status: values.status,
      };
      if (icon) payload.icon = icon;
      if (imageUrl) payload.imageUrl = imageUrl;

      createMutation.mutate(payload, {
        onSuccess: (result) => {
          if (result.isSuccess !== true) return;
          onOpenChange(false);
          onSuccess?.(payload);
        },
      });
    } finally {
      setIsUploading(false);
    }
  }

  const saving = isPending || isUploading;

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa nhóm dịch vụ" : "Thêm nhóm dịch vụ mới"}
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
            disabled={saving}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="service-category-form"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={saving}
          >
            {isEdit ? "Cập nhật" : "Tạo nhóm dịch vụ"}
          </Button>
        </>
      }
    >
      <form
        id="service-category-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Tabs
          variant="body"
          activeId={activeTab}
          onChange={setActiveTab}
          tabs={[
            {
              id: "info",
              label: "Thông tin",
              content: (
                <FormSection title="Thông tin nhóm dịch vụ">
                  <FormRow>
                    <FormField
                      label="Tên nhóm dịch vụ"
                      required
                      tooltip="Vui lòng nhập vào tên nhóm dịch vụ"
                      error={errors.name?.message}
                    >
                      <Input
                        {...register("name")}
                        placeholder="Chăm sóc da cơ bản"
                        invalid={!!errors.name}
                      />
                    </FormField>

                    <FormField
                      label="Thứ tự hiển thị"
                      tooltip="Số nhỏ sẽ được ưu tiên hiển thị trước"
                      error={errors.sortOrder?.message}
                    >
                      <Input
                        {...register("sortOrder", { valueAsNumber: true })}
                        type="number"
                        placeholder="0"
                        invalid={!!errors.sortOrder}
                      />
                    </FormField>

                    <FormField
                      label="Trạng thái"
                      tooltip="Bật để kích hoạt nhóm dịch vụ"
                      error={errors.status?.message}
                    >
                      <div className="flex h-9 items-center">
                        <Switch
                          checked={status === StatusActive.Active}
                          onChange={(checked: boolean) =>
                            setValue(
                              "status",
                              checked
                                ? StatusActive.Active
                                : StatusActive.Inactive,
                            )
                          }
                        />
                      </div>
                    </FormField>

                    <FormField
                      label="Mô tả"
                      tooltip="Không dài quá 500 ký tự"
                      error={errors.description?.message}
                      className="sm:col-span-2"
                    >
                      <Textarea
                        {...register("description")}
                        placeholder="Mô tả nhóm dịch vụ ở đây"
                        rows={3}
                        invalid={!!errors.description}
                      />
                    </FormField>
                  </FormRow>
                </FormSection>
              ),
            },
            {
              id: "images",
              label: "Hình ảnh",
              content: (
                <FormRow>
                  <FormField
                    label="Icon"
                    tooltip="Ảnh icon nhỏ cho nhóm dịch vụ"
                  >
                    <ImageUpload
                      key={`icon-${open}-${serviceCategory?.id ?? "new"}`}
                      value={serviceCategory?.icon}
                      onFileChange={setPendingIconFile}
                      shape="square"
                      label="Chọn icon"
                    />
                  </FormField>

                  <FormField
                    label="Ảnh đại diện"
                    tooltip="Ảnh lớn hiển thị nhóm dịch vụ"
                  >
                    <ImageUpload
                      key={`image-${open}-${serviceCategory?.id ?? "new"}`}
                      value={serviceCategory?.imageUrl}
                      onFileChange={setPendingImageFile}
                      shape="square"
                      label="Chọn ảnh"
                    />
                  </FormField>
                </FormRow>
              ),
            },
          ]}
        />
      </form>
    </Modal>
  );
}
