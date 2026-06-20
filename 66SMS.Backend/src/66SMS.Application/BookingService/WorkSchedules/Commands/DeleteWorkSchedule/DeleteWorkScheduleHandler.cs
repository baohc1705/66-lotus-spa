using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using MediatR;
using System.Data;

namespace _66SMS.Application.BookingService.WorkSchedules.Commands.DeleteWorkSchedule
{
    public class DeleteWorkScheduleHandler : IRequestHandler<DeleteWorkScheduleCommand, Result<object>>
    {
        private readonly IWorkScheduleSqlRepository workScheduleSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        public DeleteWorkScheduleHandler(IWorkScheduleSqlRepository workScheduleSqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.workScheduleSqlRepository = workScheduleSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        async Task<Result<object>> IRequestHandler<DeleteWorkScheduleCommand, Result<object>>.Handle(DeleteWorkScheduleCommand request, CancellationToken cancellationToken)
        {
            WorkSchedule workSchedule = (await workScheduleSqlRepository.FindByIdAsync(request.Id, false, cancellationToken))!;
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                workSchedule.Status = _66SMS.Domain.Constants.WorkScheduleConst.STATUS_DELETED;
                workSchedule.UpdatedAt = DateTime.UtcNow;
                workSchedule.UpdatedBy = request.UpdatedBy;
                workScheduleSqlRepository.Update(workSchedule);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                return Result<object>.Ok();
            }
            catch
            {
                transaction.Rollback(); throw;
            }
        }
    }
}
