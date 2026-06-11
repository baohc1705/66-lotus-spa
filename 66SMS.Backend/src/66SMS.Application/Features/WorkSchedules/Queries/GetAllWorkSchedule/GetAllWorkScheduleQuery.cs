using _66SMS.Application.DTOs.WorkSchedules;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.WorkSchedules.Queries.GetAllWorkSchedule
{
    public class GetAllWorkScheduleQuery : PageRequest, IRequest<Result<PagedResult<WorkScheduleDTO>>>
    {
        public string? StartDate { get; set; }
        public string? EndDate { get; set; }
        public int? EmployeeId { get; set; }
    }
}
