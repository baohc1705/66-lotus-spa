using _66SMS.Application.DTOs.Services;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CatalogService.Services.Queries.GetDetailService
{
    /// <summary>
    /// Handler for <see cref="GetDetailServicesQuery"/>
    /// </summary>
    public class GetDetailServicesHandler : IRequestHandler<GetDetailServicesQuery, Result<ServiceDto>>
    {
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly IMapper mapper;

        public GetDetailServicesHandler(IServiceSqlRepository serviceSqlRepository, IMapper mapper)
        {
            this.serviceSqlRepository = serviceSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<ServiceDto>> Handle(GetDetailServicesQuery request, CancellationToken cancellationToken)
        {
            var entity = await serviceSqlRepository
                .AsQueryable()
                .Where(x => x.Id == request.Id && x.Status != ServiceConst.STATUS_DELETED)
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
                    UpdatedAt = null,
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
                .FirstOrDefaultAsync(cancellationToken);

            if (entity == null)
            {
                return Result<ServiceDto>.NotFound(ServiceConst.MSG_SERVICE_NOT_FOUND, ErrorCodes.ERR_SERVICE_NOT_FOUND);
            }

            ServiceDto dto = mapper.Map<ServiceDto>(entity);
            return Result<ServiceDto>.Success(dto);
        }
    }
}
