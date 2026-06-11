using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using MediatR;

namespace _66SMS.Application.Features.ProductImages.Commands.DeleteProductImages
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
            ProductImage productImage = await productImageSqlRepository.FindByIdAsync(request.Id);
            if (productImage == null)
            {
                return Result<object>.NotFound("Product image not found.", ErrorCodes.ERR_PRODUCT_IMAGE_NOT_FOUND);
            }

            // Hard delete
            productImageSqlRepository.Remove(productImage);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Ok();
        }
    }
}
