using _66SMS.API.Abstractions;
using _66SMS.Application.BookingService.Cashier.Commands.AssignAppointmentPosition;
using _66SMS.Application.BookingService.Cashier.Commands.AssignAppointmentStaff;
using _66SMS.Application.BookingService.Cashier.Commands.CreateCashierAppointment;
using _66SMS.Application.BookingService.Cashier.Commands.PayAppointment;
using _66SMS.Application.BookingService.Cashier.Commands.UpdateAppointmentStatus;
using _66SMS.Application.BookingService.Cashier.Commands.VnPayIpn;
using _66SMS.Application.BookingService.Cashier.Commands.VnPayReturn;
using _66SMS.Application.BookingService.Cashier.Queries.GetCashierPositions;
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

      
        [HttpPost("appointments")]
        [Authorize]
        public async Task<IActionResult> CreateCashierAppointment([FromBody] CreateCashierAppointmentCommand command)
        {
            command.ActorUserId = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPut("appointments/{id}/position")]
        [Authorize]
        public async Task<IActionResult> AssignAppointmentPosition(int id, [FromBody] AssignAppointmentPositionCommand request)
        {
            request.AppointmentId = id;
            request.UserId = jwtService.GetUserId();
            var result = await mediator.Send(request);
            return HandleResult(result);
        }

        [HttpPut("appointments/{id}/staff")]
        [Authorize]
        public async Task<IActionResult> AssignAppointmentStaff(int id, [FromBody] AssignAppointmentStaffCommand request)
        {
            request.AppointmentId = id;
            request.UserId = jwtService.GetUserId();
            var result = await mediator.Send(request);
            return HandleResult(result);
        }

        [HttpGet("positions")]
        [Authorize]
        public async Task<IActionResult> GetPositions([FromQuery] int? salonId, [FromQuery] DateOnly? date)
        {
            var tokenSalonId = jwtService.GetSalonId();
            var finalSalonId = tokenSalonId ?? salonId;
            var query = new GetCashierPositionsQuery { SalonId = finalSalonId, Date = date };
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
            var collections = HttpContext.Request.Query.ToDictionary(k => k.Key, v => v.Value.ToString());
           
            var command = new VnPayIpnCommand 
            { 
                QueryData = collections 
            };
            var result = await mediator.Send(command);
            return Ok(result);
        }
    }
}
