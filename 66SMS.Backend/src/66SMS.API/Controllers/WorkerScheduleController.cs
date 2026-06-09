
using _66SMS.API.Abstractions;
using _66SMS.Application.Features.WorkSchedules.Commands.CreateWorkSchedule;
using _66SMS.Contracts.Shared;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class WorkerScheduleController : ApiController<WorkerScheduleController>
    {
        private readonly IMediator mediator;

        public WorkerScheduleController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpPost]
        //[PermissionAuthorize("workschedule", "create")]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateWorkScheduleCommand command)
        {
            Result<object> result = await mediator.Send(command);
            return HandleResult(result);
        }
    }
}
