import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, User } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";

import { useCreateUser, useUpdateUser } from "../hooks/useUsers";
import {
  createSchema,
  updateSchema,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "../schemas/user.schema";
import type { UserDto } from "../types/user.types";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserDto | null;
}

const STATUS_OPTIONS = [
  { value: "1", label: "Hoạt động" },
  { value: "0", label: "Vô hiệu hóa" },
];

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Nhân viên" },
];

export function UserFormDialog({
  open,
  onOpenChange,
  user,
}: UserFormDialogProps) {
  const isEdit = !!user;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const createForm = useForm<CreateUserPayload>({
    resolver: zodResolver(createSchema) as Resolver<CreateUserPayload>,
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "staff",
    },
  });

  const updateForm = useForm<Omit<UpdateUserPayload, "id">>({
    resolver: zodResolver(updateSchema) as Resolver<
      Omit<UpdateUserPayload, "id">
    >,
    defaultValues: {
      username: "",
      email: "",
      status: 1,
    },
  });

  useEffect(() => {
    if (open) {
      if (isEdit && user) {
        updateForm.reset({
          username: user.username ?? "",
          email: user.email ?? "",
          status: user.status !== null ? Number(user.status) : 1,
        });
      } else {
        createForm.reset({
          userName: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "staff",
        });
      }
    }
  }, [open, user, isEdit, createForm, updateForm]);

  const onCreateSubmit = (data: CreateUserPayload) => {
    createMutation.mutate(data, {
      onSuccess: (result) => {
        if (result.isSuccess) onOpenChange(false);
      },
    });
  };

  const onUpdateSubmit = (data: Omit<UpdateUserPayload, "id">) => {
    if (!user?.id) return;
    updateMutation.mutate(
      { ...data, id: user.id },
      {
        onSuccess: (result) => {
          if (result.isSuccess) onOpenChange(false);
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
      size="md"
      scrollable
    >
      {isEdit ? (
        <form
          onSubmit={updateForm.handleSubmit(onUpdateSubmit)}
          className="space-y-4"
        >
          <FormSection icon={User} title="Tài khoản">
            <div className="space-y-4">
              <FormField
                label="Tên tài khoản"
                error={updateForm.formState.errors.username?.message}
              >
                <Input
                  {...updateForm.register("username")}
                  placeholder="Tên tài khoản..."
                  invalid={!!updateForm.formState.errors.username}
                />
              </FormField>

              <FormField
                label="Email"
                error={updateForm.formState.errors.email?.message}
              >
                <Input
                  {...updateForm.register("email")}
                  placeholder="Email..."
                  invalid={!!updateForm.formState.errors.email}
                />
              </FormField>

              <FormField label="Trạng thái">
                <Select
                  value={updateForm.watch("status")?.toString() ?? "1"}
                  onChange={(e) =>
                    updateForm.setValue("status", Number(e.target.value))
                  }
                  options={STATUS_OPTIONS}
                  placeholder="Chọn trạng thái"
                />
              </FormField>
            </div>
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
              Cập nhật
            </Button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={createForm.handleSubmit(onCreateSubmit)}
          className="space-y-4"
        >
          <FormSection icon={User} title="Tài khoản mới">
            <div className="space-y-4">
              <FormField
                label="Tên tài khoản *"
                error={createForm.formState.errors.userName?.message}
              >
                <Input
                  {...createForm.register("userName")}
                  placeholder="Tên tài khoản..."
                  invalid={!!createForm.formState.errors.userName}
                />
              </FormField>

              <FormField
                label="Email *"
                error={createForm.formState.errors.email?.message}
              >
                <Input
                  {...createForm.register("email")}
                  placeholder="Email..."
                  invalid={!!createForm.formState.errors.email}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection icon={Shield} title="Bảo mật & Quyền">
            <div className="space-y-4">
              <FormField
                label="Mật khẩu *"
                error={createForm.formState.errors.password?.message}
              >
                <Input
                  type="password"
                  {...createForm.register("password")}
                  placeholder="Mật khẩu..."
                  invalid={!!createForm.formState.errors.password}
                />
              </FormField>

              <FormField
                label="Xác nhận mật khẩu *"
                error={createForm.formState.errors.confirmPassword?.message}
              >
                <Input
                  type="password"
                  {...createForm.register("confirmPassword")}
                  placeholder="Xác nhận mật khẩu..."
                  invalid={!!createForm.formState.errors.confirmPassword}
                />
              </FormField>

              <FormField label="Vai trò">
                <Select
                  value={createForm.watch("role") ?? "staff"}
                  onChange={(e) => createForm.setValue("role", e.target.value)}
                  options={ROLE_OPTIONS}
                  placeholder="Chọn vai trò"
                />
              </FormField>
            </div>
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
              Tạo tài khoản
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
