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

namespace _66SMS.Application.CatalogService.ServiceCategories.Commands.DeleteServiceCategories
{
    public class DeleteServiceCategoriesHandler : IRequestHandler<DeleteServiceCategoriesCommand, Result<object>>
    {
        private readonly IServiceCategorySqlRepository serviceCategorySqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly ICacheService cacheService;

        public DeleteServiceCategoriesHandler(
            IServiceCategorySqlRepository serviceCategorySqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            ICacheService cacheService)
        {
            this.serviceCategorySqlRepository = serviceCategorySqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(DeleteServiceCategoriesCommand request, CancellationToken cancellationToken)
        {
            ServiceCategory? entity = await serviceCategorySqlRepository.FindByIdAsync(request.Id, false, cancellationToken);

            if (entity == null)
            {
                return Result<object>.NotFound(ServiceCategoryConst.MSG_SERVICE_CATEGORY_NOT_FOUND, ErrorCodes.ERR_SERVICE_CATEGORY_NOT_FOUND);
            }

            entity.Status = (int)StatusActiveEnum.DELETED;

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                serviceCategorySqlRepository.Update(entity);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();

                await cacheService.RemoveByPrefixAsync(ServiceCategoryConst.CACHE_PREFIX, cancellationToken);
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
