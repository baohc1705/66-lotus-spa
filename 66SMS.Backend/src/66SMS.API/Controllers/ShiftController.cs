using _66SMS.API.Abstractions;
using _66SMS.Application.Features.Shitfs.Commands.CreateShift;
using _66SMS.Application.Features.Shitfs.Commands.CreateShiftPeriod;
using _66SMS.Application.Features.Shitfs.Commands.DeleteShift;
using _66SMS.Application.Features.Shitfs.Commands.UpdateShift;
using _66SMS.Application.Features.Shitfs.Queries.GetAllShift;
using _66SMS.Application.DTOs.Shifts;
using _66SMS.Contracts.Shared;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class ShiftController : ApiController<ShiftController>
    {
        private readonly IMediator mediator;

        public ShiftController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> CreateShift([FromBody]CreateShiftCommand command)
        {
            Result<object> result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPost("{shiftId:int}/periods")]
        [AllowAnonymous]
        public async Task<IActionResult> CreateShiftPeriod([FromRoute] int shiftId, [FromBody] CreateShiftPeriodCommand command)
        {
            command.ShiftId = shiftId;
            Result<object> result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> DeleteShift([FromRoute] int id)
        {
            Result<object> result = await mediator.Send(new DeleteShiftCommand { Id = id });
            return HandleResult(result);
        }

        [HttpPatch("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> UpdateShift([FromRoute] int id, [FromBody] UpdateShiftCommand command)
        {
            command.Id = id;
            Result<object> result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllShift([FromQuery] GetAllShiftQuery query)
        {
            Result<PagedResult<ShiftDTO>> result = await mediator.Send(query);
            return HandleResult(result);
        }
    }
}
