using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

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

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                productCategorySqlRepository.Add(productCategory);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();
                return Result<int>.Success(productCategory.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
