import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2 } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { ImageUpload } from "@/shared/forms/ImageUpload";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import { COMMON_MSG } from "@/shared/constants/common.messages";

import {
  useCreateLandingBannerMutation,
  useUpdateLandingBannerMutation,
  useLandingBannerDetail,
} from "../hooks/useLandingBanners";
import {
  createLandingBannerSchema,
  updateLandingBannerSchema,
  type LandingBannerFormValues,
} from "../schemas/landing-banner.schema";
import type { LandingBannerDto } from "../types/landing-banner.types";

interface LandingBannerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bannerId?: number | null;
}

const STATUS_OPTIONS = [
  { value: "1", label: "Đang hiện" },
  { value: "0", label: "Ẩn" },
];

function getDefaultValues(
  banner?: LandingBannerDto | null,
): LandingBannerFormValues {
  if (banner) {
    return {
      title: banner.title ?? "",
      subtitle: banner.subtitle ?? "",
      brandLabel: banner.brandLabel ?? "",
      imageUrl: banner.imageUrl ?? "",
      ctaPrimaryText: banner.ctaPrimaryText ?? "",
      ctaPrimaryHref: banner.ctaPrimaryHref ?? "",
      ctaSecondaryText: banner.ctaSecondaryText ?? "",
      ctaSecondaryHref: banner.ctaSecondaryHref ?? "",
      sortOrder: banner.sortOrder ?? 0,
      status: banner.status ?? 1,
    };
  }
  return {
    title: "",
    subtitle: "",
    brandLabel: "",
    imageUrl: "",
    ctaPrimaryText: "Đặt lịch ngay",
    ctaPrimaryHref: "/dat-lich",
    ctaSecondaryText: "Khám phá",
    ctaSecondaryHref: "#about",
    sortOrder: 0,
    status: 1,
  };
}

export function LandingBannerFormDialog({
  open,
  onOpenChange,
  bannerId = null,
}: LandingBannerFormDialogProps) {
  const isEdit = bannerId != null && bannerId > 0;
  const detailQuery = useLandingBannerDetail(open && isEdit ? bannerId : null);
  const banner = detailQuery.data?.data;
  const createMutation = useCreateLandingBannerMutation();
  const updateMutation = useUpdateLandingBannerMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<LandingBannerFormValues>({
    resolver: zodResolver(
      isEdit ? updateLandingBannerSchema : createLandingBannerSchema,
    ) as Resolver<LandingBannerFormValues>,
    defaultValues: getDefaultValues(null),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;
  const statusValue = watch("status");
  const imageUrlValue = watch("imageUrl");

  useEffect(() => {
    if (!open) return;
    setPendingFile(null);
    if (isEdit) {
      if (banner) reset(getDefaultValues(banner));
    } else {
      reset(getDefaultValues(null));
    }
  }, [open, isEdit, banner, reset]);

  const onSubmit = async (data: LandingBannerFormValues) => {
    setIsUploading(true);
    try {
      let imageBase64: string | undefined;
      if (pendingFile) {
        imageBase64 = await fileToBase64(pendingFile);
      }
      const payload = {
        ...data,
        imageUrl: data.imageUrl ?? "",
        imageBase64,
      };

      if (isEdit && bannerId) {
        updateMutation.mutate(
          { id: bannerId, payload },
          {
            onSuccess: (result) => {
              if (result.isSuccess) onOpenChange(false);
            },
          },
        );
      } else {
        createMutation.mutate(
          payload as Parameters<typeof createMutation.mutate>[0],
          {
            onSuccess: (result) => {
              if (result.isSuccess) onOpenChange(false);
            },
          },
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa banner" : "Thêm banner mới"}
      size="lg"
      scrollable
    >
      {isEdit && detailQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-kit-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Đang tải banner...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormSection icon={ImageIcon} title="Nội dung banner">
            <div className="mb-5">
              <ImageUpload
                value={imageUrlValue || banner?.imageUrl}
                onFileChange={setPendingFile}
                shape="square"
                label="Ảnh banner"
              />
            </div>

            <FormField label="Tiêu đề *" error={errors.title?.message}>
              <Input
                {...register("title")}
                placeholder="Tĩnh lặng"
                invalid={!!errors.title}
              />
            </FormField>

            <FormField
              label="Nhãn thương hiệu"
              error={errors.brandLabel?.message}
            >
              <Input
                {...register("brandLabel")}
                placeholder="Hoa Sen Spa · Đồng Tháp"
                invalid={!!errors.brandLabel}
              />
            </FormField>

            <FormField label="Mô tả ngắn" error={errors.subtitle?.message}>
              <Input
                {...register("subtitle")}
                placeholder="Mô tả ngắn dưới tiêu đề..."
                invalid={!!errors.subtitle}
              />
            </FormField>

            <FormRow>
              <FormField
                label="CTA chính"
                error={errors.ctaPrimaryText?.message}
              >
                <Input
                  {...register("ctaPrimaryText")}
                  placeholder="Đặt lịch ngay"
                  invalid={!!errors.ctaPrimaryText}
                />
              </FormField>
              <FormField
                label="Link CTA chính"
                error={errors.ctaPrimaryHref?.message}
              >
                <Input
                  {...register("ctaPrimaryHref")}
                  placeholder="/dat-lich"
                  invalid={!!errors.ctaPrimaryHref}
                />
              </FormField>
            </FormRow>

            <FormRow>
              <FormField
                label="CTA phụ"
                error={errors.ctaSecondaryText?.message}
              >
                <Input
                  {...register("ctaSecondaryText")}
                  placeholder="Khám phá"
                  invalid={!!errors.ctaSecondaryText}
                />
              </FormField>
              <FormField
                label="Link CTA phụ"
                error={errors.ctaSecondaryHref?.message}
              >
                <Input
                  {...register("ctaSecondaryHref")}
                  placeholder="#about"
                  invalid={!!errors.ctaSecondaryHref}
                />
              </FormField>
            </FormRow>

            <FormRow>
              <FormField label="Thứ tự" error={errors.sortOrder?.message}>
                <Input
                  {...register("sortOrder")}
                  type="number"
                  placeholder="0"
                  invalid={!!errors.sortOrder}
                />
              </FormField>
              <FormField label="Trạng thái">
                <Select
                  value={String(statusValue ?? 1)}
                  onChange={(e) => setValue("status", Number(e.target.value))}
                  options={STATUS_OPTIONS}
                  placeholder="Chọn trạng thái"
                />
              </FormField>
            </FormRow>
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
              {COMMON_MSG.cancel}
            </Button>
            <Button
              type="submit"
              variant="admin"
              size="sm"
              className="mb-0"
              loading={isPending || isUploading}
            >
              {isEdit ? "Cập nhật" : "Tạo banner"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
