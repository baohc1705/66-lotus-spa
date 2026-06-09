using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.WorkSchedules.Commands.UpdateWorkSchedule
{
    public class UpdateWorkScheduleCommand : IRequest<Result<object>>
    {
       
        public int? Id { get; set; }
        public int? ShiftPeriodId { get; set; }
        public int? EmployeeId { get; set; }
        public DateOnly? WorkDate { get; set; }
    }
}
