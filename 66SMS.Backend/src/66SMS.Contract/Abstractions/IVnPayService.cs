using _66SMS.Contract.Constants;

namespace _66SMS.Contract.Abstractions
{
    public interface IVnPayService
    {
        // Khởi tạo URL thanh toán gửi sang VNPAY (đặt cọc / thanh toán còn lại)
        string CreatePaymentUrl(int appointmentId, decimal amount, string ipAddress, int phase = 2);

        // Khởi tạo URL nạp tiền vào ví khách hàng
        string CreateWalletTopUpUrl(int walletId, decimal amount, string ipAddress);

        VnPayPaymentResponseModel PaymentExecute(IDictionary<string, string> collections);
    }

    public class VnPayPaymentResponseModel
    {
        public bool Success { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string OrderDescription { get; set; } = string.Empty;
        public int AppointmentId { get; set; }
        public int Phase { get; set; } = 2; // Default to Final Payment
        public bool IsWalletTopUp { get; set; }
        public int WalletId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentId { get; set; } = string.Empty; // Mã giao dịch của hệ thống (TxnRef)
        public string TransactionId { get; set; } = string.Empty; // Mã giao dịch trên VNPAY
        public string Token { get; set; } = string.Empty;
        public string VnPayResponseCode { get; set; } = string.Empty;
    }
}
