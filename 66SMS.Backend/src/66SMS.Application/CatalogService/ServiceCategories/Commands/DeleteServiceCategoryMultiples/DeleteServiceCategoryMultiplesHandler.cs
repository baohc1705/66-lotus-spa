using MediatR;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Contracts.Enumerations;
using Microsoft.EntityFrameworkCore;
using _66SMS.Domain.Enums;
using System.Data;

namespace _66SMS.Application.CatalogService.ServiceCategories.Commands.DeleteServiceCategoryMultiples
{
    public class DeleteServiceCategoryMultiplesHandler : IRequestHandler<DeleteServiceCategoryMultiplesCommand, Result<object>>
    {
        private readonly IServiceCategorySqlRepository serviceCategorySqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteServiceCategoryMultiplesHandler(IServiceCategorySqlRepository serviceCategorySqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.serviceCategorySqlRepository = serviceCategorySqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteServiceCategoryMultiplesCommand request, CancellationToken cancellationToken)
        {
            var requestIds = request.Ids.Distinct().ToList();
            var existingCategories = await serviceCategorySqlRepository
                .AsQueryable(false)
                .Where(x => requestIds.Contains(x.Id))
                .ToListAsync(cancellationToken);

            var existingIds = existingCategories.Select(x => x.Id).ToHashSet();
            if (existingIds.Count != requestIds.Count)
            {
                return Result<object>.NotFound(ServiceCategoryConst.MSG_SERVICE_CATEGORY_NOT_FOUND, ErrorCodes.ERR_SERVICE_CATEGORY_NOT_FOUND);
            }

            var now = DateTime.UtcNow;
            foreach (var category in existingCategories)
            {
                category.Status = (int)StatusActiveEnum.DELETED;
                category.UpdatedAt = now;
                category.UpdatedBy = request.UpdatedBy;
                serviceCategorySqlRepository.Update(category);
            }

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
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
