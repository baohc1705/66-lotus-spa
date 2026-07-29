using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.BookingService.TimeSlots.Commands.UpdateTimeSlot
{
    public class UpdateTimeSlotHandler : IRequestHandler<UpdateTimeSlotCommand, Result<int>>
    {
        private readonly ITimeSlotSqlRepository timeSlotSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public UpdateTimeSlotHandler(
            ITimeSlotSqlRepository timeSlotSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.timeSlotSqlRepository = timeSlotSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<int>> Handle(UpdateTimeSlotCommand request, CancellationToken cancellationToken)
        {
            TimeSlot? timeSlot = await timeSlotSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);
            if (timeSlot == null)
            {
                return Result<int>.NotFound(TimeSlotConst.MSG_TIME_SLOT_NOT_FOUND, ErrorCodes.ERR_TIME_SLOT_NOT_FOUND);
            }

            mapper.Map(request, timeSlot);

            timeSlotSqlRepository.Update(timeSlot);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<int>.Success(timeSlot.Id);
        }
    }
}
