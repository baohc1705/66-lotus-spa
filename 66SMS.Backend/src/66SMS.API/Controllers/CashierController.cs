using _66SMS.API.Abstractions;
using _66SMS.Application.BookingService.Cashier.Commands.PayAppointment;
using _66SMS.Application.BookingService.Cashier.Commands.UpdateAppointmentStatus;
using _66SMS.Application.BookingService.Cashier.Commands.VnPayIpn;
using _66SMS.Application.BookingService.Cashier.Commands.VnPayReturn;
using _66SMS.Application.BookingService.Cashier.Queries.GetCashierDaily;
using _66SMS.Application.BookingService.Cashier.Queries.GetCashierVnPayUrl;
using _66SMS.Application.BookingService.Cashier.Queries.GetOnlineAppointments;
using _66SMS.Contracts.Abstractions;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class CashierController : ApiController<CashierController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public CashierController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpGet("daily")]
        [Authorize]
        public async Task<IActionResult> GetDaily([FromQuery] DateOnly date, [FromQuery] DateOnly? endDate, [FromQuery] int? salonId)
        {
            var tokenSalonId = jwtService.GetSalonId();
            var finalSalonId = tokenSalonId ?? salonId;
            var query = new GetCashierDailyQuery { Date = date, EndDate = endDate, SalonId = finalSalonId };
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("weekly")]
        [Authorize]
        public async Task<IActionResult> GetWeekly([FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate, [FromQuery] int? salonId)
        {
            var tokenSalonId = jwtService.GetSalonId();
            var finalSalonId = tokenSalonId ?? salonId;
            var query = new GetCashierDailyQuery { Date = startDate, EndDate = endDate, SalonId = finalSalonId };
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("online-appointments")]
        [Authorize]
        public async Task<IActionResult> GetOnlineAppointments([FromQuery] int? salonId)
        {
            var tokenSalonId = jwtService.GetSalonId();
            var finalSalonId = tokenSalonId ?? salonId;
            var query = new GetOnlineAppointmentsQuery { SalonId = finalSalonId };
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpPut("appointments/{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateAppointmentStatus(int id, [FromBody] UpdateAppointmentStatusCommand request)
        {
            request.Id = id;
            request.UserId = jwtService.GetUserId();
            var result = await mediator.Send(request);
            return HandleResult(result);
        }

        [HttpPost("appointments/{id}/pay")]
        [Authorize]
        public async Task<IActionResult> PayAppointment(int id, [FromBody] PayAppointmentCommand request)
        {
            request.Id = id;
            request.UserId = jwtService.GetUserId();
            var result = await mediator.Send(request);
            return HandleResult(result);
        }

        [HttpGet("vnpay/create-url/{appointmentId}")]
        [Authorize]
        public async Task<IActionResult> CreateVnPayUrl(int appointmentId)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.MapToIPv4()?.ToString() ?? "127.0.0.1";
            if (string.IsNullOrEmpty(ipAddress) || ipAddress == "0.0.0.0") ipAddress = "127.0.0.1";
            var query = new GetCashierVnPayUrlQuery 
            { 
                AppointmentId = appointmentId, 
                IpAddress = ipAddress 
            };
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("vnpay-return")]
        [AllowAnonymous]
        public async Task<IActionResult> VnPayReturn()
        {
            var collections = HttpContext.Request.Query.ToDictionary(k => k.Key, v => v.Value.ToString());
            var command = new VnPayReturnCommand 
            { 
                QueryData = collections 
            };
            var result = await mediator.Send(command);
            
            // Redirect or return JSON based on requirement. 
            // Often VNPAY callback returns HTML or redirects. If JSON API:
            return HandleResult(result);
        }

        /// <summary>
        /// API Webhook nhận thông báo thanh toán (IPN) trực tiếp từ server VNPAY.
        /// API này không cần đăng nhập (AllowAnonymous) vì được gọi ngầm từ hệ thống VNPAY.
        /// </summary>
        [HttpGet("vnpay-ipn")]
        [AllowAnonymous]
        public async Task<IActionResult> VnPayIpn()
        {
            // Lấy toàn bộ các tham số (query string) mà VNPAY gắn lên URL và chuyển thành Dictionary
            var collections = HttpContext.Request.Query.ToDictionary(k => k.Key, v => v.Value.ToString());
            
            // Đóng gói dữ liệu vào Command để đưa xuống Handler xử lý logic
            var command = new VnPayIpnCommand 
            { 
                QueryData = collections 
            };
            
            // Gửi qua thư viện MediatR để chạy VnPayIpnHandler.cs
            var result = await mediator.Send(command);
            
            // ĐIỂM ĐẶC BIỆT LƯU Ý KHI LÀM IPN:
            // Hàm trả về (return) tuyệt đối không dùng HandleResult() vì HandleResult sẽ bọc data trong object { "success": true, "data": ... }
            // VNPAY chỉ đọc được định dạng JSON thuần khiết của nó: { "RspCode": "00", "Message": "Confirm Success" }.
            // Do đó phải dùng Ok(result) để serialize trực tiếp object VnPayIpnResponse ra JSON.
            return Ok(result);
        }
    }
}
