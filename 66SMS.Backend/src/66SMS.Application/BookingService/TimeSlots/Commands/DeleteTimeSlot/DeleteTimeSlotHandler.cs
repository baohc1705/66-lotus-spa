using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;

namespace _66SMS.Application.BookingService.TimeSlots.Commands.DeleteTimeSlot
{
    public class DeleteTimeSlotHandler : IRequestHandler<DeleteTimeSlotCommand, Result<int>>
    {
        private readonly ITimeSlotSqlRepository timeSlotSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteTimeSlotHandler(
            ITimeSlotSqlRepository timeSlotSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.timeSlotSqlRepository = timeSlotSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<int>> Handle(DeleteTimeSlotCommand request, CancellationToken cancellationToken)
        {
            TimeSlot? timeSlot = await timeSlotSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);
            if (timeSlot == null)
            {
                return Result<int>.NotFound(TimeSlotConst.MSG_TIME_SLOT_NOT_FOUND, ErrorCodes.ERR_TIME_SLOT_NOT_FOUND);
            }

            timeSlotSqlRepository.Remove(timeSlot);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<int>.Success(timeSlot.Id);
        }
    }
}
