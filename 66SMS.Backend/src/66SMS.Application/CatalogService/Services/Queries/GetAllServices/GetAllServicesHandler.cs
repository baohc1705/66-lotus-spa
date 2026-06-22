using _66SMS.Application.DTOs.Services;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.CatalogService.Services.Queries.GetAllServices
{
    public class GetAllServicesHandler : IRequestHandler<GetAllServicesQuery, Result<PagedResult<ServiceDto>>>
    {
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly IMapper mapper;

        public GetAllServicesHandler(IServiceSqlRepository serviceSqlRepository, IMapper mapper)
        {
            this.serviceSqlRepository = serviceSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<ServiceDto>>> Handle(GetAllServicesQuery request, CancellationToken cancellationToken)
        {
            var query = serviceSqlRepository.AsQueryable();
            // Filter here
            if (request.CategoryId.HasValue)
            {
                query = query.Where(x => x.CategoryId == request.CategoryId);
            }

            if (!string.IsNullOrEmpty(request.Keyword))
            {
                query = query.Where(x => x.Name.StartsWith(request.Keyword) || x.Code == request.Keyword);
            }

            if (!request.IsDeleted)
            {
                query = query.Where(x => x.Status != ServiceConst.STATUS_DELETED);
            }

            if (request.Status != null)
            {
                query = query.Where(x => x.Status == request.Status);
            }

            if (request.MinPrice.HasValue)
            {
                query = query.Where(x => x.SellingPrice >= request.MinPrice);
            }

            if (request.MaxPrice.HasValue)
            {
                query = query.Where(x => x.SellingPrice <= request.MinPrice);
            }

            // Order by
            query = request.OrderBy?.ToLower() switch
            {
                "code" => request.IsDescending ? query.OrderByDescending(x => x.Code) : query.OrderBy(x => x.Code),
                "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                "category" => request.IsDescending ? query.OrderByDescending(x => x.CategoryId) : query.OrderBy(x => x.CategoryId),
                _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt),
            };

            PagedResult<ServiceDto> pagedResult = await query
                .Select(x => new ServiceDto
                {
                    Id = x.Id,
                    CategoryId = x.CategoryId,
                    CategoryName = x.Category!.Name,
                    Code = x.Code,
                    Name = x.Name,
                    Description = x.Description,
                    Content = x.Content,
                    DurationMins = x.DurationMins,
                    CostPrice = x.CostPrice,
                    SellingPrice = x.SellingPrice,
                    CommissionRate = x.CommissionRate,
                    SortOrder = x.SortOrder,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt.ToString(),
                    UpdatedAt = x.UpdatedAt.ToString(),
                    ImageUrl = x.Images!.Where(x => x.IsPrimary).Select(x => x.Url).FirstOrDefault(),
                    Images = x.Images!.Select(x => new ServiceImageResponse
                    {
                        Id = x.Id,
                        Url = x.Url,
                        SortOrder = x.SortOrder,
                        IsPrimary = x.IsPrimary,
                    }).ToList(),
                    ServiceProducts = x.ServiceProducts!.Select(x => new ServiceProductResponse
                    {
                        Id = x.Id,
                        ProductId = x.ProductId,
                        ProductName = x.Product!.Name,
                        SellingPrice = x.Product.SellingPrice,
                        QuantityUsed = x.QuantityUsed,
                        Note = x.Note,
                        Status = x.Status,
                    }).ToList()

                })
                .ToPagedAsync(request, cancellationToken);
            return Result<PagedResult<ServiceDto>>.Success(pagedResult);
        }
    }
}