using MediatR;
using System.Collections.Generic;

namespace _66SMS.Application.Features.Cashier.Commands.VnPayIpn
{
    // Command này đóng vai trò nhận toàn bộ dữ liệu từ URL Query String mà VNPAY gửi sang
    public class VnPayIpnCommand : IRequest<VnPayIpnResponse>
    {
        // Lưu trữ toàn bộ các tham số bắt đầu bằng "vnp_" mà VNPAY gửi đến qua IPN
        public IDictionary<string, string> QueryData { get; set; } = new Dictionary<string, string>();
    }

    // Class đại diện cho cấu trúc JSON bắt buộc phải trả về cho VNPAY theo tài liệu IPN
    public class VnPayIpnResponse
    {
        // Mã phản hồi trạng thái của hệ thống
        public string RspCode { get; set; } = string.Empty;
        // Thông báo chi tiết tương ứng với mã RspCode
        public string Message { get; set; } = string.Empty;

        // Mã "00": Khi hệ thống của bạn đã ghi nhận giao dịch thành công (hoặc thất bại) và đã cập nhật CSDL
        public static VnPayIpnResponse Success() => new VnPayIpnResponse { RspCode = "00", Message = "Confirm Success" };
        
        // Mã "01": Khi mã đơn hàng (vnp_TxnRef) mà VNPAY gửi sang không tồn tại trong CSDL của bạn
        public static VnPayIpnResponse OrderNotFound() => new VnPayIpnResponse { RspCode = "01", Message = "Order not found" };
        
        // Mã "02": Khi đơn hàng đã được cập nhật trạng thái trước đó rồi (ví dụ Return URL đã chạy trước IPN)
        public static VnPayIpnResponse OrderAlreadyConfirmed() => new VnPayIpnResponse { RspCode = "02", Message = "Order already confirmed" };
        
        // Mã "04": Khi số tiền VNPAY gửi sang (vnp_Amount) không khớp với số tiền của đơn hàng trong CSDL
        public static VnPayIpnResponse InvalidAmount() => new VnPayIpnResponse { RspCode = "04", Message = "Invalid amount" };
        
        // Mã "97": Khi chữ ký (vnp_SecureHash) do VNPAY tạo ra không khớp với chữ ký hệ thống bạn tự tính toán (cảnh báo giả mạo)
        public static VnPayIpnResponse InvalidSignature() => new VnPayIpnResponse { RspCode = "97", Message = "Invalid signature" };
        
        // Mã "99": Dành cho các lỗi ngoại lệ không lường trước được của hệ thống (Exception)
        public static VnPayIpnResponse UnknownError() => new VnPayIpnResponse { RspCode = "99", Message = "Unknown error" };
    }
}
