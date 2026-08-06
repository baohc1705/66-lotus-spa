using _66SMS.Application.DTOs;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CatalogService.Services.Queries.GetDetailService
{
    public class GetDetailServicesHandler : IRequestHandler<GetDetailServicesQuery, Result<ServiceDto>>
    {
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly ICacheService cacheService;

        public GetDetailServicesHandler(
            IServiceSqlRepository serviceSqlRepository,
            ICacheService cacheService)
        {
            this.serviceSqlRepository = serviceSqlRepository;
            this.cacheService = cacheService;
        }

        public async Task<Result<ServiceDto>> Handle(GetDetailServicesQuery request, CancellationToken cancellationToken)
        {
            var cacheKey = ServiceConst.CacheKeyDetail(request.Id);
            var cached = await cacheService.GetAsync<ServiceDto>(cacheKey, cancellationToken);
            if (cached is not null)
            {
                return Result<ServiceDto>.Success(cached);
            }

            var entity = await serviceSqlRepository
                .AsQueryable(true)
                .Where(x => x.Id == request.Id)
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
                    MinSellingPrice = x.MinSellingPrice,
                    CommissionRate = x.CommissionRate,
                    SortOrder = x.SortOrder,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt,
                    ImageUrl = x.ImageUrl,
                    ServiceProducts = x.ServiceProducts!.Select(sp => new ServiceProductResponse
                    {
                        Id = sp.Id,
                        ProductId = sp.ProductId,
                        ProductName = sp.Product!.Name,
                        UnitCost = sp.UnitCost,
                        QuantityUsed = sp.QuantityUsed,
                        Note = sp.Note,
                        Status = sp.Status
                    }).ToList()
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (entity == null)
            {
                return Result<ServiceDto>.NotFound(ServiceConst.MSG_SERVICE_NOT_FOUND, ErrorCodes.ERR_SERVICE_NOT_FOUND);
            }

            await cacheService.SetAsync(cacheKey, entity, ServiceConst.CACHE_TTL_DETAIL, cancellationToken);
            return Result<ServiceDto>.Success(entity);
        }
    }
}
