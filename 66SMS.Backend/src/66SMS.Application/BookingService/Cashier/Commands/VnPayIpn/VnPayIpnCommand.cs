using MediatR;

namespace _66SMS.Application.BookingService.Cashier.Commands.VnPayIpn
{
   
    public class VnPayIpnCommand : IRequest<VnPayIpnResponse>
    {
        public IDictionary<string, string> QueryData { get; set; } = new Dictionary<string, string>();
    }

    
    public class VnPayIpnResponse
    {
        public string RspCode { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public static VnPayIpnResponse Success() => new VnPayIpnResponse { RspCode = "00", Message = "Confirm Success" };
        public static VnPayIpnResponse OrderNotFound() => new VnPayIpnResponse { RspCode = "01", Message = "Order not found" };
        public static VnPayIpnResponse OrderAlreadyConfirmed() => new VnPayIpnResponse { RspCode = "02", Message = "Order already confirmed" };
        public static VnPayIpnResponse InvalidAmount() => new VnPayIpnResponse { RspCode = "04", Message = "Invalid amount" };
        public static VnPayIpnResponse InvalidOrder() => new VnPayIpnResponse { RspCode = "04", Message = "Invalid order" };
        public static VnPayIpnResponse InvalidSignature() => new VnPayIpnResponse { RspCode = "97", Message = "Invalid signature" };
        public static VnPayIpnResponse UnknownError() => new VnPayIpnResponse { RspCode = "99", Message = "Unknown error" };
    }
}
