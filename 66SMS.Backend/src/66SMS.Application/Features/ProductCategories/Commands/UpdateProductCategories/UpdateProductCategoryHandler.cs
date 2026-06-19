using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.Features.ProductCategories.Commands.UpdateProductCategories
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
            ProductCategory productCategory = await productCategorySqlRepository.FindByIdAsync(request.Id);
            if (productCategory == null)
            {
                return Result<object>.NotFound(ProductCategoryConst.MSG_PRODUCT_CATEGORY_NOT_FOUND, ErrorCodes.ERR_PRODUCT_CATEGORY_NOT_FOUND);
            }

            mapper.Map(request, productCategory);
            productCategory.UpdatedAt = DateTime.UtcNow;
            productCategory.UpdatedBy = request.UpdatedBy;

            productCategorySqlRepository.Update(productCategory);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Ok();
        }
    }
}
