using _66SMS.API.Abstractions;
using _66SMS.Application.SalonService.Payrolls.Commands.ConfirmPayroll;
using _66SMS.Application.SalonService.Payrolls.Commands.GeneratePayroll;
using _66SMS.Application.SalonService.Payrolls.Commands.UpdatePayroll;
using _66SMS.Application.SalonService.Payrolls.Queries.GetAllPayrolls;
using _66SMS.Application.SalonService.Payrolls.Queries.GetDetailPayroll;
using _66SMS.Application.SalonService.Payrolls.Queries.GetPayrollCommissionStats;
using _66SMS.Contracts.Abstractions;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class PayrollController : ApiController<PayrollController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public PayrollController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost("generate")]
        [PermissionAuthorize("payrolls", "create")]
        public async Task<IActionResult> Generate([FromBody] GeneratePayrollCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPost("{id}/confirm")]
        [PermissionAuthorize("payrolls", "update")]
        public async Task<IActionResult> Confirm(int id)
        {
            var command = new ConfirmPayrollCommand { Id = id, UpdatedBy = jwtService.GetUserId() };
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPut("{id}")]
        [PermissionAuthorize("payrolls", "update")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePayrollCommand command)
        {
            command.Id = id;
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet("admin")]
        [PermissionAuthorize("payrolls", "read")]
        public async Task<IActionResult> AdminGetAll([FromQuery] GetAllPayrollsQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("stats")]
        [PermissionAuthorize("payrolls", "read")]
        public async Task<IActionResult> GetCommissionStats(
            [FromQuery] int? staffId,
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to,
            CancellationToken cancellationToken)
        {
            var profile = jwtService.GetProfile();
            var isAdmin = profile?.Roles.Any(r =>
                string.Equals(r, "Admin", StringComparison.OrdinalIgnoreCase)) == true;

            var result = await mediator.Send(new GetPayrollCommissionStatsQuery
            {
                StaffId = staffId,
                FromDate = from,
                ToDate = to,
                UserId = jwtService.GetUserId(),
                IsAdmin = isAdmin,
            }, cancellationToken);

            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [PermissionAuthorize("payrolls", "read")]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailPayrollQuery { Id = id });
            return HandleResult(result);
        }
    }
}
