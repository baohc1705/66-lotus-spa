
using _66SMS.API.Abstractions;
using _66SMS.Application.Features.WorkSchedules.Commands.CreateWorkSchedule;
using _66SMS.Application.Features.WorkSchedules.Commands.DeleteWorkSchedule;
using _66SMS.Application.Features.WorkSchedules.Commands.UpdateWorkSchedule;
using _66SMS.Application.Features.WorkSchedules.Queries.GetAllWorkSchedule;
using _66SMS.Application.Features.WorkSchedules.Queries.GetDetailWorkSchedule;
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

        [HttpPatch("{id:int}")]
        //[PermissionAuthorize("workschedule", "create")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateWorkScheduleCommand command)
        {
            command.Id = id;
            Result<object> result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id:int}")]
        //[PermissionAuthorize("workschedule", "create")]
        [AllowAnonymous]
        public async Task<IActionResult> Create(int id)
        {
            Result<object> result = await mediator.Send(new DeleteWorkScheduleCommand { Id = id});
            return HandleResult(result);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] GetAllWorkScheduleQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailWorkScheduleQuery { Id = id });
            return HandleResult(result);
        }

        
    }
}
