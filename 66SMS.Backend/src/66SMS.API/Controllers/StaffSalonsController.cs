using _66SMS.API.Abstractions;
using _66SMS.Application.SalonService.StaffSalons.Commands.CreateStaffSalon;
using _66SMS.Application.SalonService.StaffSalons.Commands.DeleteStaffSalon;
using _66SMS.Application.SalonService.StaffSalons.Commands.UpdateManagerStatus;
using _66SMS.Application.SalonService.StaffSalons.Commands.UpdateStaffSalon;
using _66SMS.Application.SalonService.StaffSalons.Queries.GetAllStaffSalons;
using _66SMS.Application.SalonService.StaffSalons.Queries.GetDetailStaffSalon;
using _66SMS.Contracts.Abstractions;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
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
        [PermissionAuthorize("staffs", "create")]
        public async Task<IActionResult> Create([FromBody] CreateStaffSalonCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [PermissionAuthorize("staffs", "update")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateStaffSalonCommand command)
        {
            command.Id = id;
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [PermissionAuthorize("staffs", "delete")]
        public async Task<IActionResult> Delete(int id)
        {
            DeleteStaffSalonCommand command = new DeleteStaffSalonCommand { Id = id };
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet]
        [PermissionAuthorize("staffs", "read")]
        public async Task<IActionResult> GetAll([FromQuery] GetAllStaffSalonsQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [PermissionAuthorize("staffs", "read")]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailStaffSalonQuery { Id = id });
            return HandleResult(result);
        }

        [HttpGet("staff/{staffId:int}")]
        [PermissionAuthorize("staffs", "read")]
        public async Task<IActionResult> GetDetailByStaffId(int staffId)
        {
            var result = await mediator.Send(new GetDetailStaffSalonQuery { StaffId = staffId });
            return HandleResult(result);
        }

        [HttpPost("assign-manager")]
        [PermissionAuthorize("staffs", "create")]
        public async Task<IActionResult> AssignManager([FromBody] UpdateManagerStatusCommand command)
        {
            command.IsAssign = true;
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPost("remove-manager")]
        [PermissionAuthorize("staffs", "update")]
        public async Task<IActionResult> RemoveManager([FromBody] UpdateManagerStatusCommand command)
        {
            command.IsAssign = false;
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }
    }
}
