using _66SMS.API.Abstractions;
using _66SMS.Application.Features.BookingRooms.Commands.CreateBookingRooms;
using _66SMS.Application.Features.BookingRooms.Commands.DeleteBookingRooms;
using _66SMS.Application.Features.BookingRooms.Commands.UpdateBookingRooms;
using _66SMS.Application.Features.BookingRooms.Queries.GetAllBookingRooms;
using _66SMS.Application.Features.BookingRooms.Queries.GetDetailBookingRooms;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class BookingRoomsController : ApiController<BookingRoomsController>
    {
        private readonly IMediator mediator;

        public BookingRoomsController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateBookingRoomCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateBookingRoomCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await mediator.Send(new DeleteBookingRoomCommand { Id = id });
            return HandleResult(result);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] GetAllBookingRoomQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailBookingRoomQuery { Id = id });
            return HandleResult(result);
        }
    }
}
