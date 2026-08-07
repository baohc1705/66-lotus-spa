using _66SMS.Application.DTOs.Staffs;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Staffs.Queries.GetMyStaffScheduleDaily
{
    public sealed class GetMyStaffScheduleDailyQuery : IRequest<Result<StaffScheduleDailyDto>>
    {
        public int UserId { get; set; }
        public DateOnly? Date { get; set; }
    }
}
