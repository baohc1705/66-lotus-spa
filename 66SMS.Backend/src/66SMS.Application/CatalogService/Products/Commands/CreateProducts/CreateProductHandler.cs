using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.CatalogService.Products.Commands.CreateProducts
{
    /// <summary>
    /// Handler for <see cref="CreateProductCommand"/>
    /// </summary>
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
                // Map request to database
                Product product = mapper.Map<Product>(request);
                product.Code = request.Code ?? GenerateProductCode();

                if (request.Images != null && request.Images.Any())
                {
                    product.Images = request.Images.Select(x => new ProductImage
                    {
                        Url = x.Url ?? string.Empty,
                        IsPrimary = x.IsPrimary ?? false,
                        SortOrder = x.SortOrder ?? 0,
                    }).ToList();
                }

                productSqlRepository.Add(product);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();
                return Result<int>.Success(product.Id);
            }
            catch (Exception)
            {
                transaction.Rollback();
                throw;
            }
        }

        private string GenerateProductCode()
        {
            string random = Random.Shared.Next(100000, 999999).ToString();
            string dateNowStr = DateTimeHelper.VietnamNowString("HHmmss");
            return $"PRO{random}{dateNowStr}";
        }
    }
}
