using _66SMS.API.Abstractions;
using _66SMS.Application.BookingService.Cashier.Commands.AssignAppointmentPosition;
using _66SMS.Application.BookingService.Cashier.Commands.AssignAppointmentStaff;
using _66SMS.Application.BookingService.Cashier.Commands.CreateCashierAppointment;
using _66SMS.Application.BookingService.Cashier.Commands.PayAppointment;
using _66SMS.Application.BookingService.Cashier.Commands.UpdateAppointmentStatus;
using _66SMS.Application.BookingService.Cashier.Commands.VnPayIpn;
using _66SMS.Application.BookingService.Cashier.Commands.VnPayReturn;
using _66SMS.Application.BookingService.Cashier.Queries.GetCashierDaily;
using _66SMS.Application.BookingService.Cashier.Queries.GetCashierPositions;
using _66SMS.Application.BookingService.Cashier.Queries.GetCashierVnPayUrl;
using _66SMS.Application.BookingService.Cashier.Queries.GetOnlineAppointments;
using _66SMS.Application.BookingService.Cashier.Queries.GetStaffAvailability;
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
        private readonly IClientIpService clientIpService;

        public CashierController(IMediator mediator, IJwtService jwtService, IClientIpService clientIpService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
            this.clientIpService = clientIpService;
        }

        [HttpGet("daily")]
        [Authorize]
        public async Task<IActionResult> GetDaily([FromQuery] GetCashierDailyQuery query)
        {
            query.SalonId = jwtService.GetSalonId() ?? query.SalonId;
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("weekly")]
        [Authorize]
        public async Task<IActionResult> GetWeekly([FromQuery] GetCashierDailyQuery query)
        {
            query.SalonId = jwtService.GetSalonId() ?? query.SalonId;
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("online-appointments")]
        [Authorize]
        public async Task<IActionResult> GetOnlineAppointments([FromQuery] GetOnlineAppointmentsQuery query)
        {
            query.SalonId = jwtService.GetSalonId() ?? query.SalonId;
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

        [HttpPut("appointments/{appointmentId}/position/{positionId}")]
        [Authorize]
        public async Task<IActionResult> AssignAppointmentPosition(int appointmentId, int positionId)
        {
            var command = new AssignAppointmentPositionCommand
            {
                AppointmentId = appointmentId,
                PositionId = positionId,
                UserId = jwtService.GetUserId()
            };
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPut("appointments/{appointmentId}/staff/{staffId}")]
        [Authorize]
        public async Task<IActionResult> AssignAppointmentStaff(int appointmentId, int staffId)
        {
            var command = new AssignAppointmentStaffCommand
            {
                AppointmentId = appointmentId,
                StaffId = staffId,
                UserId = jwtService.GetUserId()
            };
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet("positions")]
        [Authorize]
        public async Task<IActionResult> GetPositions([FromQuery] GetCashierPositionsQuery query)
        {
            query.SalonId = jwtService.GetSalonId() ?? query.SalonId;
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpPut("appointments/{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateAppointmentStatus(
            [FromRoute] int id,
            [FromBody] UpdateAppointmentStatusCommand command)
        {
            command.Id = id;
            command.UserId = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPost("appointments/{id}/pay")]
        [Authorize]
        public async Task<IActionResult> PayAppointment(
            [FromRoute] int id,
            [FromBody] PayAppointmentCommand command)
        {
            command.Id = id;
            command.UserId = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet("vnpay/create-url/{appointmentId}")]
        [Authorize]
        public async Task<IActionResult> CreateVnPayUrl(int appointmentId)
        {
            var query = new GetCashierVnPayUrlQuery
            {
                AppointmentId = appointmentId,
                IpAddress = clientIpService.GetClientIpAddress()
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

        [HttpGet("staff-availability")]
        [Authorize]
        public async Task<IActionResult> GetStaffAvailability([FromQuery] GetStaffAvailabilityQuery query)
        {
            query.SalonId = jwtService.GetSalonId() ?? query.SalonId;
            var result = await mediator.Send(query);
            return HandleResult(result);
        }
    }
}
