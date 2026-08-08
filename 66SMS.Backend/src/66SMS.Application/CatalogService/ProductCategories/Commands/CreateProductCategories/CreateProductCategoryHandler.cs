using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.CatalogService.ProductCategories.Commands.CreateProductCategories
{
    /// <summary>
    /// Handler for <see cref="CreateProductCategoryCommand"/>
    /// </summary>
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
            // Map request to domain entity
            ProductCategory productCategory = mapper.Map<ProductCategory>(request);

            // Beigin transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Insert and persist to database
                productCategorySqlRepository.Add(productCategory);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Commit transaction
                transaction.Commit();
                return Result<int>.Success(productCategory.Id);
            }
            catch
            {
                // Rollback on failure
                transaction.Rollback();
                throw;
            }
        }
    }
}
