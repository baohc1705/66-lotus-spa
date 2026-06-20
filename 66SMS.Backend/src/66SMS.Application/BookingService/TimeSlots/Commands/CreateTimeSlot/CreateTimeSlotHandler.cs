using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace _66SMS.Application.BookingService.TimeSlots.Commands.CreateTimeSlot
{
    public class CreateTimeSlotHandler : IRequestHandler<CreateTimeSlotCommand, Result<int>>
    {
        private readonly ITimeSlotSqlRepository timeSlotSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public CreateTimeSlotHandler(
            ITimeSlotSqlRepository timeSlotSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.timeSlotSqlRepository = timeSlotSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<int>> Handle(CreateTimeSlotCommand request, CancellationToken cancellationToken)
        {
            TimeSlot timeSlot = mapper.Map<TimeSlot>(request);

            timeSlotSqlRepository.Add(timeSlot);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<int>.Success(timeSlot.Id);
        }
    }
}
