using _66SMS.Application.DTOs.ProductImages;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.CatalogService.Products.Queries.GetDetailProduct
{
    /// <summary>
    /// Handler for <see cref="GetDetailProductQuery"/>
    /// </summary>
    public class GetDetailProductHandler : IRequestHandler<GetDetailProductQuery, Result<ProductFullDto>>
    {
        private readonly IProductSqlRepository productSqlRepository;

        public GetDetailProductHandler(IProductSqlRepository productSqlRepository)
        {
            this.productSqlRepository = productSqlRepository;
        }

        public async Task<Result<ProductFullDto>> Handle(GetDetailProductQuery request, CancellationToken cancellationToken)
        {
            ProductFullDto? productDto = await productSqlRepository
                .AsQueryable(true)
                .Where(x => x.Id == request.Id && x.Status != (int)StatusActiveEnum.DELETED)
                .Select(x => new ProductFullDto
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
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt,
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
                return Result<ProductFullDto>.NotFound(ProductConst.MSG_PRODUCT_ID_NOT_FOUND, ErrorCodes.ERR_PRODUCT_NOT_FOUND);
            }

            return Result<ProductFullDto>.Success(productDto);
        }
    }
}
