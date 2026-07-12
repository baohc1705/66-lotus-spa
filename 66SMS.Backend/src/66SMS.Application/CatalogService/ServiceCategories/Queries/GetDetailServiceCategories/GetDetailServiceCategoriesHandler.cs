using _66SMS.Application.DTOs.ServiceCategories;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CatalogService.ServiceCategories.Queries.GetDetailServiceCategories
{
    /// <summary>
    /// Handler for <see cref="GetDetailServiceCategoriesQuery"/>
    /// </summary>
    public class GetDetailServiceCategoriesHandler : IRequestHandler<GetDetailServiceCategoriesQuery, Result<ServiceCategoryDto>>
    {
        private readonly IServiceCategorySqlRepository serviceCategorySqlRepository;

        public GetDetailServiceCategoriesHandler(IServiceCategorySqlRepository serviceCategorySqlRepository)
        {
            this.serviceCategorySqlRepository = serviceCategorySqlRepository;
        }

        public async Task<Result<ServiceCategoryDto>> Handle(GetDetailServiceCategoriesQuery request, CancellationToken cancellationToken)
        {
            ServiceCategoryDto? service = await serviceCategorySqlRepository
                .AsQueryable()
                .Where(x => x.Id == request.Id && x.Status != ServiceCategoryConst.STATUS_DELETED)
                .Select(x => new ServiceCategoryDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    SortOrder = x.SortOrder,
                    Status = x.Status,
                    CreatedAt = null,
                    UpdatedAt = null
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (service == null)
            {
                return Result<ServiceCategoryDto>.NotFound(ServiceCategoryConst.MSG_SERVICE_CATEGORY_NOT_FOUND, ErrorCodes.ERR_SERVICE_CATEGORY_NOT_FOUND);
            }

            return Result<ServiceCategoryDto>.Success(service);
        }
    }
}
