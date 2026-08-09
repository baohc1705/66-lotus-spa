import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { Textarea } from "@/shared/forms/Textarea";
import { COMMON_MSG } from "@/shared/constants/common.messages";

import {
  useCreateMembershipTier,
  useUpdateMembershipTier,
} from "../hooks/useMembershipTiers";
import {
  createMembershipTierSchema,
  updateMembershipTierSchema,
  type MembershipTierFormValues,
} from "../schemas/membershipTier.schema";
import type { MembershipTierDto } from "../types/membershipTier.types";

interface MembershipTierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier?: MembershipTierDto | null;
}

const STATUS_OPTIONS = [
  { value: "1", label: "Hoạt động" },
  { value: "0", label: "Ngưng hoạt động" },
  { value: "2", label: "Tạm khóa" },
];

export function MembershipTierFormDialog({
  open,
  onOpenChange,
  tier,
}: MembershipTierFormDialogProps) {
  const isEdit = !!tier;
  const createMutation = useCreateMembershipTier();
  const updateMutation = useUpdateMembershipTier();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<MembershipTierFormValues>({
    resolver: zodResolver(
      isEdit ? updateMembershipTierSchema : createMembershipTierSchema,
    ) as Resolver<MembershipTierFormValues>,
    defaultValues: getDefaultValues(tier),
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

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(tier));
    }
  }, [open, tier, reset]);

  const onSubmit = (data: MembershipTierFormValues) => {
    if (isEdit && tier?.id) {
      updateMutation.mutate(
        { id: tier.id, payload: data },
        {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: (result) => {
          if (result.isSuccess) onOpenChange(false);
        },
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa loại thẻ" : "Thêm loại thẻ mới"}
      size="md"
      scrollable
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <FormField
            label="Mã hạng"
            tooltip="Để trống sẽ tự tạo từ tên (vd: common, gold)"
            error={errors.code?.message}
          >
            <Input
              {...register("code")}
              placeholder="gold"
              invalid={!!errors.code}
            />
          </FormField>

          <FormField
            label="Tên loại thẻ *"
            tooltip="Ví dụ: Vàng, Bạc, Kim cương..."
            error={errors.name?.message}
          >
            <Input
              {...register("name")}
              placeholder="Vàng"
              invalid={!!errors.name}
            />
          </FormField>

          <FormField
            label="Chi tiêu tối thiểu *"
            tooltip="Mức chi tiêu tối thiểu (VND) để đạt loại thẻ này"
            error={errors.minSpending?.message}
          >
            <Input
              {...register("minSpending")}
              type="number"
              placeholder="0"
              invalid={!!errors.minSpending}
            />
          </FormField>

          <FormField
            label="Giảm giá (%) *"
            tooltip="Phần trăm giảm giá áp dụng cho hóa đơn"
            error={errors.discountPercent?.message}
          >
            <Input
              {...register("discountPercent")}
              type="number"
              placeholder="0"
              invalid={!!errors.discountPercent}
            />
          </FormField>

          <FormField
            label="Hệ số điểm *"
            tooltip="Hệ số nhân điểm thưởng khi mua hàng (ví dụ: x1.5)"
            error={errors.pointMultiplier?.message}
          >
            <Input
              {...register("pointMultiplier")}
              type="number"
              step="0.1"
              placeholder="1.0"
              invalid={!!errors.pointMultiplier}
            />
          </FormField>

          <FormField label="Trạng thái">
            <Select
              value={statusValue?.toString() ?? "1"}
              onChange={(e) => setValue("status", Number(e.target.value))}
              options={STATUS_OPTIONS}
              placeholder="Chọn trạng thái"
            />
          </FormField>

          <FormField
            label="Quyền lợi chi tiết"
            error={errors.benefits?.message}
            className="sm:col-span-2"
          >
            <Textarea
              {...register("benefits")}
              placeholder="- Giảm 10% các dịch vụ chăm sóc da&#10;- Quà tặng sinh nhật"
              rows={3}
              invalid={!!errors.benefits}
            />
          </FormField>
        </div>

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
            loading={isPending}
          >
            {isEdit ? "Cập nhật" : "Tạo loại thẻ"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function getDefaultValues(
  tier?: MembershipTierDto | null,
): MembershipTierFormValues {
  if (tier) {
    return {
      code: tier.code ?? "",
      name: tier.name,
      minSpending: tier.minSpending,
      discountPercent: tier.discountPercent,
      pointMultiplier: tier.pointMultiplier,
      benefits: tier.benefits ?? "",
      status: tier.status,
    };
  }
  return {
    code: "",
    name: "",
    minSpending: 0,
    discountPercent: 0,
    pointMultiplier: 1.0,
    benefits: "",
    status: 1,
  };
}
