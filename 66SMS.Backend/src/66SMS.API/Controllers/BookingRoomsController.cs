using _66SMS.API.Abstractions;
using _66SMS.Application.BookingService.BookingRooms.Commands.CreateBookingRooms;
using _66SMS.Application.BookingService.BookingRooms.Commands.DeleteBookingRooms;
using _66SMS.Application.BookingService.BookingRooms.Commands.UpdateBookingRooms;
using _66SMS.Application.BookingService.BookingRooms.Queries.GetAllBookingRooms;
using _66SMS.Application.BookingService.BookingRooms.Queries.GetDetailBookingRooms;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
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
        [PermissionAuthorize("positions", "create")]
        public async Task<IActionResult> Create([FromBody] CreateBookingRoomCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
       [PermissionAuthorize("positions", "update")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateBookingRoomCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [PermissionAuthorize("positions", "delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var command = new DeleteBookingRoomCommand { Id = id };
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet]
        [PermissionAuthorize("positions", "read")]
        public async Task<IActionResult> GetAll([FromQuery] GetAllBookingRoomQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [PermissionAuthorize("positions", "read")]    
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailBookingRoomQuery { Id = id });
            return HandleResult(result);
        }
    }
}
