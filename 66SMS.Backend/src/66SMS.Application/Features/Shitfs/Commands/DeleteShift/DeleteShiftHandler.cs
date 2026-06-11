using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.Features.Shitfs.Commands.DeleteShift
{
    public class DeleteShiftHandler : IRequestHandler<DeleteShiftCommand, Result<object>>
    {
        private readonly IShiftSqlRepository shiftSqlRepository;
        private readonly IShiftPeriodSqlRepository shiftPeriodSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteShiftHandler(
            IShiftSqlRepository shiftSqlRepository,
            IShiftPeriodSqlRepository shiftPeriodSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.shiftSqlRepository = shiftSqlRepository;
            this.shiftPeriodSqlRepository = shiftPeriodSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteShiftCommand request, CancellationToken cancellationToken)
        {
            Shift? shift = await shiftSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);
            if (shift == null)
            {
                return Result<object>.NotFound();
            }

            List<ShiftPeriod> shiftPeriods = await shiftPeriodSqlRepository.AsQueryable(false)
                .Where(x => x.ShiftId == request.Id)
                .ToListAsync(cancellationToken);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                if (shiftPeriods.Any())
                {
                    shiftPeriodSqlRepository.RemoveRange(shiftPeriods);
                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                }

                shiftSqlRepository.Remove(shift);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();
                return Result<object>.Ok();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
