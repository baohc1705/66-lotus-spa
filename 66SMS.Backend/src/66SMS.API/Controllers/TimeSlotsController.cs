using _66SMS.API.Abstractions;
using _66SMS.Application.BookingService.TimeSlots.Commands.CreateTimeSlot;
using _66SMS.Application.BookingService.TimeSlots.Commands.DeleteTimeSlot;
using _66SMS.Application.BookingService.TimeSlots.Commands.UpdateTimeSlot;
using _66SMS.Application.BookingService.TimeSlots.Queries.GetAllTimeSlot;
using _66SMS.Application.BookingService.TimeSlots.Queries.GetDetailTimeSlot;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class TimeSlotsController : ApiController<TimeSlotsController>
    {
        private readonly IMediator mediator;

        public TimeSlotsController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] GetAllTimeSlotQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await mediator.Send(new GetDetailTimeSlotQuery(id));
            return HandleResult(result);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateTimeSlotCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTimeSlotCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await mediator.Send(new DeleteTimeSlotCommand(id));
            return HandleResult(result);
        }
    }
}
