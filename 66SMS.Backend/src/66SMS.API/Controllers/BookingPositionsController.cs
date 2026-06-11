using _66SMS.API.Abstractions;
using _66SMS.Application.Features.BookingPositions.Commands.CreateBookingPositions;
using _66SMS.Application.Features.BookingPositions.Commands.DeleteBookingPositions;
using _66SMS.Application.Features.BookingPositions.Commands.UpdateBookingPositions;
using _66SMS.Application.Features.BookingPositions.Queries.GetAllBookingPositions;
using _66SMS.Application.Features.BookingPositions.Queries.GetDetailBookingPositions;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
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
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateBookingPositionCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateBookingPositionCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await mediator.Send(new DeleteBookingPositionCommand { Id = id });
            return HandleResult(result);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] GetAllBookingPositionQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailBookingPositionQuery { Id = id });
            return HandleResult(result);
        }
    }
}
