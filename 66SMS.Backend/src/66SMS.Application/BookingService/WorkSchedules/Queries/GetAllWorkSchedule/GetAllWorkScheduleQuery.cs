using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.WorkSchedules.Queries.GetAllWorkSchedule
{
    public class GetAllWorkScheduleQuery : PageRequest, IRequest<Result<PagedResult<WorkScheduleDTO>>>
    {
        public string? StartDate { get; set; }
        public string? EndDate { get; set; }
        public int? StaffId { get; set; }
        public int? SalonId { get; set; }
    }
}
