using _66SMS.API.Abstractions;
using _66SMS.Application.Features.Cashier.Queries.GetCashierDaily;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class CashierController : ApiController<CashierController>
    {
        private readonly IMediator mediator;

        public CashierController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpGet("daily")]
        [Authorize]
        public async Task<IActionResult> GetDaily([FromQuery] DateOnly date)
        {
            var query = new GetCashierDailyQuery { Date = date };
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("online-appointments")]
        [Authorize]
        public async Task<IActionResult> GetOnlineAppointments()
        {
            var query = new _66SMS.Application.Features.Cashier.Queries.GetOnlineAppointments.GetOnlineAppointmentsQuery();
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpPut("appointments/{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateAppointmentStatus(int id, [FromBody] _66SMS.Application.Features.Cashier.Commands.UpdateAppointmentStatus.UpdateAppointmentStatusCommand request)
        {
            request.Id = id;
            var result = await mediator.Send(request);
            return HandleResult(result);
        }

        [HttpPost("appointments/{id}/pay")]
        [Authorize]
        public async Task<IActionResult> PayAppointment(int id, [FromBody] _66SMS.Application.Features.Cashier.Commands.PayAppointment.PayAppointmentCommand request)
        {
            request.Id = id;
            var result = await mediator.Send(request);
            return HandleResult(result);
        }

        [HttpGet("vnpay/create-url/{appointmentId}")]
        [Authorize]
        public async Task<IActionResult> CreateVnPayUrl(int appointmentId)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.MapToIPv4()?.ToString() ?? "127.0.0.1";
            if (string.IsNullOrEmpty(ipAddress) || ipAddress == "0.0.0.0") ipAddress = "127.0.0.1";
            var query = new _66SMS.Application.Features.Cashier.Queries.GetCashierVnPayUrl.GetCashierVnPayUrlQuery 
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
            var command = new _66SMS.Application.Features.Cashier.Commands.VnPayReturn.VnPayReturnCommand 
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
            var command = new _66SMS.Application.Features.Cashier.Commands.VnPayIpn.VnPayIpnCommand 
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
