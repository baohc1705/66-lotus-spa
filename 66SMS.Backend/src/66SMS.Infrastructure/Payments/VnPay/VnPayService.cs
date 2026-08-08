using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Settings;
using _66SMS.Domain.Constants;
using Microsoft.Extensions.Options;

namespace _66SMS.Infrastructure.Payments.VnPay
{
    public class VnPayService : IVnPayService
    {
        private const string PhaseTopUp = "TOPUP";
        private readonly VnPaySettings vnPaySettings;

        public VnPayService(IOptions<VnPaySettings> options)
        {
            this.vnPaySettings = options.Value;
        }

        /// <summary>
        /// LOGIC TẠO URL: Map các field required của VNPAY và gọi VnPayLibrary
        /// </summary>
        public string CreatePaymentUrl(int appointmentId, decimal amount, string ipAddress, int phase = 2)
        {
            var tick = DateTimeHelper.UtcNow().Ticks.ToString();
            var phaseCode = phase == AppointmentPaymentConst.PHASE_DEPOSIT ? "DEPOSIT" : "BALANCE";
            var txnRef = $"{appointmentId}_{phaseCode}_{tick}";

            return BuildPaymentUrl(amount, ipAddress, txnRef);
        }

        public string CreateWalletTopUpUrl(int walletId, decimal amount, string ipAddress)
        {
            var tick = DateTimeHelper.UtcNow().Ticks.ToString();
            var txnRef = $"{walletId}_{PhaseTopUp}_{tick}";

            return BuildPaymentUrl(amount, ipAddress, txnRef);
        }

        /// <summary>
        /// LOGIC XỬ LÝ KẾT QUẢ TRẢ VỀ TỪ VNPAY
        /// </summary>
        public VnPayPaymentResponseModel PaymentExecute(IDictionary<string, string> collections)
        {
            var vnpay = new VnPayLibrary();
            foreach (var (key, value) in collections)
            {
                if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
                {
                    vnpay.AddResponseData(key, value); // Đọc toàn bộ param bắt đầu bằng vnp_
                }
            }
            var vnp_orderId = vnpay.GetResponseData("vnp_TxnRef"); // Mã đã cấu hình ở hàm CreatePaymentUrl
            var vnp_TransactionId = vnpay.GetResponseData("vnp_TransactionNo");
            var vnp_SecureHash = collections.FirstOrDefault(p => p.Key == "vnp_SecureHash").Value;
            var vnp_ResponseCode = vnpay.GetResponseData("vnp_ResponseCode"); // "00" là thành công
            var vnp_OrderInfo = vnpay.GetResponseData("vnp_OrderInfo");
            var vnp_AmountRaw = vnpay.GetResponseData("vnp_Amount");

            // Kiểm tra tính hợp lệ của dữ liệu bằng chữ ký
            bool checkSignature = vnpay.ValidateSignature(vnp_SecureHash, vnPaySettings.HashSecret);
            if (!checkSignature)
            {
                return new VnPayPaymentResponseModel { Success = false }; // Chữ ký sai hoặc bị giả mạo
            }

            decimal.TryParse(vnp_AmountRaw, out var amountHundreds);
            var amount = amountHundreds / 100m;

            // Tách vnp_TxnRef (VD: 12_DEPOSIT_63721345 hoặc 5_TOPUP_63721345)
            var parts = vnp_orderId.Split('_', StringSplitOptions.RemoveEmptyEntries);
            int.TryParse(parts.Length > 0 ? parts[0] : "0", out var entityId);
            var phaseCode = parts.Length > 1 ? parts[1] : string.Empty;

            if (phaseCode == PhaseTopUp)
            {
                return new VnPayPaymentResponseModel
                {
                    Success = vnp_ResponseCode == "00",
                    PaymentMethod = "VnPay",
                    OrderDescription = vnp_OrderInfo,
                    IsWalletTopUp = true,
                    WalletId = entityId,
                    Amount = amount,
                    PaymentId = vnp_orderId,
                    TransactionId = vnp_TransactionId,
                    Token = vnp_SecureHash,
                    VnPayResponseCode = vnp_ResponseCode,
                };
            }

            var phase = AppointmentPaymentConst.PHASE_FINAL_PAYMENT;
            if (parts.Length > 2)
            {
                phase = phaseCode switch
                {
                    "DEPOSIT" => AppointmentPaymentConst.PHASE_DEPOSIT,
                    "BALANCE" => AppointmentPaymentConst.PHASE_FINAL_PAYMENT,
                    _ => AppointmentPaymentConst.PHASE_FINAL_PAYMENT,
                };
            }

            return new VnPayPaymentResponseModel
            {
                Success = vnp_ResponseCode == "00",// Chỉ cập nhật DB nếu mã code = 00
                PaymentMethod = "VnPay",
                OrderDescription = vnp_OrderInfo,
                AppointmentId = entityId,
                Phase = phase,
                Amount = amount,
                PaymentId = vnp_orderId,
                TransactionId = vnp_TransactionId,
                Token = vnp_SecureHash,
                VnPayResponseCode = vnp_ResponseCode,
            };
        }

        private string BuildPaymentUrl(decimal amount, string ipAddress, string txnRef)
        {
            var vnpay = new VnPayLibrary();
            vnpay.AddRequestData("vnp_Version", "2.1.0");
            vnpay.AddRequestData("vnp_Command", "pay");
            vnpay.AddRequestData("vnp_TmnCode", vnPaySettings.TmnCode);
            vnpay.AddRequestData("vnp_Amount", ((long)(amount * 100)).ToString());
            vnpay.AddRequestData("vnp_CreateDate", DateTimeHelper.UtcNowString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_CurrCode", "VND");
            vnpay.AddRequestData("vnp_IpAddr", ipAddress);
            vnpay.AddRequestData("vnp_Locale", "vn");
            vnpay.AddRequestData("vnp_OrderInfo", txnRef);
            vnpay.AddRequestData("vnp_OrderType", "other");
            vnpay.AddRequestData("vnp_ReturnUrl", vnPaySettings.ReturnUrl);
            vnpay.AddRequestData("vnp_TxnRef", txnRef);
            return vnpay.CreateRequestUrl(vnPaySettings.PaymentUrl, vnPaySettings.HashSecret);
        }
    }
}
