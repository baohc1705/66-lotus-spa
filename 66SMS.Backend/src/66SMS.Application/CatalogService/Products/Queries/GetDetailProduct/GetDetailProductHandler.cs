using _66SMS.Application.DTOs.ProductImages;
using _66SMS.Application.DTOs.Products;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CatalogService.Products.Queries.GetDetailProduct
{
    /// <summary>
    /// Handler for <see cref="GetDetailProductQuery"/>
    /// </summary>
    public class GetDetailProductHandler : IRequestHandler<GetDetailProductQuery, Result<ProductDto>>
    {
        private readonly IProductSqlRepository productSqlRepository;

        public GetDetailProductHandler(IProductSqlRepository productSqlRepository)
        {
            this.productSqlRepository = productSqlRepository;
        }

        public async Task<Result<ProductDto>> Handle(GetDetailProductQuery request, CancellationToken cancellationToken)
        {
            ProductDto? productDto = await productSqlRepository
                .AsQueryable()
                .Where(x => x.Id == request.Id)
                .Select(x => new ProductDto
                {
                    Id = x.Id,
                    CategoryId = x.CategoryId,
                    CategoryName = x.Category!.Name,
                    Code = x.Code,
                    Name = x.Name,
                    Description = x.Description,
                    Content = x.Content,
                    Unit = x.Unit,
                    CostPrice = x.CostPrice,
                    SellingPrice = x.SellingPrice,
                    StockQuantity = x.StockQuantity,
                    MinStock = x.MinStock,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt.ToString(),
                    UpdatedAt = x.UpdatedAt.ToString(),
                    Images = x.Images!.Select(x => new ProductImageDto
                    {
                        Id = x.Id,
                        Url = x.Url,
                        SortOrder = x.SortOrder,
                        IsPrimary = x.IsPrimary
                    }).ToList(),
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (productDto == null)
            {
                return Result<ProductDto>.NotFound(ProductConst.MSG_PRODUCT_NOT_FOUND, ErrorCodes.ERR_PRODUCT_NOT_FOUND);
            }

            return Result<ProductDto>.Success(productDto);
        }
    }
}
