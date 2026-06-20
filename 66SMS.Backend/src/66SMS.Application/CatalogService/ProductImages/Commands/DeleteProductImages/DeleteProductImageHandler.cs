using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;

namespace _66SMS.Application.CatalogService.ProductImages.Commands.DeleteProductImages
{
    public class DeleteProductImageHandler : IRequestHandler<DeleteProductImageCommand, Result<object>>
    {
        private readonly IProductImageSqlRepository productImageSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteProductImageHandler(
            IProductImageSqlRepository productImageSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.productImageSqlRepository = productImageSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteProductImageCommand request, CancellationToken cancellationToken)
        {
            ProductImage? productImage = await productImageSqlRepository.FindByIdAsync(request.Id);
            if (productImage == null)
            {
                return Result<object>.NotFound(ProductImageConst.MSG_PRODUCT_IMAGE_NOT_FOUND, ErrorCodes.ERR_PRODUCT_IMAGE_NOT_FOUND);
            }

            // Hard delete
            productImageSqlRepository.Remove(productImage);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Ok();
        }
    }
}
