using _66SMS.API.Abstractions;
using _66SMS.Application.Features.Staffs.Commands.CreateStaff;
using _66SMS.Application.Features.Staffs.Commands.DeleteStaff;
using _66SMS.Application.Features.Staffs.Commands.UpdateStaff;
using _66SMS.Application.Features.Staffs.Queries.GetAllStaffs;
using _66SMS.Application.Features.Staffs.Queries.GetDetailStaff;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class StaffsController : ApiController<StaffsController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public StaffsController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost]
        [PermissionAuthorize("staffs", "create", Roles = "admin")]
        public async Task<IActionResult> CreateStaff([FromBody] CreateStaffCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [PermissionAuthorize("staffs", "delete", Roles = "admin")]
        public async Task<IActionResult> DeleteStaff(int id)
        {
            var command = new DeleteStaffCommand { Id = id };
            command.UpdatedBy = jwtService.GetUserId();
            Result<object> result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [PermissionAuthorize("staffs", "update")]
        public async Task<IActionResult> UpdateStaff(int id, [FromBody] UpdateStaffCommand command)
        {
            command.Id = id;
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet]
        [PermissionAuthorize("staffs", "read", Roles = "admin")]
        public async Task<IActionResult> GetAll([FromQuery] GetAllStaffQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [PermissionAuthorize("staffs", "read")]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailStaffQuery { Id = id });
            return HandleResult(result);
        }
    }
}
