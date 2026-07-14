using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using MediatR;
using System.Data;

namespace _66SMS.Application.SalonService.Salons.Commands.DeleteSalon
{
    public class DeleteSalonHandler : IRequestHandler<DeleteSalonCommand, Result<object>>
    {
        private readonly ISalonSqlRepository salonSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly ICacheService cacheService;

        public DeleteSalonHandler(
            ISalonSqlRepository salonSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            ICacheService cacheService)
        {
            this.salonSqlRepository = salonSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(DeleteSalonCommand request, CancellationToken cancellationToken)
        {
            Salon? salon = await salonSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);
            if (salon == null)
                return Result<object>.NotFound(SalonConst.MSG_SALON_NOT_FOUND, ErrorCodes.ERR_SALON_NOT_FOUND);

            salon.Status = (int)StatusActiveEnum.DELETED;

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                salonSqlRepository.Update(salon);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                await cacheService.RemoveAsync(SalonConst.CacheKeyDetail(salon.Id), cancellationToken);
                await cacheService.RemoveByPrefixAsync(SalonConst.CACHE_PREFIX, cancellationToken);

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
