using _66SMS.API.Abstractions;
using _66SMS.Application.DTOs.Staffs;
using _66SMS.Application.SalonService.Staffs.Commands.CreateStaff;
using _66SMS.Application.SalonService.Staffs.Commands.CreateStaffServices;
using _66SMS.Application.SalonService.Staffs.Commands.DeleteStaff;
using _66SMS.Application.SalonService.Staffs.Commands.DeleteStaffServices;
using _66SMS.Application.SalonService.Staffs.Commands.UpdateMyBookingStatus;
using _66SMS.Application.SalonService.Staffs.Commands.UpdateStaff;
using _66SMS.Application.SalonService.Staffs.Commands.UpdateStaffServices;
using _66SMS.Application.SalonService.Staffs.Queries.GetAllStaffs;
using _66SMS.Application.SalonService.Staffs.Queries.GetAllStaffServices;
using _66SMS.Application.SalonService.Staffs.Queries.GetDetailStaff;
using _66SMS.Application.SalonService.Staffs.Queries.GetMyStaffScheduleDaily;
using _66SMS.Application.SalonService.Staffs.Queries.GetMyStaffScheduleWeekly;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Shared;
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
                var check = await mediator.Send(new GetDetailStaffQuery
                {
                    Id = id,
                    SalonId = tokenSalonId
                });
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
                var check = await mediator.Send(new GetDetailStaffQuery
                {
                    Id = id,
                    SalonId = tokenSalonId
                });
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
            var query = new GetAllStaffQuery
            {
                SalonId = salonId,
                PageSize = 100,
                PageIndex = 1
            };
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
            var result = await mediator.Send(new GetDetailStaffQuery
            {
                Id = id,
                SalonId = tokenSalonId
            });
            return HandleResult(result);
        }

        [HttpGet("me/schedule/daily")]
        [PermissionAuthorize("staffs", "read")]
        public async Task<IActionResult> GetMyScheduleDaily([FromQuery] GetMyStaffScheduleDailyQuery query)
        {
            query.UserId = jwtService.GetUserId();
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("me/schedule/weekly")]
        [PermissionAuthorize("staffs", "read")]
        public async Task<IActionResult> GetMyScheduleWeekly([FromQuery] GetMyStaffScheduleWeeklyQuery query)
        {
            query.UserId = jwtService.GetUserId();
            var result = await mediator.Send(query);
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

        [HttpPost("services")]
        [PermissionAuthorize("staffs", "create")]
        public async Task<IActionResult> CreateStaffService([FromBody] CreateStaffServiceCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("services/{id}")]
        [PermissionAuthorize("staffs", "update")]
        public async Task<IActionResult> UpdateStaffService(int id, [FromBody] UpdateStaffServiceCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("services")]
        [PermissionAuthorize("staffs", "delete")]
        public async Task<IActionResult> DeleteStaffService([FromBody] DeleteStaffServiceCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet("services")]
        [PermissionAuthorize("staffs", "read")]
        public async Task<IActionResult> GetAllStaffServices([FromQuery] GetAllStaffServiceQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }
    }
}
