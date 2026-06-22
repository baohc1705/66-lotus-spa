import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  RotateCcw,
} from "lucide-react";
import {
  registerSchema,
  type RegisterFormData,
} from "@/features/auth/schemas/registerSchema";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";
import { useRegister } from "@/features/auth/hooks/useRegister";
import { useSendOtp } from "@/features/auth/hooks/useSendOtp";
import { useVerifyOtp } from "@/features/auth/hooks/useVerifyOtp";
import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";

const RESEND_COOLDOWN = 60;
const OTP_LENGTH = 6;

type Step = "register" | "verify";

// ─── Root shell — owns the step state ────────────────────────────────────────
export const RegisterForm = () => {
  const [step, setStep] = useState<Step>("register");
  const [registeredEmail, setRegisteredEmail] = useState("");

  if (step === "register") {
    return (
      <RegisterStep
        onSuccess={(email) => {
          setRegisteredEmail(email);
          setStep("verify");
        }}
      />
    );
  }

  return <OtpStep email={registeredEmail} />;
};

// ─── Step 1: registration form ───────────────────────────────────────────────

interface RegisterStepProps {
  onSuccess: (email: string) => void;
}

const RegisterStep = ({ onSuccess }: RegisterStepProps) => {
  // Named `registerMutation` to avoid collision with RHF's `register` below
  const registerMutation = useRegister();
  const sendOtpMutation = useSendOtp();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof registerSchema>, unknown, RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data, {
      onSuccess: (response) => {
        const customerId = response.data?.customerId ?? 0;

        // Gọi song song sendOtp và tạo membership card để tránh gọi tuần tự không cần thiết.
        // Hai thao tác độc lập nhau — OTP dùng email, membership card dùng customerId từ register response.
        // Nếu tạo membership card thất bại thì vẫn chuyển bước OTP bình thường (best-effort).
        Promise.allSettled([
          sendOtpMutation.mutateAsync({ email: data.email }),
          customerId > 0
            ? axiosInstance.post(API.membershipCards, {
                customerId,
                membershipTierName: "common",
                issuedAt: new Date().toISOString(),
                status: 1,
              })
            : Promise.resolve(),
        ]).then(([otpResult]) => {
          if (otpResult.status === "fulfilled") {
            toast.success(
              "Đăng ký thành công! Mã OTP đã được gửi đến email của bạn.",
            );
          } else {
            toast.warning(
              "Đăng ký thành công nhưng không gửi được OTP. Vui lòng thử gửi lại.",
            );
          }
          onSuccess(data.email);
        });
      },
    });
  };

  const isPending = registerMutation.isPending || sendOtpMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Họ và tên</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Nhập họ và tên"
            aria-invalid={!!errors.fullName}
            {...register("fullName")}
          />
          {errors.fullName && <FieldError message={errors.fullName.message} />}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Nhập số điện thoại"
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          {errors.phone && <FieldError message={errors.phone.message} />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="userName">Tên đăng nhập</Label>
          <Input
            id="userName"
            type="text"
            placeholder="Tên đăng nhập"
            autoComplete="username"
            aria-invalid={!!errors.userName}
            {...register("userName")}
          />
          {errors.userName && <FieldError message={errors.userName.message} />}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Nhập email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && <FieldError message={errors.email.message} />}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Mật khẩu</Label>
        <PasswordField
          id="password"
          placeholder="Nhập mật khẩu"
          autoComplete="new-password"
          show={showPassword}
          onToggle={() => setShowPassword((v) => !v)}
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && <FieldError message={errors.password.message} />}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
        <PasswordField
          id="confirmPassword"
          placeholder="Nhập lại mật khẩu"
          autoComplete="new-password"
          show={showConfirmPassword}
          onToggle={() => setShowConfirmPassword((v) => !v)}
          aria-invalid={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <FieldError message={errors.confirmPassword.message} />
        )}
      </div>

      <SubmitButton
        pending={isPending}
        label="Đăng ký"
        pendingLabel="Đang xử lý..."
      />
    </form>
  );
};

// ─── Step 2: OTP verification ─────────────────────────────────────────────────

interface OtpStepProps {
  email: string;
}

