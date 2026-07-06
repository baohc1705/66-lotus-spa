import { AdminTextarea } from '@/shared/components/forms/AdminTextarea';
import { AdminInput } from '@/shared/components/forms/AdminInput';
import { AdminSelectTrigger } from '@/shared/components/forms/AdminSelectTrigger';
import { useEffect } from "react";
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
import { COMMON_MSG } from "@/shared/constants/common.messages";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa loại thẻ" : "Thêm loại thẻ mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Cập nhật thông tin loại thẻ ${tier?.name ?? ""}`
              : "Điền thông tin để tạo loại thẻ khách hàng mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div className="sm:col-span-2">
              <FormField
                label="Tên loại thẻ *"
                tooltip="Ví dụ: Vàng, Bạc, Kim cương..."
                error={errors.name?.message}
              >
                <AdminInput
                  {...register("name")}
                  placeholder="Vàng"
                />
              </FormField>
            </div>

            <FormField
              label="Chi tiêu tối thiểu *"
              tooltip="Mức chi tiêu tối thiểu để đạt loại thẻ này"
              error={errors.minSpending?.message}
            >
              <AdminInput
                {...register("minSpending")}
                type="number"
                placeholder="0"
              />
            </FormField>

            <FormField
              label="Giảm giá (%) *"
              tooltip="Phần trăm giảm giá áp dụng cho hóa đơn"
              error={errors.discountPercent?.message}
            >
              <AdminInput
                {...register("discountPercent")}
                type="number"
                placeholder="0"
              />
            </FormField>

            <FormField
              label="Hệ số điểm *"
              tooltip="Hệ số nhân điểm thưởng khi mua hàng (ví dụ: x1.5)"
              error={errors.pointMultiplier?.message}
            >
              <AdminInput
                {...register("pointMultiplier")}
                type="number"
                step="0.1"
                placeholder="1.0"
              />
            </FormField>

            <FormField label="Trạng thái">
              <Select
                value={statusValue?.toString() ?? "1"}
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

            <div className="sm:col-span-2">
              <FormField
                label="Quyền lợi chi tiết"
                error={errors.benefits?.message}
              >
                <AdminTextarea
                  {...register("benefits")}
                  placeholder="- Giảm 10% các dịch vụ chăm sóc da&#10;- Quà tặng sinh nhật"
                  className="text-lotus-admin-lg min-h-[80px]"
                />
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
            <Button
              type="submit"
              variant="admin"
              size="sm"
              loading={isPending}
            >
              {isEdit ? "Cập nhật" : "Tạo loại thẻ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getDefaultValues(
  tier?: MembershipTierDto | null,
): MembershipTierFormValues {
  if (tier) {
    return {
      name: tier.name,
      minSpending: tier.minSpending,
      discountPercent: tier.discountPercent,
      pointMultiplier: tier.pointMultiplier,
      benefits: tier.benefits ?? "",
      status: tier.status,
    };
  }
  return {
    name: "",
    minSpending: 0,
    discountPercent: 0,
    pointMultiplier: 1.0,
    benefits: "",
    status: 1,
  };
}
