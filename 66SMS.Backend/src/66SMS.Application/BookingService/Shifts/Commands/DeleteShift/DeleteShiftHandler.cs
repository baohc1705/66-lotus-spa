using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using MediatR;
using System.Data;

namespace _66SMS.Application.BookingService.Shifts.Commands.DeleteShift
{
    public class DeleteShiftHandler : IRequestHandler<DeleteShiftCommand, Result<object>>
    {
        private readonly IShiftSqlRepository shiftSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteShiftHandler(
            IShiftSqlRepository shiftSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.shiftSqlRepository = shiftSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteShiftCommand request, CancellationToken cancellationToken)
        {
            Shift? shift = await shiftSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);
            if (shift == null)
            {
                return Result<object>.NotFound();
            }

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
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
