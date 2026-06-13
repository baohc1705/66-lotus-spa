using _66SMS.API.Abstractions;
using _66SMS.Application.Features.Staffs.Commands.CreateStaff;
using _66SMS.Application.Features.Staffs.Commands.DeleteStaff;
using _66SMS.Application.Features.Staffs.Commands.UpdateStaff;
using _66SMS.Application.Features.Staffs.Commands.UpdateMyBookingStatus;
using _66SMS.Application.Features.Staffs.Queries.GetAllStaffs;
using _66SMS.Application.Features.Staffs.Queries.GetDetailStaff;
using _66SMS.Application.Features.Staffs.Queries.GetMyStaffScheduleDaily;
using _66SMS.Application.Features.Staffs.Queries.GetMyStaffScheduleWeekly;
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

        [HttpGet("me/schedule/daily")]
        [PermissionAuthorize("staffs", "read")]
        public async Task<IActionResult> GetMyScheduleDaily([FromQuery] string? date)
        {
            var workDate = ResolveDateOrToday(date);
            if (workDate == null)
                return HandleResult(Result<object>.BadRequest("Tham số date không hợp lệ."));

            var userId = jwtService.GetUserId();

            var result = await mediator.Send(new GetMyStaffScheduleDailyQuery { UserId = userId, Date = workDate.Value });
            return HandleResult(result);
        }

        [HttpGet("me/schedule/weekly")]
        [PermissionAuthorize("staffs", "read")]
        public async Task<IActionResult> GetMyScheduleWeekly([FromQuery] string? weekStart)
        {
            var start = ResolveWeekStartOrCurrent(weekStart);
            if (start == null)
                return HandleResult(Result<object>.BadRequest("Tham số weekStart không hợp lệ."));

            var userId = jwtService.GetUserId();

            var result = await mediator.Send(new GetMyStaffScheduleWeeklyQuery { UserId = userId, WeekStart = start.Value });
            return HandleResult(result);
        }

        [HttpPut("me/bookings/{id}/status")]
        [PermissionAuthorize("staffs", "read")]
        public async Task<IActionResult> UpdateMyBookingStatus(int id, [FromBody] UpdateMyBookingStatusCommand command)
        {
            if (id != command.Id)
                return HandleResult(Result<object>.BadRequest("Id không khớp."));

            var userId = jwtService.GetUserId();

            command.UserId = userId;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        private static DateOnly? ResolveDateOrToday(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return DateOnly.FromDateTime(DateTime.Today);

            if (DateOnly.TryParse(value, out var date))
                return date;

            return DateTime.TryParse(value, out var dt)
                ? DateOnly.FromDateTime(dt.Date)
                : null;
        }

        private static DateOnly? ResolveWeekStartOrCurrent(string? value)
        {
            DateOnly anchor;
            if (string.IsNullOrWhiteSpace(value))
            {
                anchor = DateOnly.FromDateTime(DateTime.Today);
            }
            else if (DateOnly.TryParse(value, out anchor))
            {
            }
            else if (DateTime.TryParse(value, out var dt))
            {
                anchor = DateOnly.FromDateTime(dt.Date);
            }
            else
            {
                return null;
            }

            var dayOfWeek = (int)anchor.ToDateTime(TimeOnly.MinValue).DayOfWeek;
            var daysFromMonday = dayOfWeek == 0 ? 6 : dayOfWeek - 1;
            return anchor.AddDays(-daysFromMonday);
        }
    }
}
