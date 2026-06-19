using _66SMS.Application.Features.WorkSchedules.Commands.BulkCreateWorkSchedule;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.WorkSchedules.Commands.CreateWorkSchedule
{
    public class CreateWorkScheduleHandler : IRequestHandler<CreateWorkScheduleCommand, Result<object>>
    {
        private readonly IMediator mediator;

        public CreateWorkScheduleHandler(IMediator mediator)
        {
            this.mediator = mediator;
        }

        public async Task<Result<object>> Handle(CreateWorkScheduleCommand request, CancellationToken cancellationToken)
        {
            var bulkCommand = new BulkCreateWorkScheduleCommand
            {
                Schedules = [new CreateWorkScheduleCommand
                {
                    ShiftPeriodId = request.ShiftPeriodId,
                    StaffId = request.StaffId,
                    SalonId = request.SalonId,
                    WorkDate = request.WorkDate,
                    CreatedBy = request.CreatedBy,
                }],
                CreatedBy = request.CreatedBy
            };
            return await mediator.Send(bulkCommand, cancellationToken);
        }
    }
}
