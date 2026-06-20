using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;

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
            ProductCategory productCategory = await productCategorySqlRepository.FindByIdAsync(request.Id);
            if (productCategory == null)
            {
                return Result<object>.NotFound(ProductCategoryConst.MSG_PRODUCT_CATEGORY_NOT_FOUND, ErrorCodes.ERR_PRODUCT_CATEGORY_NOT_FOUND);
            }

            // Soft delete
            productCategory.Status = ProductCategoryConst.STATUS_DELETED;
            productCategory.UpdatedAt = DateTime.UtcNow;
            productCategory.UpdatedBy = request.UpdatedBy;

            productCategorySqlRepository.Update(productCategory);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Ok();
        }
    }
}
