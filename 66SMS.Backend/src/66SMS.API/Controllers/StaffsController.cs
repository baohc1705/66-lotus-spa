using _66SMS.API.Abstractions;
using _66SMS.Application.DTOs.Staffs;
using _66SMS.Application.SalonService.Staffs.Commands.CreateStaff;
using _66SMS.Application.SalonService.Staffs.Commands.DeleteStaff;
using _66SMS.Application.SalonService.Staffs.Commands.UpdateStaff;
using _66SMS.Application.SalonService.Staffs.Commands.UpdateMyBookingStatus;
using _66SMS.Application.SalonService.Staffs.Queries.GetAllStaffs;
using _66SMS.Application.SalonService.Staffs.Queries.GetDetailStaff;
using _66SMS.Application.SalonService.Staffs.Queries.GetMyStaffScheduleDaily;
using _66SMS.Application.SalonService.Staffs.Queries.GetMyStaffScheduleWeekly;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
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
        [PermissionAuthorize("staffs", "create")]
        public async Task<IActionResult> CreateStaff([FromBody] CreateStaffCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var tokenSalonId = jwtService.GetSalonId();
            if (tokenSalonId.HasValue)
            {
                // Manager: ghi đè salon_id từ token
                command.SalonId = tokenSalonId.Value;
            }
            else if (!command.SalonId.HasValue)
            {
                // Admin: bắt buộc phải truyền salon_id trong body
                return HandleResult(Result<object>.BadRequest("salon_id là bắt buộc khi tạo nhân viên với tài khoản Admin"));
            }
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [PermissionAuthorize("staffs", "delete", Roles = "admin")]
        public async Task<IActionResult> DeleteStaff(int id)
        {
            var tokenSalonId = jwtService.GetSalonId();
            if (tokenSalonId.HasValue)
            {
                var check = await mediator.Send(new GetDetailStaffQuery { Id = id, SalonId = tokenSalonId });
                if (!check.IsSuccess) 
                    return HandleResult(Result<object>.NotFound("Nhân viên không thuộc chi nhánh của bạn."));
            }

            var command = new DeleteStaffCommand { Id = id };
            command.UpdatedBy = jwtService.GetUserId();
            Result<object> result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [PermissionAuthorize("staffs", "update")]
        public async Task<IActionResult> UpdateStaff(int id, [FromBody] UpdateStaffCommand command)
        {
            var tokenSalonId = jwtService.GetSalonId();
            if (tokenSalonId.HasValue)
            {
                var check = await mediator.Send(new GetDetailStaffQuery { Id = id, SalonId = tokenSalonId });
                if (!check.IsSuccess) 
                    return HandleResult(Result<object>.NotFound("Nhân viên không thuộc chi nhánh của bạn."));
            }

            command.Id = id;
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet("by-salon/{salonId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBySalon(int salonId)
        {
            var query = new GetAllStaffQuery { SalonId = salonId, PageSize = 100, PageIndex = 1 };
            var result = await mediator.Send(query);
            if (!result.IsSuccess)
                return HandleResult(result);
            return HandleResult(Result<IReadOnlyList<StaffDto>>.Success(result.Data!.Items));
        }

        [HttpGet]
        [PermissionAuthorize("staffs", "read")]
        public async Task<IActionResult> GetAll([FromQuery] GetAllStaffQuery query)
        {
            var tokenSalonId = jwtService.GetSalonId();
            if (tokenSalonId.HasValue)
                query.SalonId = tokenSalonId.Value;
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("admin")]
        [PermissionAuthorize("staffs", "read")]
        public async Task<IActionResult> AdminGetAll([FromQuery] GetAllStaffQuery query)
        {
            var tokenSalonId = jwtService.GetSalonId();
            if (tokenSalonId.HasValue)
                query.SalonId = tokenSalonId.Value;
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [PermissionAuthorize("staffs", "read")]
        public async Task<IActionResult> GetDetail(int id)
        {
            var tokenSalonId = jwtService.GetSalonId();
            var result = await mediator.Send(new GetDetailStaffQuery { Id = id, SalonId = tokenSalonId });
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
