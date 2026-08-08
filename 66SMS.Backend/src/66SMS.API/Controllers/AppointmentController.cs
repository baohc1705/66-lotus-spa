using _66SMS.API.Abstractions;
using _66SMS.Application.BookingService.Appointments.Commands.CreateAppointment;
using _66SMS.Application.BookingService.Appointments.Commands.CreateSlotLock;
using _66SMS.Application.BookingService.Appointments.Commands.PayDepositWithWallet;
using _66SMS.Application.BookingService.Appointments.Commands.PostponeAppointment;
using _66SMS.Application.BookingService.Appointments.Queries.GetAllAppointment;
using _66SMS.Application.BookingService.Appointments.Queries.GetAvailableBookingDays;
using _66SMS.Application.BookingService.Appointments.Queries.GetDepositVnPayUrl;
using _66SMS.Application.BookingService.Appointments.Queries.GetDetailAppointment;
using _66SMS.Application.BookingService.Appointments.Queries.GetTechnicians;
using _66SMS.Application.BookingService.Appointments.Queries.GetTimeSlots;
using _66SMS.Contract.Abstractions;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class AppointmentController : ApiController<AppointmentController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;
        private readonly IClientIpService clientIpService;

        public AppointmentController(IMediator mediator, IJwtService jwtService, IClientIpService clientIpService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
            this.clientIpService = clientIpService;
        }

        [HttpGet("available-days")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAvailableBookingDays([FromQuery] GetAvailableBookingDaysQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("technicians")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTechnicians([FromQuery] GetTechniciansQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("time-slots")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTimeSlots([FromQuery] GetTimeSlotsQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpPost("lock")]
        [Authorize]
        public async Task<IActionResult> CreateSlotLock([FromBody] CreateSlotLockCommand command)
        {
            command.LockedByUserId = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentCommand command)
        {
            command.CreatedByUserId = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMyAppointment()
        {
            var result = await mediator.Send(new GetAllAppointmentQuery
            {
                UserId = jwtService.GetUserId()
            });
            return HandleResult(result);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllAppointment([FromQuery] GetAllAppointmentQuery query)
        {
            var tokenSalonId = jwtService.GetSalonId();
            if (tokenSalonId.HasValue)
                query.SalonId = tokenSalonId.Value;
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<IActionResult> GetDetailAppointment([FromRoute] int id)
        {
            var result = await mediator.Send(new GetDetailAppointmentQuery { Id = id });
            return HandleResult(result);
        }

        [HttpGet("{appointmentId}/deposit-vnpay-url")]
        [Authorize]
        public async Task<IActionResult> GetDepositVnPayUrl([FromRoute] GetDepositVnPayUrlQuery query)
        {
            query.IpAddress = clientIpService.GetClientIpAddress();
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpPost("{appointmentId}/pay-deposit-wallet")]
        [Authorize]
        public async Task<IActionResult> PayDepositWithWallet([FromRoute] PayDepositWithWalletCommand command)
        {
            command.UserId = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPost("{appointmentId}/postpone")]
        [Authorize]
        public async Task<IActionResult> PostponeAppointment([FromRoute] PostponeAppointmentCommand command)
        {
            command.UserId = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }
    }
}
