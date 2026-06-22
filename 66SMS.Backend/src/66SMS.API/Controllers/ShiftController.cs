using _66SMS.API.Abstractions;
using _66SMS.Application.BookingService.Shifts.Commands.CreateShift;
using _66SMS.Application.BookingService.Shifts.Commands.CreateShiftPeriod;
using _66SMS.Application.BookingService.Shifts.Commands.DeleteShift;
using _66SMS.Application.BookingService.Shifts.Commands.UpdateShift;
using _66SMS.Application.BookingService.Shifts.Queries.GetAllShift;
using _66SMS.Application.DTOs.Shifts;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class ShiftController : ApiController<ShiftController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public ShiftController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost]
        [PermissionAuthorize("shifts", "create")]
        public async Task<IActionResult> CreateShift([FromBody]CreateShiftCommand command)
        {
            Result<object> result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPost("{shiftId:int}/periods")]
        [PermissionAuthorize("shifts", "create")]
        public async Task<IActionResult> CreateShiftPeriod([FromRoute] int shiftId, [FromBody] CreateShiftPeriodCommand command)
        {
            command.ShiftId = shiftId;
            command.CreatedBy = jwtService.GetUserId();
            Result<object> result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id:int}")]
        [PermissionAuthorize("shifts", "delete")]
        public async Task<IActionResult> DeleteShift([FromRoute] int id)
        {
            Result<object> result = await mediator.Send(new DeleteShiftCommand { Id = id });
            return HandleResult(result);
        }

        [HttpPatch("{id:int}")]
        [PermissionAuthorize("shifts", "update")]
        public async Task<IActionResult> UpdateShift([FromRoute] int id, [FromBody] UpdateShiftCommand command)
        {
            command.Id = id;
            Result<object> result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet]
        [PermissionAuthorize("shifts", "read")]
        public async Task<IActionResult> GetAllShift([FromQuery] GetAllShiftQuery query)
        {
            Result<PagedResult<ShiftDTO>> result = await mediator.Send(query);
            return HandleResult(result);
        }
    }
}
