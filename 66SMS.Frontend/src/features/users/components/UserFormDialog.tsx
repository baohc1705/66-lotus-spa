import { AdminInput } from "@/shared/components/forms/AdminInput";
import { AdminSelectTrigger } from "@/shared/components/forms/AdminSelectTrigger";
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
import { FormSection } from "@/shared/components/forms/FormSection";
import { FormField } from "@/shared/components/forms/FormField";
import { useCreateUser, useUpdateUser } from "../hooks/useUsers";
import {
  createSchema,
  updateSchema,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "../schemas/user.schema";
import type { UserDto } from "../types/user.types";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { Shield, User } from "lucide-react";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserDto | null;
}

const STATUS_OPTIONS = [
  { value: "1", label: "Hoạt động" },
  { value: "0", label: "Vô hiệu hóa" },
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

  // Form for creation
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

  // Form for update
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Cập nhật thông tin tài khoản ${user?.username ?? ""}`
              : "Nhập thông tin để tạo tài khoản mới"}
          </DialogDescription>
        </DialogHeader>

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
                  <AdminInput
                    {...updateForm.register("username")}
                    placeholder="Tên tài khoản..."
                  />
                </FormField>

                <FormField
                  label="Email"
                  error={updateForm.formState.errors.email?.message}
                >
                  <AdminInput
                    {...updateForm.register("email")}
                    placeholder="Email..."
                  />
                </FormField>

                <FormField label="Trạng thái">
                  <Select
                    value={updateForm.watch("status")?.toString() ?? "1"}
                    onValueChange={(v) =>
                      updateForm.setValue("status", Number(v))
                    }
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
            </FormSection>

            <DialogFooter className="pt-4 border-t">
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
                Cập nhật
              </Button>
            </DialogFooter>
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
                  <AdminInput
                    {...createForm.register("userName")}
                    placeholder="Tên tài khoản..."
                  />
                </FormField>

                <FormField
                  label="Email *"
                  error={createForm.formState.errors.email?.message}
                >
                  <AdminInput
                    {...createForm.register("email")}
                    placeholder="Email..."
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
                  <AdminInput
                    type="password"
                    {...createForm.register("password")}
                    placeholder="Mật khẩu..."
                  />
                </FormField>

                <FormField
                  label="Xác nhận mật khẩu *"
                  error={createForm.formState.errors.confirmPassword?.message}
                >
                  <AdminInput
                    type="password"
                    {...createForm.register("confirmPassword")}
                    placeholder="Xác nhận mật khẩu..."
                  />
                </FormField>

                <FormField label="Vai trò">
                  <Select
                    value={createForm.watch("role") ?? "staff"}
                    onValueChange={(v) => createForm.setValue("role", v)}
                  >
                    <AdminSelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </AdminSelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Nhân viên</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </FormSection>

            <DialogFooter className="pt-4 border-t">
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
                Tạo tài khoản
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
