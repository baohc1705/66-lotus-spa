import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/shared/elements/Button";
import { cashierApi } from "../api/cashier.api";
import { CASHIER_DAILY } from "../cashierQueryKey";

type PaymentPhase = "deposit" | "balance" | "topup";

export function VnPayReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const [phase, setPhase] = useState<PaymentPhase>("balance");

  useEffect(() => {
    const processReturn = async () => {
      try {
        const queryString = searchParams.toString();
        if (!queryString) {
          setStatus("error");
          setMessage("Không có thông tin thanh toán.");
          return;
        }

        const data = await cashierApi.vnPayReturn(queryString);

        if (data.isSuccess && data.data) {
          await queryClient.invalidateQueries({ queryKey: [CASHIER_DAILY] });
          await queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
          await queryClient.invalidateQueries({ queryKey: ["my-wallet"] });
          await queryClient.invalidateQueries({
            queryKey: ["my-wallet-transactions"],
          });
          setStatus("success");
          setPhase(data.data.paymentPhase as PaymentPhase);
          setMessage(data.data.message || "Thanh toán thành công!");
        } else {
          setStatus("error");
          setMessage(data.message || "Giao dịch thanh toán thất bại.");
        }
      } catch {
        setStatus("error");
        setMessage("Lỗi không xác định khi xử lý thanh toán.");
      }
    };

    processReturn();
  }, [searchParams, queryClient]);

  const handleReturn = () => {
    if (phase === "deposit" || phase === "topup") {
      navigate(phase === "topup" ? "/ho-so?tab=wallet" : "/ho-so");
    } else {
      navigate("/thu-ngan");
    }
  };

  const returnText =
    phase === "topup"
      ? "Quay lại ví của tôi"
      : phase === "deposit"
        ? "Quay lại trang cá nhân"
        : "Quay lại trang thu ngân";

  const successTitle =
    phase === "topup" ? "Nạp tiền thành công!" : "Thanh toán thành công!";

  return (
    <div className="flex min-h-screen items-center justify-center bg-kit-page font-sans">
      <div className="w-full max-w-md rounded border border-kit bg-kit-white p-8 text-center shadow-kit-card">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="mb-4 h-16 w-16 animate-spin text-kit-primary" />
            <h2 className="text-xl font-semibold text-kit-heading">
              Đang xử lý kết quả...
            </h2>
            <p className="mt-2 text-kit-muted">Vui lòng đợi trong giây lát</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-kit-success/20 bg-kit-success/10">
              <CheckCircle2 className="h-10 w-10 text-kit-success" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-kit-heading">
              {successTitle}
            </h2>
            <p className="mb-6 text-kit-muted">{message}</p>
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="mb-0 mr-0 w-full"
              onClick={handleReturn}
            >
              {returnText}
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-kit-danger/20 bg-kit-danger/10">
              <XCircle className="h-10 w-10 text-kit-danger" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-kit-heading">
              Thanh toán thất bại
            </h2>
            <p className="mb-6 text-kit-muted">{message}</p>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="mb-0 mr-0 w-full"
              onClick={handleReturn}
            >
              {returnText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
