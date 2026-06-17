using _66SMS.API.Abstractions;
using _66SMS.Application.Features.StaffSalons.Commands.CreateStaffSalon;
using _66SMS.Application.Features.StaffSalons.Commands.DeleteStaffSalon;
using _66SMS.Application.Features.StaffSalons.Commands.UpdateStaffSalon;
using _66SMS.Application.Features.StaffSalons.Queries.GetAllStaffSalons;
using _66SMS.Application.Features.StaffSalons.Queries.GetDetailStaffSalon;
using _66SMS.Contracts.Abstractions;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class StaffSalonsController : ApiController<StaffSalonsController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public StaffSalonsController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateStaffSalonCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateStaffSalonCommand command)
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
            DeleteStaffSalonCommand command = new DeleteStaffSalonCommand { Id = id };
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] GetAllStaffSalonsQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailStaffSalonQuery { Id = id });
            return HandleResult(result);
        }
    }
}
