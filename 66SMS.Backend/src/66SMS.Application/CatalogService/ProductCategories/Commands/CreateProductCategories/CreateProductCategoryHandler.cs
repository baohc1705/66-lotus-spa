using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.CatalogService.ProductCategories.Commands.CreateProductCategories
{
    public class CreateProductCategoryHandler : IRequestHandler<CreateProductCategoryCommand, Result<int>>
    {
        private readonly IProductCategorySqlRepository productCategorySqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public CreateProductCategoryHandler(
            IProductCategorySqlRepository productCategorySqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.productCategorySqlRepository = productCategorySqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<int>> Handle(CreateProductCategoryCommand request, CancellationToken cancellationToken)
        {
            ProductCategory productCategory = mapper.Map<ProductCategory>(request);
            productCategory.CreatedAt = DateTime.UtcNow;
            productCategory.CreatedBy = request.CreatedBy ?? 1;
            productCategory.Status = request.Status ?? _66SMS.Domain.Constants.ProductCategoryConst.STATUS_ACTIVED;

            productCategorySqlRepository.Add(productCategory);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<int>.Success(productCategory.Id);
        }
    }
}
