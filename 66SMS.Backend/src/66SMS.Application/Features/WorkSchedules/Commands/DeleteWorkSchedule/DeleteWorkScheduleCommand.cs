using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.WorkSchedules.Commands.DeleteWorkSchedule
{
    public class DeleteWorkScheduleCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
    }
}
