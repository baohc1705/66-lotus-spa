using _66SMS.API.Abstractions;
using _66SMS.Application.BookingService.BookingPositions.Commands.CreateBookingPositions;
using _66SMS.Application.BookingService.BookingPositions.Commands.DeleteBookingPositions;
using _66SMS.Application.BookingService.BookingPositions.Commands.UpdateBookingPositions;
using _66SMS.Application.BookingService.BookingPositions.Queries.GetAllBookingPositions;
using _66SMS.Application.BookingService.BookingPositions.Queries.GetDetailBookingPositions;
using _66SMS.Contracts.Abstractions;
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
        private readonly IJwtService jwtService;

        public BookingPositionsController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateBookingPositionCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateBookingPositionCommand command)
        {
            command.Id = id;
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Delete(int id)
        {
            var command = new DeleteBookingPositionCommand { Id = id };
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
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
