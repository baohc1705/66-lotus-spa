using _66SMS.API.Abstractions;
using _66SMS.Application.Features.BookingRooms.Commands.CreateBookingRooms;
using _66SMS.Application.Features.BookingRooms.Commands.DeleteBookingRooms;
using _66SMS.Application.Features.BookingRooms.Commands.UpdateBookingRooms;
using _66SMS.Application.Features.BookingRooms.Queries.GetAllBookingRooms;
using _66SMS.Application.Features.BookingRooms.Queries.GetDetailBookingRooms;
using _66SMS.Contracts.Abstractions;
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
        private readonly IJwtService jwtService;

        public BookingRoomsController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateBookingRoomCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateBookingRoomCommand command)
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
            var command = new DeleteBookingRoomCommand { Id = id };
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] GetAllBookingRoomQuery query)
        {
            var tokenSalonId = jwtService.GetClaim<int?>("salon_id");
            if (tokenSalonId.HasValue)
                query.SalonId = tokenSalonId.Value;
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
