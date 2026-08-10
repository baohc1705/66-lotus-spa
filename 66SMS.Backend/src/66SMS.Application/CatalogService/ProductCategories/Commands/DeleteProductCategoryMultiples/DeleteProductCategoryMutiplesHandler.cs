using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.CatalogService.ProductCategories.Commands.DeleteProductCategoryMultiples
{
    public class DeleteProductCategoryMultiplesHandler : IRequestHandler<DeleteProductCategoryMultiplesCommand, Result<object>>
    {
        private readonly IProductCategorySqlRepository productCategorySqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteProductCategoryMultiplesHandler(IProductCategorySqlRepository productCategorySqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.productCategorySqlRepository = productCategorySqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteProductCategoryMultiplesCommand request, CancellationToken cancellationToken)
        {
            var requestIds = request.Ids.Distinct().ToList();

            var existingCategories = await productCategorySqlRepository
                .AsQueryable(false)
                .Where(x => requestIds.Contains(x.Id))
                .ToListAsync(cancellationToken);

            var existingIds = existingCategories.Select(x => x.Id).ToHashSet();
            if (existingIds.Count != requestIds.Count)
            {
                return Result<object>.NotFound(
                    ProductCategoryConst.MSG_PRODUCT_CATEGORY_ID_NOT_FOUND,
                    ErrorCodes.ERR_PRODUCT_CATEGORY_NOT_FOUND);
            }

            foreach (var category in existingCategories)
            {
                category.Status = (int)StatusActiveEnum.DELETED;
                productCategorySqlRepository.Update(category);
            }

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
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
