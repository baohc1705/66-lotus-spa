using _66SMS.Application.DTOs.WorkSchedules;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.WorkSchedules.Queries.GetDetailWorkSchedule
{
    public class GetDetailWorkScheduleQuery : IRequest<Result<WorkScheduleDTO>>
    {
        public int Id { get; set; }
    }
}
