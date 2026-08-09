import { useEffect, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import {
  toDatetimeLocalInput,
  localDateTimeToUtc,
} from "@/shared/utils/date.utils";

import { useUpdateMembershipCard } from "../hooks/useMembershipCards";
import { useMembershipTiers } from "../hooks/useMembershipTiers";
import {
  updateMembershipCardSchema,
  type MembershipCardFormValues,
} from "../schemas/membershipCard.schema";
import type { MembershipCardDto } from "../types/membershipCard.types";
import type { MembershipTierDto } from "../types/membershipTier.types";

interface MembershipCardFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: MembershipCardDto | null;
}

const STATUS_OPTIONS = [
  { value: "1", label: "Hoạt động" },
  { value: "0", label: "Ngưng hoạt động" },
  { value: "2", label: "Tạm khóa" },
];

export function MembershipCardFormDialog({
  open,
  onOpenChange,
  card,
}: MembershipCardFormDialogProps) {
  const updateMutation = useUpdateMembershipCard();
  const isPending = updateMutation.isPending;

  const { data: tiersResult } = useMembershipTiers({ pageSize: 100 });
  const tiers = useMemo(
    () => tiersResult?.data?.items ?? [],
    [tiersResult?.data?.items],
  );

  const form = useForm<MembershipCardFormValues>({
    resolver: zodResolver(
      updateMembershipCardSchema,
    ) as Resolver<MembershipCardFormValues>,
    defaultValues: getDefaultValues(card),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(card));
    }
  }, [open, card, reset]);

  const onSubmit = (data: MembershipCardFormValues) => {
    if (card?.id) {
      const payload = {
        ...data,
        membershipTierId: data.membershipTierId ?? undefined,
        issuedAt:
          data.issuedAt === "" ? undefined : localDateTimeToUtc(data.issuedAt),
        expiresAt:
          data.expiresAt === ""
            ? undefined
            : localDateTimeToUtc(data.expiresAt),
      };
      updateMutation.mutate(
        { id: card.id, payload },
        {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        },
      );
    }
  };

  if (!card) return null;

  const tierOptions = tiers.map((tier: MembershipTierDto) => ({
    value: tier.id!.toString(),
    label: tier.name,
  }));

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Cập nhật thẻ thành viên"
      size="md"
      scrollable
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <FormField label="Mã thẻ *" error={errors.cardCode?.message}>
            <Input
              {...register("cardCode")}
              placeholder="Nhập mã thẻ"
              invalid={!!errors.cardCode}
            />
          </FormField>

          <FormField
            label="Loại thẻ"
            error={errors.membershipTierId?.message}
          >
            <Select
              value={watch("membershipTierId")?.toString() ?? ""}
              onChange={(e) =>
                setValue("membershipTierId", Number(e.target.value))
              }
              options={tierOptions}
              placeholder="Chọn loại thẻ"
              invalid={!!errors.membershipTierId}
            />
          </FormField>

          <FormField label="Ngày cấp" error={errors.issuedAt?.message}>
            <Input
              type="datetime-local"
              {...register("issuedAt")}
              invalid={!!errors.issuedAt}
            />
          </FormField>

          <FormField
            label="Ngày hết hạn"
            tooltip="Để trống nếu thẻ có giá trị vĩnh viễn"
            error={errors.expiresAt?.message}
          >
            <Input
              type="datetime-local"
              {...register("expiresAt")}
              invalid={!!errors.expiresAt}
            />
          </FormField>

          <FormField label="Trạng thái" className="sm:col-span-2">
            <Select
              value={watch("status")?.toString() ?? "1"}
              onChange={(e) => setValue("status", Number(e.target.value))}
              options={STATUS_OPTIONS}
              placeholder="Chọn trạng thái"
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
            Cập nhật thẻ
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function getDefaultValues(
  card?: MembershipCardDto | null,
): MembershipCardFormValues {
  if (card) {
    return {
      membershipTierId: card.membershipTierId ?? undefined,
      cardCode: card.cardCode ?? "",
      issuedAt: toDatetimeLocalInput(card.issuedAt),
      expiresAt: toDatetimeLocalInput(card.expiresAt),
      status: card.status,
    };
  }
  return {
    membershipTierId: undefined,
    cardCode: "",
    issuedAt: "",
    expiresAt: "",
    status: 1,
  };
}