const OtpStep = ({ email }: OtpStepProps) => {
  const navigate = useNavigate();
  const verifyOtpMutation = useVerifyOtp();
  const sendOtpMutation = useSendOtp();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const focusAt = (index: number) => inputRefs.current[index]?.focus();

  const handleChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = char;
    setOtp(next);
    if (char && index < OTP_LENGTH - 1) focusAt(index + 1);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const next = [...otp];
        next[index] = "";
        setOtp(next);
      } else if (index > 0) {
        focusAt(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusAt(index - 1);
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusAt(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("") as string[];
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setOtp(next);
    focusAt(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const handleResend = () => {
    sendOtpMutation.mutate(
      { email },
      {
        onSuccess: () => {
          toast.success("Đã gửi lại mã OTP!");
          setCountdown(RESEND_COOLDOWN);
          setOtp(Array(OTP_LENGTH).fill(""));
          focusAt(0);
        },
      },
    );
  };

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      toast.error("Vui lòng nhập đủ 6 chữ số OTP.");
      return;
    }
    verifyOtpMutation.mutate(
      { email, otpCode: code },
      {
        onSuccess: () => {
          toast.success("Xác minh email thành công! Vui lòng đăng nhập.");
          navigate("/login");
        },
      },
    );
  };

  const maskedEmail = email.replace(
    /^(.{2})(.+?)(@.+)$/,
    (_, a, b, c) => a + "*".repeat(Math.min(b.length, 4)) + c,
  );

  const otpComplete = otp.every((d) => d !== "");

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #fce7f3, #fbcfe8)" }}
        >
          <Mail className="w-7 h-7 text-pink-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--spa-ui-text)]">
            Xác minh địa chỉ email
          </h3>
          <p className="text-sm text-[var(--spa-ui-text-muted)] mt-1">
            Chúng tôi đã gửi mã OTP 6 chữ số đến
          </p>
          <p className="text-sm font-semibold text-[var(--spa-rose)]">
            {maskedEmail}
          </p>
        </div>
      </div>

      {/* OTP boxes */}
      <div className="flex justify-center gap-3" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-150 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 bg-white"
            style={{
              borderColor: digit ? "#E91E8C" : "#e5e7eb",
              color: "#1f2937",
            }}
            aria-label={`Ký tự OTP thứ ${i + 1}`}
          />
        ))}
      </div>

      <SubmitButton
        pending={verifyOtpMutation.isPending}
        disabled={!otpComplete}
        label="Xác nhận"
        pendingLabel="Đang xác minh..."
      />

      {/* Resend */}
      <div className="text-center text-sm text-[var(--spa-ui-text-muted)]">
        {countdown > 0 ? (
          <span>
            Gửi lại sau{" "}
            <span className="font-semibold text-[var(--spa-rose)]">
              {countdown}s
            </span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={sendOtpMutation.isPending}
            className="inline-flex items-center gap-1.5 font-semibold text-[var(--spa-rose)] hover:text-[var(--spa-rose-hover)] transition-colors disabled:opacity-50"
          >
            {sendOtpMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            Gửi lại OTP
          </button>
        )}
      </div>
    </form>
  );
};

// ─── Shared sub-components ───────────────────────────────────────────────────

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <p className="text-xs text-[var(--spa-error)] flex items-center gap-1">
      <span className="inline-block w-1 h-1 rounded-full bg-[var(--spa-error)]" />
      {message}
    </p>
  );
};

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  show: boolean;
  onToggle: () => void;
}

const PasswordField = ({
  show,
  onToggle,
  ...inputProps
}: PasswordFieldProps) => (
  <div className="relative">
    <Input
      {...inputProps}
      type={show ? "text" : "password"}
      className={`pr-12 ${inputProps.className ?? ""}`}
    />
    <button
      type="button"
      onClick={onToggle}
      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
      aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
    >
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  </div>
);

interface SubmitButtonProps {
  pending: boolean;
  disabled?: boolean;
  label: string;
  pendingLabel: string;
}

const SubmitButton = ({
  pending,
  disabled = false,
  label,
  pendingLabel,
}: SubmitButtonProps) => {
  const isDisabled = pending || disabled;
  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-white font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-200 mt-2 ${
        isDisabled
          ? "opacity-60 cursor-not-allowed"
          : "hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
      }`}
      style={{
        background: isDisabled
          ? "#9ca3af"
          : "linear-gradient(135deg, #E91E8C, #C4177A)",
      }}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{pendingLabel}</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
};
