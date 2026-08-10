using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
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
            ProductCategory? productCategory = await productCategorySqlRepository
            .AsQueryable(false)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (productCategory == null)
            {
                return Result<object>.NotFound(ProductCategoryConst.MSG_PRODUCT_CATEGORY_ID_NOT_FOUND, ErrorCodes.ERR_PRODUCT_CATEGORY_NOT_FOUND);
            }

            mapper.Map(request, productCategory);

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
                transaction.Rollback();throw;
            }

        }
    }
}
