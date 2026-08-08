using _66SMS.Application.DTOs.Staffs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Staffs.Queries.GetMyStaffScheduleWeekly
{
    public sealed class GetMyStaffScheduleWeeklyQuery : IRequest<Result<StaffScheduleWeeklyDto>>
    {
        public int UserId { get; set; }
        public DateOnly? WeekStart { get; set; }
    }
}
