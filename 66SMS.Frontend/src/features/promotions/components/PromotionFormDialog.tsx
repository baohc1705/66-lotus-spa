import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tag } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import {
  localDateTimeToUtc,
  toDatetimeLocalInput,
} from "@/shared/utils/date.utils";

import { useCreatePromotion, useUpdatePromotion } from "../hooks/usePromotions";
import {
  promotionSchema,
  type PromotionFormValues,
} from "../schemas/promotion.schema";
import {
  DISCOUNT_TYPE_OPTIONS,
  STATUS_OPTIONS,
  type PromotionDto,
} from "../types/promotion.types";

interface PromotionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion?: PromotionDto | null;
}

const DISCOUNT_TYPE_SELECT_OPTIONS = DISCOUNT_TYPE_OPTIONS.map((opt) => ({
  value: String(opt.value),
  label: opt.label,
}));

const STATUS_SELECT_OPTIONS = STATUS_OPTIONS.map((opt) => ({
  value: String(opt.value),
  label: opt.label,
}));

function getDefaultValues(
  promotion?: PromotionDto | null,
): PromotionFormValues {
  if (!promotion) {
    return {
      code: "",
      name: "",
      description: "",
      discountType: 1,
      discountValue: undefined,
      maxDiscountAmount: undefined,
      minOrderValue: undefined,
      buyQuantity: undefined,
      getQuantity: undefined,
      usageLimit: undefined,
      startDate: "",
      endDate: "",
      status: 1,
    };
  }
  return {
    code: promotion.code ?? "",
    name: promotion.name ?? "",
    description: promotion.description ?? "",
    discountType: promotion.discountType ?? 1,
    discountValue: promotion.discountValue ?? undefined,
    maxDiscountAmount:
      promotion.maxDiscountAmount != null && promotion.maxDiscountAmount > 0
        ? promotion.maxDiscountAmount
        : undefined,
    minOrderValue: promotion.minOrderValue ?? undefined,
    buyQuantity: promotion.buyQuantity ?? undefined,
    getQuantity: promotion.getQuantity ?? undefined,
    usageLimit:
      promotion.usageLimit != null && promotion.usageLimit > 0
        ? promotion.usageLimit
        : undefined,
    startDate: toDatetimeLocalInput(promotion.startDate),
    endDate: toDatetimeLocalInput(promotion.endDate),
    status: promotion.status ?? 1,
  };
}

export function PromotionFormDialog({
  open,
  onOpenChange,
  promotion,
}: PromotionFormDialogProps) {
  const isEdit = !!promotion;
  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema) as Resolver<PromotionFormValues>,
    defaultValues: getDefaultValues(promotion),
  });

  const discountType = watch("discountType");
  const statusValue = watch("status");

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(promotion));
    }
  }, [open, promotion, reset]);

  function onSubmit(values: PromotionFormValues) {
    const payload = {
      ...values,
      usageLimit: values.usageLimit ?? undefined,
      startDate: localDateTimeToUtc(values.startDate),
      endDate: localDateTimeToUtc(values.endDate),
    };
    if (isEdit && promotion?.id) {
      updateMutation.mutate(
        { id: promotion.id, payload },
        {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: (result) => {
          if (result.isSuccess) onOpenChange(false);
        },
      });
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi mới"}
      size="lg"
      scrollable
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection icon={Tag} title="Thông tin khuyến mãi">
          <FormRow>
            <FormField label="Mã khuyến mãi *" error={errors.code?.message}>
              <Input
                {...register("code")}
                placeholder="VD: SUMMER2025"
                invalid={!!errors.code}
              />
            </FormField>
            <FormField label="Tên chương trình *" error={errors.name?.message}>
              <Input
                {...register("name")}
                placeholder="Nhập tên..."
                invalid={!!errors.name}
              />
            </FormField>
          </FormRow>

          <FormField label="Mô tả" error={errors.description?.message}>
            <Input
              {...register("description")}
              placeholder="Mô tả ngắn..."
              invalid={!!errors.description}
            />
          </FormField>

          <FormRow>
            <FormField
              label="Kiểu giảm *"
              error={errors.discountType?.message}
            >
              <Select
                value={String(discountType)}
                onChange={(e) =>
                  setValue("discountType", Number(e.target.value))
                }
                options={DISCOUNT_TYPE_SELECT_OPTIONS}
                placeholder="Chọn kiểu giảm"
              />
            </FormField>

            <FormField label="Trạng thái" error={errors.status?.message}>
              <Select
                value={String(statusValue ?? 1)}
                onChange={(e) => setValue("status", Number(e.target.value))}
                options={STATUS_SELECT_OPTIONS}
                placeholder="Chọn trạng thái"
              />
            </FormField>
          </FormRow>

          {discountType === 1 ? (
            <FormRow>
              <FormField
                label="Phần trăm giảm (%) *"
                error={errors.discountValue?.message}
              >
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100"
                  {...register("discountValue")}
                  placeholder="VD: 10"
                  invalid={!!errors.discountValue}
                />
              </FormField>
              <FormField
                label="Giảm tối đa (VNĐ)"
                error={errors.maxDiscountAmount?.message}
              >
                <Input
                  type="number"
                  min="0"
                  {...register("maxDiscountAmount")}
                  placeholder="Để trống = không giới hạn"
                  invalid={!!errors.maxDiscountAmount}
                />
              </FormField>
            </FormRow>
          ) : null}

          {discountType === 2 ? (
            <FormField
              label="Số tiền giảm (VNĐ) *"
              error={errors.discountValue?.message}
            >
              <Input
                type="number"
                min="0"
                {...register("discountValue")}
                placeholder="VD: 50000"
                invalid={!!errors.discountValue}
              />
            </FormField>
          ) : null}

          {discountType === 3 ? (
            <FormRow>
              <FormField
                label="Số lượng mua (X) *"
                error={errors.buyQuantity?.message}
              >
                <Input
                  type="number"
                  min="1"
                  {...register("buyQuantity")}
                  placeholder="VD: 2"
                  invalid={!!errors.buyQuantity}
                />
              </FormField>
              <FormField
                label="Số lượng tặng (Y) *"
                error={errors.getQuantity?.message}
              >
                <Input
                  type="number"
                  min="1"
                  {...register("getQuantity")}
                  placeholder="VD: 1"
                  invalid={!!errors.getQuantity}
                />
              </FormField>
            </FormRow>
          ) : null}

          <FormRow>
            <FormField
              label="Đơn hàng tối thiểu (VNĐ)"
              error={errors.minOrderValue?.message}
            >
              <Input
                type="number"
                min="0"
                {...register("minOrderValue")}
                placeholder="Để trống = không giới hạn"
                invalid={!!errors.minOrderValue}
              />
            </FormField>
            <FormField
              label="Giới hạn sử dụng"
              error={errors.usageLimit?.message}
            >
              <Input
                type="number"
                min="1"
                {...register("usageLimit")}
                placeholder="Để trống = không giới hạn"
                invalid={!!errors.usageLimit}
              />
            </FormField>
          </FormRow>

          <FormRow>
            <FormField
              label="Ngày bắt đầu *"
              error={errors.startDate?.message}
            >
              <Input
                type="datetime-local"
                {...register("startDate")}
                invalid={!!errors.startDate}
              />
            </FormField>
            <FormField
              label="Ngày kết thúc *"
              error={errors.endDate?.message}
            >
              <Input
                type="datetime-local"
                {...register("endDate")}
                invalid={!!errors.endDate}
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
            Hủy
          </Button>
          <Button
            type="submit"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={isPending}
          >
            {isEdit ? "Cập nhật" : "Tạo khuyến mãi"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
