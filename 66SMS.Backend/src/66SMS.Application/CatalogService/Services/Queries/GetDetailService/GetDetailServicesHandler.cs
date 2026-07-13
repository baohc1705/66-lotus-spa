using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.CatalogService.Services.Queries.GetDetailService
{
    /// <summary>
    /// Handler for <see cref="GetDetailServicesQuery"/>
    /// </summary>
    public class GetDetailServicesHandler : IRequestHandler<GetDetailServicesQuery, Result<ServiceDetailDto>>
    {
        private readonly IServiceSqlRepository serviceSqlRepository;

        public GetDetailServicesHandler(IServiceSqlRepository serviceSqlRepository)
        {
            this.serviceSqlRepository = serviceSqlRepository;
        }

        public async Task<Result<ServiceDetailDto>> Handle(GetDetailServicesQuery request, CancellationToken cancellationToken)
        {
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
            return Result<ServiceDetailDto>.Success(entity);
        }
    }
}
