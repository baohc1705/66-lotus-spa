using _66SMS.API.Abstractions;
using _66SMS.Application.SalonService.Attendances.Commands.CheckIn;
using _66SMS.Application.SalonService.Attendances.Commands.CheckOut;
using _66SMS.Application.SalonService.Attendances.Commands.CreateManualAttendance;
using _66SMS.Application.SalonService.Attendances.Commands.UpdateAttendance;
using _66SMS.Application.SalonService.Attendances.Queries.GetAllAttendances;
using _66SMS.Application.SalonService.Attendances.Queries.GetDetailAttendance;
using _66SMS.Contracts.Abstractions;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class AttendanceController : ApiController<AttendanceController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public AttendanceController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost("check-in")]
        [PermissionAuthorize("attendances", "create")]
        public async Task<IActionResult> CheckIn([FromBody] CheckInCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();

            var tokenSalonId = jwtService.GetClaim<int?>("salon_id");
            if (tokenSalonId.HasValue)
                command.SalonId = tokenSalonId.Value;

            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPost("check-out")]
        [PermissionAuthorize("attendances", "update")]
        public async Task<IActionResult> CheckOut([FromBody] CheckOutCommand command)
        {
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPost("manual")]
        [PermissionAuthorize("attendances", "create")]
        public async Task<IActionResult> CreateManual([FromBody] CreateManualAttendanceCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();

            var tokenSalonId = jwtService.GetClaim<int?>("salon_id");
            if (tokenSalonId.HasValue)
                command.SalonId = tokenSalonId.Value;

            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPut("{id}")]
        [PermissionAuthorize("attendances", "update")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAttendanceCommand command)
        {
            command.Id = id;
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet("admin")]
        [PermissionAuthorize("attendances", "read")]
        public async Task<IActionResult> AdminGetAll([FromQuery] GetAllAttendancesQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [PermissionAuthorize("attendances", "read")]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailAttendanceQuery { Id = id });
            return HandleResult(result);
        }
    }
}
