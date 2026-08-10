using _66SMS.API.Abstractions;
using _66SMS.Application.BookingService.ConfigAppointments.Commands.CreateConfigAppointment;
using _66SMS.Application.BookingService.ConfigAppointments.Commands.DeleteConfigAppointment;
using _66SMS.Application.BookingService.ConfigAppointments.Commands.UpdateConfigAppointment;
using _66SMS.Application.BookingService.ConfigAppointments.Queries.GetAllConfigAppointments;
using _66SMS.Application.BookingService.ConfigAppointments.Queries.GetConfigAppointmentBySalon;
using _66SMS.Application.BookingService.ConfigAppointments.Queries.GetDetailConfigAppointment;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class ConfigAppointmentsController : ApiController<ConfigAppointmentsController>
    {
        private readonly IMediator mediator;

        public ConfigAppointmentsController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpGet]
        [PermissionAuthorize("config-appointments", "read")]
        public async Task<IActionResult> GetAll([FromQuery] GetAllConfigAppointmentsQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("by-salon/{salonId:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBySalon(int salonId)
        {
            var result = await mediator.Send(new GetConfigAppointmentBySalonQuery { SalonId = salonId });
            return HandleResult(result);
        }

        [HttpGet("{id:int}")]
        [PermissionAuthorize("config-appointments", "read")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await mediator.Send(new GetDetailConfigAppointmentQuery(id));
            return HandleResult(result);
        }

        [HttpPost]
        [PermissionAuthorize("config-appointments", "create")]
        public async Task<IActionResult> Create([FromBody] CreateConfigAppointmentCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [PermissionAuthorize("config-appointments", "update")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateConfigAppointmentCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [PermissionAuthorize("config-appointments", "delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await mediator.Send(new DeleteConfigAppointmentCommand(id));
            return HandleResult(result);
        }
    }
}
