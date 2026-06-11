using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.WorkSchedules.Commands.DeleteWorkSchedule
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
            WorkSchedule workSchedule = await workScheduleSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                workScheduleSqlRepository.Remove(workSchedule);
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
