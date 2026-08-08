using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using MediatR;
using System.Data;

namespace _66SMS.Application.CatalogService.ProductCategories.Commands.DeleteProductCategories
{
    public class DeleteProductCategoryHandler : IRequestHandler<DeleteProductCategoryCommand, Result<object>>
    {
        private readonly IProductCategorySqlRepository productCategorySqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteProductCategoryHandler(
            IProductCategorySqlRepository productCategorySqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.productCategorySqlRepository = productCategorySqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteProductCategoryCommand request, CancellationToken cancellationToken)
        {
            ProductCategory? productCategory = await productCategorySqlRepository.FindByIdAsync(request.Id, false, cancellationToken);

            if (productCategory == null)
            {
                return Result<object>.NotFound(ProductCategoryConst.MSG_PRODUCT_CATEGORY_ID_NOT_FOUND, ErrorCodes.ERR_PRODUCT_CATEGORY_NOT_FOUND);
            }

            productCategory.Status = (int)StatusActiveEnum.DELETED;

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {

                productCategorySqlRepository.Update(productCategory);
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
