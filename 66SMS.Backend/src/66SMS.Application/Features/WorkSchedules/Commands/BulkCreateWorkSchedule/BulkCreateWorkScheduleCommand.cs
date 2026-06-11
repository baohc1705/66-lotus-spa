using _66SMS.Application.Features.WorkSchedules.Commands.CreateWorkSchedule;
using _66SMS.Contracts.Shared;
using MediatR;
using System.Collections.Generic;

namespace _66SMS.Application.Features.WorkSchedules.Commands.BulkCreateWorkSchedule
{
    public class BulkCreateWorkScheduleCommand : IRequest<Result<object>>
    {
        public List<CreateWorkScheduleCommand> Schedules { get; set; } = new();
    }
}
