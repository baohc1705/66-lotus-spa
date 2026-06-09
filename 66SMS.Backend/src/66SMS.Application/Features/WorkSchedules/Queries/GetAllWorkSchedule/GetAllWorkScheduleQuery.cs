using _66SMS.Application.DTOs.WorkSchedules;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.WorkSchedules.Queries.GetAllWorkSchedule
{
    public class GetAllWorkScheduleQuery : PageRequest, IRequest<Result<PagedResult<WorkScheduleDTO>>>
    {
    }
}
