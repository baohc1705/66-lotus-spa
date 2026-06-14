using _66SMS.Contracts.Constants;

namespace _66SMS.Contracts.Abstractions
{
    public interface IVnPayService
    {
        // Khởi tạo URL thanh toán gửi sang VNPAY
        string CreatePaymentUrl(int appointmentId, decimal amount, string description, string ipAddress, int phase = 2);
        VnPayPaymentResponseModel PaymentExecute(IDictionary<string, string> collections); 
    }

    public class VnPayPaymentResponseModel
    {
        public bool Success { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string OrderDescription { get; set; } = string.Empty;
        public int AppointmentId { get; set; }
        public int Phase { get; set; } = 2; // Default to Final Payment
        public string PaymentId { get; set; } = string.Empty; // Mã giao dịch của hệ thống (TxnRef)
        public string TransactionId { get; set; } = string.Empty; // Mã giao dịch trên VNPAY
        public string Token { get; set; } = string.Empty;
        public string VnPayResponseCode { get; set; } = string.Empty;
    }
}
