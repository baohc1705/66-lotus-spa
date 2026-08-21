import {
  useCreateMembershipTier,
  useUpdateMembershipTier,
} from "@/features/customers/hooks/useMembershipTiers";
import type {
  CreateMembershipTierRequest,
  MembershipTierDto,
  UpdateMembershipTierRequest,
} from "@/features/customers/types/membershipTier.types";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { CurrencyInput } from "@/shared/forms/CurrencyInput";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { Textarea } from "@/shared/forms/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Crown } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";

// Options trạng thái
const STATUS_OPTIONS = [
  { value: "1", label: "Hoạt động" },
  { value: "0", label: "Ngưng hoạt động" },
  { value: "2", label: "Tạm khóa" },
];

// Validate dữ liệu client side
const membershipTierSchema = z.object({
  code: z.string().max(100, "Tối đa 100 ký tự").optional().or(z.literal("")),
  name: z
    .string()
    .min(1, "Tên loại thẻ không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  minSpending: z.coerce.number().min(0, "Chi tiêu tối thiểu không được âm"),
  discountPercent: z.coerce
    .number()
    .min(0, "Phần trăm giảm giá không được âm")
    .max(100, "Tối đa 100%"),
  pointMultiplier: z.coerce.number().min(0, "Hệ số điểm không được âm"),
  benefits: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  status: z.coerce.number().min(0),
});

// Validate dữ liệu client side cập nhật
const updateMembershipTierSchema = membershipTierSchema.partial();

// Type dữ liệu form
type MembershipTierFormData = z.infer<typeof membershipTierSchema>;

// Props
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier?: MembershipTierDto | null;
}

// Lấy giá trị mặc định
function getDefaultValues(
  tier?: MembershipTierDto | null,
): MembershipTierFormData {
  if (tier) {
    return {
      code: tier.code ?? "",
      name: tier.name ?? "",
      minSpending: tier.minSpending ?? 0,
      discountPercent: tier.discountPercent ?? 0,
      pointMultiplier: tier.pointMultiplier ?? 1,
      benefits: tier.benefits ?? "",
      status: tier.status ?? 1,
    };
  }

  return {
    code: "",
    name: "",
    minSpending: 0,
    discountPercent: 0,
    pointMultiplier: 1,
    benefits: "",
    status: 1,
  };
}

export function MembershipTierForm({ open, onOpenChange, tier }: Props) {
  // Kiểm tra xem có phải là chỉnh sửa không
  const isEdit = !!tier?.id;
  // Gọi hook tạo hạng thành viên
  const createMutation = useCreateMembershipTier();
  // Gọi hook cập nhật hạng thành viên
  const updateMutation = useUpdateMembershipTier();
  // Kiểm tra xem có đang xử lý không
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<MembershipTierFormData>({
    resolver: zodResolver(
      isEdit ? updateMembershipTierSchema : membershipTierSchema,
    ) as Resolver<MembershipTierFormData>,
    defaultValues: getDefaultValues(null),
  });

  // Kiểm tra xem form đã được áp dụng chưa
  const formKey = !open
    ? "closed"
    : isEdit
      ? `edit-${tier?.id ?? "loading"}`
      : "new";
  const [appliedFormKey, setAppliedFormKey] = useState(formKey);
  // Nếu form chưa được áp dụng thì áp dụng giá trị mặc định
  if (formKey !== appliedFormKey) {
    setAppliedFormKey(formKey);
    if (open === true) {
      reset(getDefaultValues(tier));
    }
  }

  // Lấy giá trị trạng thái và chi tiêu tối thiểu
  const status = useWatch({ control, name: "status" });
  const minSpending = useWatch({ control, name: "minSpending" });

  // Xử lý submit form
  function onSubmit(values: MembershipTierFormData) {
    const payload = {
      code: values.code || undefined,
      name: values.name,
      minSpending: values.minSpending,
      discountPercent: values.discountPercent,
      pointMultiplier: values.pointMultiplier,
      benefits: values.benefits || undefined,
      status: values.status,
    };

    // Nếu là chỉnh sửa thì cập nhật hạng thành viên
    if (isEdit && tier?.id) {
      updateMutation.mutate(
        { id: tier.id, payload: payload as UpdateMembershipTierRequest },
        {
          onSuccess: (result) => {
            if (result.isSuccess !== true) return;
            onOpenChange(false);
          },
        },
      );
      return;
    }

    // Nếu là tạo mới thì tạo hạng thành viên
    createMutation.mutate(payload as CreateMembershipTierRequest, {
      onSuccess: (result) => {
        if (result.isSuccess !== true) return;
        onOpenChange(false);
      },
    });
  }

  // Render form
  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa loại thẻ" : "Thêm loại thẻ mới"}
      size="lg"
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
            form="membership-tier-form"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={isPending}
          >
            {isEdit ? "Cập nhật" : "Tạo loại thẻ"}
          </Button>
        </>
      }
    >
      <form
        id="membership-tier-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormSection icon={Crown} title="Thông tin loại thẻ">
          <FormRow>
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
              label="Tên loại thẻ"
              required
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
              label="Chi tiêu tối thiểu"
              required
              tooltip="Mức chi tiêu tối thiểu (VND) để đạt loại thẻ này"
              error={errors.minSpending?.message}
            >
              <CurrencyInput
                value={minSpending}
                onChange={(value) => setValue("minSpending", value ?? 0)}
                placeholder="0"
              />
            </FormField>

            <FormField
              label="Giảm giá (%)"
              required
              tooltip="Phần trăm giảm giá áp dụng cho hóa đơn"
              error={errors.discountPercent?.message}
            >
              <Input
                {...register("discountPercent", { valueAsNumber: true })}
                type="number"
                placeholder="0"
                invalid={!!errors.discountPercent}
              />
            </FormField>

            <FormField
              label="Hệ số điểm"
              required
              tooltip="Hệ số nhân điểm thưởng khi mua hàng (ví dụ: 1.5)"
              error={errors.pointMultiplier?.message}
            >
              <Input
                {...register("pointMultiplier", { valueAsNumber: true })}
                type="number"
                step="0.1"
                placeholder="1.0"
                invalid={!!errors.pointMultiplier}
              />
            </FormField>

            <FormField label="Trạng thái">
              <Select
                value={status != null ? String(status) : "1"}
                onChange={(event) =>
                  setValue("status", Number(event.target.value))
                }
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
                placeholder="Giảm 10% các dịch vụ chăm sóc da, quà tặng sinh nhật..."
                rows={3}
                invalid={!!errors.benefits}
              />
            </FormField>
          </FormRow>
        </FormSection>
      </form>
    </Modal>
  );
}
