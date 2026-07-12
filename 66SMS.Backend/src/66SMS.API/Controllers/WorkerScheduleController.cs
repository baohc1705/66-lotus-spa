
using _66SMS.API.Abstractions;
using _66SMS.Application.BookingService.WorkSchedules.Commands.CreateWorkSchedule;
using _66SMS.Application.BookingService.WorkSchedules.Commands.DeleteWorkSchedule;
using _66SMS.Application.BookingService.WorkSchedules.Commands.UpdateWorkSchedule;
using _66SMS.Application.BookingService.WorkSchedules.Queries.GetAllWorkSchedule;
using _66SMS.Application.BookingService.WorkSchedules.Queries.GetDetailWorkSchedule;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
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
        private readonly IJwtService jwtService;

        public WorkerScheduleController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost]
        //[PermissionAuthorize("workschedule", "create")]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateWorkScheduleCommand command)
        {
            var tokenSalonId = jwtService.GetSalonId();
            if (tokenSalonId.HasValue && !command.SalonId.HasValue)
                command.SalonId = tokenSalonId.Value;

            command.CreatedBy = jwtService.GetUserId();
            Result<object> result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPost("bulk")]
        [AllowAnonymous]
        public async Task<IActionResult> BulkCreate([FromBody] _66SMS.Application.BookingService.WorkSchedules.Commands.BulkCreateWorkSchedule.BulkCreateWorkScheduleCommand command)
        {
            var tokenSalonId = jwtService.GetSalonId();
            if (tokenSalonId.HasValue && command.Schedules != null)
            {
                foreach (var s in command.Schedules)
                {
                    if (!s.SalonId.HasValue)
                        s.SalonId = tokenSalonId.Value;
                }
            }

            command.CreatedBy = jwtService.GetUserId();
            Result<object> result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id:int}")]
        //[PermissionAuthorize("workschedule", "create")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateWorkScheduleCommand command)
        {
            command.Id = id;
            var tokenSalonId = jwtService.GetSalonId();
            if (tokenSalonId.HasValue && !command.SalonId.HasValue)
                command.SalonId = tokenSalonId.Value;

            command.UpdatedBy = jwtService.GetUserId();
            Result<object> result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id:int}")]
        //[PermissionAuthorize("workschedule", "create")]
        [AllowAnonymous]
        public async Task<IActionResult> Delete(int id)
        {
            var command = new DeleteWorkScheduleCommand { Id = id };
            command.UpdatedBy = jwtService.GetUserId();
            Result<object> result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] GetAllWorkScheduleQuery query)
        {
            var tokenSalonId = jwtService.GetSalonId();
            if (tokenSalonId.HasValue)
                query.SalonId = tokenSalonId.Value;
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
