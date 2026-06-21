using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.CatalogService.Products.Commands.DeleteProducts
{
    /// <summary>
    /// Handler for <see cref="DeleteProductCommand"/>
    /// </summary>
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
                // Find by id and tracking
                Product? product = await productSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);

                // return not found if product is null
                if (product == null)
                {
                    return Result<object>.NotFound(ProductConst.MSG_PRODUCT_NOT_FOUND, ErrorCodes.ERR_PRODUCT_NOT_FOUND);
                }

                // update status is deleted soft deleted
                product.Status = ProductConst.STATUS_DELETED;
                product.UpdatedAt = DateTime.UtcNow;
                product.UpdatedBy = request.UpdatedBy;

                // Update and persist to database
                productSqlRepository.Update(product);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Xóa các entity con (ProductImages)
                List<ProductImage> productImages = await productImageSqlRepository
                    .AsQueryable(false)
                    .Where(x => x.ProductId == product.Id)
                    .ToListAsync(cancellationToken);

                if (productImages.Any())
                {
                    productImageSqlRepository.RemoveRange(productImages);
                }
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();

                return Result<object>.Ok();
            }
            catch (Exception)
            {
                transaction.Rollback(); throw;
            }
        }
    }
}
