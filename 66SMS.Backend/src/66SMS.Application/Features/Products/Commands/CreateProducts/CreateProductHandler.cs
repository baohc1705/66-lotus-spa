using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.Products.Commands.CreateProducts
{
    public class CreateProductHandler : IRequestHandler<CreateProductCommand, Result<int>>
    {
        private readonly IProductSqlRepository productSqlRepository;
        private readonly IProductImageSqlRepository productImageSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public CreateProductHandler(
            IProductSqlRepository productSqlRepository,
            IProductImageSqlRepository productImageSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.productSqlRepository = productSqlRepository;
            this.productImageSqlRepository = productImageSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<int>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                Product product = mapper.Map<Product>(request);
                product.CreatedAt = DateTime.UtcNow;

                productSqlRepository.Add(product);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                if (request.Images != null && request.Images.Any())
                {
                    List<ProductImage> productImages = new List<ProductImage>();
                    foreach (var imgDto in request.Images)
                    {
                        ProductImage img = mapper.Map<ProductImage>(imgDto);
                        img.ProductId = product.Id;
                        productImages.Add(img);
                    }
                    productImageSqlRepository.AddRange(productImages);
                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                }

                transaction.Commit();
                return Result<int>.Success(product.Id);
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return Result<int>.Failure(500, $"An error occurred while creating product: {ex.Message}");
            }
        }
    }
}
