using _66SMS.Application.DTOs.WorkSchedules;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.WorkSchedules.Queries.GetDetailWorkSchedule
{
    public class GetDetailWorkScheduleQuery : IRequest<Result<WorkScheduleDTO>>
    {
        public int Id { get; set; }
    }
}
