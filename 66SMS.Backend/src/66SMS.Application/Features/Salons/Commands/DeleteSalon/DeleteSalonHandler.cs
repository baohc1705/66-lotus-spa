using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.Salons.Commands.DeleteSalon
{
    public class DeleteSalonHandler : IRequestHandler<DeleteSalonCommand, Result<object>>
    {
        private readonly ISalonSqlRepository salonSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteSalonHandler(ISalonSqlRepository salonSqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.salonSqlRepository = salonSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteSalonCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                Salon salon = await salonSqlRepository.FindByIdAsync((int)request.Id);
                if (salon == null)
                    return Result<object>.NotFound(SalonConst.MSG_SALON_NOT_FOUND, ErrorCodes.ERR_SALON_NOT_FOUND);

                salon.Status = SalonConst.STATUS_DELETED;
                salon.UpdatedAt = DateTimeHelper.UtcNow();
                salon.UpdatedBy = request.UpdatedBy;
                salonSqlRepository.Update(salon);

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
