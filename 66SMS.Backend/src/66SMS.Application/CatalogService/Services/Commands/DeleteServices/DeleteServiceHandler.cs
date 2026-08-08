using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using MediatR;
using System.Data;

namespace _66SMS.Application.CatalogService.Services.Commands.DeleteServices
{
    public class DeleteServiceHandler : IRequestHandler<DeleteServiceCommand, Result<object>>
    {
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IImageUploadService imageUploadService;
        private readonly ICacheService cacheService;

        public DeleteServiceHandler(
            IServiceSqlRepository serviceSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IImageUploadService imageUploadService,
            ICacheService cacheService)
        {
            this.serviceSqlRepository = serviceSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.imageUploadService = imageUploadService;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(DeleteServiceCommand request, CancellationToken cancellationToken)
        {
            Service? service = await serviceSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);

            if (service == null)
            {
                return Result<object>.NotFound(ServiceConst.MSG_SERVICE_NOT_FOUND, ErrorCodes.ERR_SERVICE_NOT_FOUND);
            }

            service.Status = (int)StatusActiveEnum.DELETED;
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                serviceSqlRepository.Update(service);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();

                await cacheService.RemoveAsync(ServiceConst.CacheKeyDetail(service.Id), cancellationToken);
                await cacheService.RemoveByPrefixAsync(ServiceConst.CACHE_PREFIX, cancellationToken);

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
