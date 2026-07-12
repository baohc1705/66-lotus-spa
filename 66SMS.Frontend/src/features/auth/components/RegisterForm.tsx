import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  Loader2,
  Mail,
  RotateCcw,
  User,
  Lock,
  Phone,
} from "lucide-react";
import {
  registerSchema,
  type RegisterFormData,
} from "@/features/auth/schemas/registerSchema";
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
      confirmPassword: ""
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate({ ...data, status: 1 }, {
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
      {/* Header inside Form card */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-ink font-sans">Đăng ký</h3>
        <div className="w-12 h-[2px] bg-rose-600 mx-auto mt-2" />
      </div>

      {/* Họ và tên */}
      <div className="space-y-1.5">
        <div className="relative">
          <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-warm-400 pointer-events-none w-5 h-5">
            <User className="w-5 h-5" />
          </span>
          <Input
            id="fullName"
            type="text"
            placeholder="Họ và tên"
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-warm-100 bg-white text-warm-600 text-sm outline-none transition-all duration-200 focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
            aria-invalid={!!errors.fullName}
            {...register("fullName")}
          />
        </div>
        {errors.fullName && <FieldError message={errors.fullName.message} />}
      </div>

      {/* Số điện thoại */}
      <div className="space-y-1.5">
        <div className="relative">
          <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-warm-400 pointer-events-none w-5 h-5">
            <Phone className="w-5 h-5" />
          </span>
          <Input
            id="phone"
            type="tel"
            placeholder="Số điện thoại"
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-warm-100 bg-white text-warm-600 text-sm outline-none transition-all duration-200 focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
        </div>
        {errors.phone && <FieldError message={errors.phone.message} />}
      </div>

      {/* Tên đăng nhập */}
      <div className="space-y-1.5">
        <div className="relative">
          <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-warm-400 pointer-events-none w-5 h-5">
            <User className="w-5 h-5" />
          </span>
          <Input
            id="userName"
            type="text"
            placeholder="Tên đăng nhập"
            autoComplete="username"
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-warm-100 bg-white text-warm-600 text-sm outline-none transition-all duration-200 focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
            aria-invalid={!!errors.userName}
            {...register("userName")}
          />
        </div>
        {errors.userName && <FieldError message={errors.userName.message} />}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <div className="relative">
          <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-warm-400 pointer-events-none w-5 h-5">
            <Mail className="w-5 h-5" />
          </span>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-warm-100 bg-white text-warm-600 text-sm outline-none transition-all duration-200 focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </div>
        {errors.email && <FieldError message={errors.email.message} />}
      </div>

      {/* Mật khẩu */}
      <div className="space-y-1.5">
        <PasswordField
          id="password"
          placeholder="Mật khẩu"
          autoComplete="new-password"
          show={showPassword}
          onToggle={() => setShowPassword((v) => !v)}
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && <FieldError message={errors.password.message} />}
      </div>

      {/* Xác nhận mật khẩu */}
      <div className="space-y-1.5">
        <PasswordField
          id="confirmPassword"
          placeholder="Xác nhận mật khẩu"
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

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-warm-100" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-warm-400">hoặc</span>
        </div>
      </div>

      {/* Login Link */}
      <div className="text-center text-xs text-warm-600">
        Đã có tài khoản?{" "}
        <Link to="/login" className="font-semibold text-rose-600 hover:text-rose-500 hover:underline transition-colors">
          Đăng nhập ngay
        </Link>
      </div>
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
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in" noValidate>
      {/* Header inside Form card */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-ink font-sans">Xác thực OTP</h3>
        <div className="w-12 h-[2px] bg-rose-600 mx-auto mt-2" />
      </div>

      <div className="text-center">
        <p className="text-sm text-warm-600">
          Chúng tôi đã gửi mã OTP 6 chữ số đến email
        </p>
        <p className="text-sm font-semibold text-rose-600 mt-1">
          {maskedEmail}
        </p>
      </div>

      {/* OTP boxes */}
      <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
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
            className="w-11 h-12 text-center text-lg font-bold rounded-xl border transition-all duration-150 outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 bg-white"
            style={{
              borderColor: digit ? 'var(--rose-600)' : 'var(--warm-100)',
              color: 'var(--ink)',
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
      <div className="text-center text-xs text-warm-600">
        {countdown > 0 ? (
          <span>
            Gửi lại sau{" "}
            <span className="font-semibold text-rose-600">
              {countdown}s
            </span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={sendOtpMutation.isPending}
            className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-500 hover:underline transition-colors disabled:opacity-50"
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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-state-danger-text font-medium pl-1 mt-1">
      {message}
    </p>
  );
}

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  show: boolean;
  onToggle: () => void;
}

function PasswordField({
  show,
  onToggle,
  ...inputProps
}: PasswordFieldProps) {
  return (
    <div className="relative">
      <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-warm-400 pointer-events-none w-5 h-5">
        <Lock className="w-5 h-5" />
      </span>
      <Input
        {...inputProps}
        type={show ? "text" : "password"}
        className={`w-full h-11 pl-11 pr-12 rounded-xl border border-warm-100 bg-white text-warm-600 text-sm outline-none transition-all duration-200 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 ${inputProps.className ?? ""}`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-warm-400 hover:text-warm-600 transition-colors"
        aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        <Eye className="w-5 h-5" />
      </button>
    </div>
  );
}

interface SubmitButtonProps {
  pending: boolean;
  disabled?: boolean;
  label: string;
  pendingLabel: string;
}

function SubmitButton({
  pending,
  disabled = false,
  label,
  pendingLabel,
}: SubmitButtonProps) {
  const isDisabled = pending || disabled;
  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-white bg-rose-600 font-semibold text-sm transition-all duration-200 outline-none hover:bg-rose-500 hover:shadow-lg active:bg-rose-800 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-warm-400 mt-2"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{pendingLabel}</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
}

