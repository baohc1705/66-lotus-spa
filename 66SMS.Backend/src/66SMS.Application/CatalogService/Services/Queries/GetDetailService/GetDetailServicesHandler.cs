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
    public class GetDetailServicesHandler : IRequestHandler<GetDetailServicesQuery, Result<ServiceDetailDto>>
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

        public async Task<Result<ServiceDetailDto>> Handle(GetDetailServicesQuery request, CancellationToken cancellationToken)
        {
            var cacheKey = ServiceConst.CacheKeyDetail(request.Id);
            var cached = await cacheService.GetAsync<ServiceDetailDto>(cacheKey, cancellationToken);
            if (cached is not null)
            {
                return Result<ServiceDetailDto>.Success(cached);
            }

            var entity = await serviceSqlRepository
                .AsQueryable(true)
                .Where(x => x.Id == request.Id)
                .Select(x => new ServiceDetailDto
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
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt,
                    ImageUrl = x.ImageUrl,
                    ServiceProducts = x.ServiceProducts!.Select(sp => new ServiceProductResponse
                    {
                        Id = sp.Id,
                        ProductId = sp.ProductId,
                        ProductName = sp.Product!.Name,
                        SellingPrice = sp.Product.SellingPrice,
                        QuantityUsed = sp.QuantityUsed,
                        Note = sp.Note,
                        Status = sp.Status,
                    }).ToList()
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (entity == null)
            {
                return Result<ServiceDetailDto>.NotFound(ServiceConst.MSG_SERVICE_NOT_FOUND, ErrorCodes.ERR_SERVICE_NOT_FOUND);
            }

            await cacheService.SetAsync(cacheKey, entity, ServiceConst.CACHE_TTL_DETAIL, cancellationToken);
            return Result<ServiceDetailDto>.Success(entity);
        }
    }
}
