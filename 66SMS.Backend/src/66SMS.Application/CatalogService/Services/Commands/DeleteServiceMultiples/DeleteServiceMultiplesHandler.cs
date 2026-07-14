using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.CatalogService.Services.Commands.DeleteServiceMultiples
{
    public class DeleteServiceMultiplesHandler : IRequestHandler<DeleteServiceMultiplesCommand, Result<object>>
    {
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly ICacheService cacheService;

        public DeleteServiceMultiplesHandler(
            IServiceSqlRepository serviceSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            ICacheService cacheService)
        {
            this.serviceSqlRepository = serviceSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(DeleteServiceMultiplesCommand request, CancellationToken cancellationToken)
        {
            var requestIds = request.Ids.Distinct().ToList();
            var existingServices = await serviceSqlRepository
                .AsQueryable(false)
                .Where(x => requestIds.Contains(x.Id))
                .ToListAsync(cancellationToken);

            var existingIds = existingServices.Select(x => x.Id).ToHashSet();
            if (existingIds.Count != requestIds.Count)
            {
                return Result<object>.NotFound(ServiceConst.MSG_SERVICE_NOT_FOUND, ErrorCodes.ERR_SERVICE_NOT_FOUND);
            }

            foreach (var service in existingServices)
            {
                service.Status = (int)StatusActiveEnum.DELETED;
                serviceSqlRepository.Update(service);
            }

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                foreach (var id in existingIds)
                {
                    await cacheService.RemoveAsync(ServiceConst.CacheKeyDetail(id), cancellationToken);
                }
                await cacheService.RemoveByPrefixAsync(ServiceConst.CACHE_PREFIX, cancellationToken);

                return Result<object>.Ok();
            }
            catch (Exception)
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
