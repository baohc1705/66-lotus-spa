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
    /// <summary>
    /// Handler for <see cref="DeleteProductCategoryCommand"/>
    /// </summary>
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
            // Find product category with id
            ProductCategory? productCategory = await productCategorySqlRepository.FindByIdAsync(request.Id, false, cancellationToken);

            // return not found if product category is null
            if (productCategory == null)
            {
                return Result<object>.NotFound(ProductCategoryConst.MSG_PRODUCT_CATEGORY_ID_NOT_FOUND, ErrorCodes.ERR_PRODUCT_CATEGORY_NOT_FOUND);
            }

            // Soft delete
            productCategory.Status = (int)StatusActiveEnum.DELETED;

            // Begin transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                
                // Update and persist to database
                productCategorySqlRepository.Update(productCategory);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Commit transaction
                transaction.Commit();

                // return success result
                return Result<object>.Ok();
            }
            catch
            {
                // Rollback on failure
                transaction.Rollback(); throw;
            }
            
        }
    }
}
