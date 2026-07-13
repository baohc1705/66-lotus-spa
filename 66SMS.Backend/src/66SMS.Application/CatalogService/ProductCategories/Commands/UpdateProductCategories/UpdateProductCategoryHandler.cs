using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.CatalogService.ProductCategories.Commands.UpdateProductCategories
{
    /// <summary>
    /// Handler for <see cref="UpdateProductCategoryCommand"/>
    /// </summary>
    public class UpdateProductCategoryHandler : IRequestHandler<UpdateProductCategoryCommand, Result<object>>
    {
        private readonly IProductCategorySqlRepository productCategorySqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public UpdateProductCategoryHandler(
            IProductCategorySqlRepository productCategorySqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.productCategorySqlRepository = productCategorySqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateProductCategoryCommand request, CancellationToken cancellationToken)
        {
            // Find category with id
            ProductCategory? productCategory = await productCategorySqlRepository
            .AsQueryable(false)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            // Return not found if category is null
            if (productCategory == null)
            {
                return Result<object>.NotFound(ProductCategoryConst.MSG_PRODUCT_CATEGORY_ID_NOT_FOUND, ErrorCodes.ERR_PRODUCT_CATEGORY_NOT_FOUND);
            }
            
            // Map request to domain entity and ignore null
            mapper.Map(request, productCategory);

            // Begin transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Update and persist to database
                productCategorySqlRepository.Update(productCategory);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Commit transaction
                transaction.Commit();

                // Return success result
                return Result<object>.Ok();
            }
            catch
            {
                // Rollback on failure
                transaction.Rollback();throw;
            }
            
        }
    }
}
