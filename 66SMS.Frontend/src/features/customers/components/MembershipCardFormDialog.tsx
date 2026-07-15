import { AdminInput } from '@/shared/components/forms/AdminInput';
import { AdminSelectTrigger } from '@/shared/components/forms/AdminSelectTrigger';
import { useEffect, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import { FormField } from "@/shared/components/forms/FormField";
import { useUpdateMembershipCard } from "../hooks/useMembershipCards";
import { useMembershipTiers } from "../hooks/useMembershipTiers";
import {
  updateMembershipCardSchema,
  type MembershipCardFormValues,
} from "../schemas/membershipCard.schema";
import type { MembershipCardDto } from "../types/membershipCard.types";
import type { MembershipTierDto } from "../types/membershipTier.types";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import {
  toDatetimeLocalInput,
  localDateTimeToUtc,
} from "@/shared/utils/date.utils";

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

  // Fetch tiers for select dropdown
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Cập nhật thẻ thành viên</DialogTitle>
          <DialogDescription>
            {`Chỉnh sửa thông tin thẻ của khách hàng ${card.customerName ?? ""}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <FormField label="Mã thẻ *" error={errors.cardCode?.message}>
              <AdminInput
                {...register("cardCode")}
                placeholder="Nhập mã thẻ"
              />
            </FormField>

            <FormField
              label="Loại thẻ"
              error={errors.membershipTierId?.message}
            >
              <Select
                value={watch("membershipTierId")?.toString() ?? ""}
                onValueChange={(v) => setValue("membershipTierId", Number(v))}
              >
                <AdminSelectTrigger>
                  <SelectValue placeholder="Chọn loại thẻ" />
                </AdminSelectTrigger>
                <SelectContent>
                  {tiers.map((tier: MembershipTierDto) => (
                    <SelectItem key={tier.id} value={tier.id!.toString()}>
                      {tier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Ngày cấp" error={errors.issuedAt?.message}>
              <AdminInput type="datetime-local" {...register("issuedAt")} />
            </FormField>

            <FormField
              label="Ngày hết hạn"
              tooltip="Để trống nếu thẻ có giá trị vĩnh viễn"
              error={errors.expiresAt?.message}
            >
              <AdminInput type="datetime-local" {...register("expiresAt")} />
            </FormField>

            <div className="sm:col-span-2">
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
            </div>
          </div>

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
              Cập nhật thẻ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getDefaultValues(
  card?: MembershipCardDto | null,
): MembershipCardFormValues {
  if (card) {
    return {
      membershipTierId: card.membershipTierId ?? undefined,
      cardCode: card.cardCode ?? "",
      // API UTC → local cho input datetime-local
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
