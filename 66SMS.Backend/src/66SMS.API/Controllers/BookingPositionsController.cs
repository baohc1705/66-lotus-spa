using _66SMS.API.Abstractions;
using _66SMS.Application.BookingService.BookingPositions.Commands.CreateBookingPositions;
using _66SMS.Application.BookingService.BookingPositions.Commands.DeleteBookingPositions;
using _66SMS.Application.BookingService.BookingPositions.Commands.UpdateBookingPositions;
using _66SMS.Application.BookingService.BookingPositions.Queries.GetAllBookingPositions;
using _66SMS.Application.BookingService.BookingPositions.Queries.GetDetailBookingPositions;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class BookingPositionsController : ApiController<BookingPositionsController>
    {
        private readonly IMediator mediator;

        public BookingPositionsController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpPost]
        [PermissionAuthorize("positions", "create")]
        public async Task<IActionResult> Create([FromBody] CreateBookingPositionCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [PermissionAuthorize("positions", "update")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateBookingPositionCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [PermissionAuthorize("positions", "delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var command = new DeleteBookingPositionCommand { Id = id };
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet]
        [PermissionAuthorize("positions", "read")]
        public async Task<IActionResult> GetAll([FromQuery] GetAllBookingPositionQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [PermissionAuthorize("positions", "read")]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailBookingPositionQuery { Id = id });
            return HandleResult(result);
        }
    }
}
