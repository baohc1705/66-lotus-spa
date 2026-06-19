using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.Features.Products.Commands.DeleteProducts
{
    public class DeleteProductHandler : IRequestHandler<DeleteProductCommand, Result<object>>
    {
        private readonly IProductSqlRepository productSqlRepository;
        private readonly IProductImageSqlRepository productImageSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteProductHandler(
            IProductSqlRepository productSqlRepository,
            IProductImageSqlRepository productImageSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.productSqlRepository = productSqlRepository;
            this.productImageSqlRepository = productImageSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                Product product = await productSqlRepository.FindByIdAsync(request.Id);
                if (product == null)
                {
                    return Result<object>.NotFound(ProductConst.MSG_PRODUCT_NOT_FOUND, ErrorCodes.ERR_PRODUCT_NOT_FOUND);
                }

                // Xóa mềm Product
                product.Status = ProductConst.STATUS_DELETED;
                product.UpdatedAt = DateTime.UtcNow;
                product.UpdatedBy = request.UpdatedBy;
                productSqlRepository.Update(product);

                // Xóa các entity con (ProductImages)
                List<ProductImage> productImages = await productImageSqlRepository.AsQueryable(false).Where(x => x.ProductId == product.Id).ToListAsync();
                if (productImages.Any())
                {
                    productImageSqlRepository.RemoveRange(productImages);
                }

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                return Result<object>.Ok();
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return Result<object>.Failure(500, $"An error occurred while deleting product: {ex.Message}");
            }
        }
    }
}
