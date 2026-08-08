using _66SMS.Contract.Extensions;  
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Enums;
using MediatR;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.CatalogService.Products.Queries.GetAllProducts
{
    public class GetAllProductHandler : IRequestHandler<GetAllProductQuery, Result<PagedResult<ProductDto>>>
    {
        private readonly IProductSqlRepository productSqlRepository;

        public GetAllProductHandler(IProductSqlRepository productSqlRepository)
        {
            this.productSqlRepository = productSqlRepository;
        }

        public async Task<Result<PagedResult<ProductDto>>> Handle(GetAllProductQuery request, CancellationToken cancellationToken)
        {
            var query = productSqlRepository.AsQueryable();

            if (request.CategoryId.HasValue)
            {
                query = query.Where(x => x.CategoryId == request.CategoryId);
            }

            if (!string.IsNullOrEmpty(request.Keyword))
            {
                var keywordLower = request.Keyword.ToLower();
                query = query.Where(x => x.Name.ToLower().Contains(keywordLower) || x.Code.ToLower().Contains(keywordLower));
            }

            if (request.IsDeleted)
            {
                query = query.Where(x => x.Status == (int)StatusActiveEnum.DELETED);
            }
            else
            {
                query = query.Where(x => x.Status != (int)StatusActiveEnum.DELETED);
            }

            if (request.Status.HasValue)
            {
                query = query.Where(x => x.Status == request.Status);
            }

            if (request.MinPrice.HasValue)
            {
                query = query.Where(x => x.SellingPrice >= request.MinPrice.Value);
            }

            if (request.MaxPrice.HasValue)
            {
                query = query.Where(x => x.SellingPrice <= request.MaxPrice.Value);
            }

            query = request.OrderBy?.Trim().ToLower() switch
            {
                "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                "sellingprice" => request.IsDescending ? query.OrderByDescending(x => x.SellingPrice) : query.OrderBy(x => x.SellingPrice),
                "costprice" => request.IsDescending ? query.OrderByDescending(x => x.CostPrice) : query.OrderBy(x => x.CostPrice),
                "stockquantity" => request.IsDescending ? query.OrderByDescending(x => x.StockQuantity) : query.OrderBy(x => x.StockQuantity),
                "minstock" => request.IsDescending ? query.OrderByDescending(x => x.MinStock) : query.OrderBy(x => x.MinStock),
                _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt),
            };

            var result = await query
                .Select(x => new ProductDto
                {
                    Id = x.Id,
                    CategoryId = x.CategoryId,
                    CategoryName = x.Category!.Name,
                    Code = x.Code,
                    Name = x.Name,
                    Unit = x.Unit,
                    CostPrice = x.CostPrice,
                    SellingPrice = x.SellingPrice,
                    StockQuantity = x.StockQuantity,
                    MinStock = x.MinStock,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt,
                    ImageUrl = x.Images!.Where(x => x.IsPrimary).Select(x => x.Url).FirstOrDefault(),
                })
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<ProductDto>>.Success(result);
        }
    }
}
