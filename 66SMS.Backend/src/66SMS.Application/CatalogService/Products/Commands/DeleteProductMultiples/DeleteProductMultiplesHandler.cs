using MediatR;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Contracts.Enumerations;
using Microsoft.EntityFrameworkCore;
using _66SMS.Domain.Enums;
using _66SMS.Domain.Entities;
using System.Data;


namespace _66SMS.Application.CatalogService.Products.Commands.DeleteProductMultiples
{

    public class DeleteProductMultiplesHandler : IRequestHandler<DeleteProductMultiplesCommand, Result<object>>
    {
        private readonly IProductSqlRepository productSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteProductMultiplesHandler(IProductSqlRepository productSqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.productSqlRepository = productSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }
        public async Task<Result<object>> Handle(DeleteProductMultiplesCommand request, CancellationToken cancellationToken)
        {
            var requestIds = request.Ids.Distinct().ToList();
            var existingProducts = await productSqlRepository
                .AsQueryable(false)
                .Where(x => requestIds.Contains(x.Id))
                .ToListAsync(cancellationToken);
            var existingIds = existingProducts.Select(x => x.Id).ToHashSet();
            if (existingIds.Count != requestIds.Count)
            {
                return Result<object>.NotFound(ProductConst.MSG_PRODUCT_ID_NOT_FOUND, ErrorCodes.ERR_PRODUCT_NOT_FOUND);
            }

            var now = DateTime.UtcNow;
            foreach (var product in existingProducts)
            {
                product.Status = (int)StatusActiveEnum.DELETED;
                product.UpdatedAt = now;
                product.UpdatedBy = request.UpdatedBy ?? 0;
                productSqlRepository.Update(product);
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

