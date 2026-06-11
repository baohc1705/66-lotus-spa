using _66SMS.Application.DTOs.ServiceCategories;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.Features.ServiceCategories.Queries.GetServiceCategories
{
    public class GetServiceCategoriesHandler : IRequestHandler<GetServiceCategoriesQuery, Result<ServiceCategoryDto>>
    {
        private readonly IServiceCategorySqlRepository serviceCategorySqlRepository;
        private readonly IMapper mapper;

        public GetServiceCategoriesHandler(IServiceCategorySqlRepository serviceCategorySqlRepository, IMapper mapper)
        {
            this.serviceCategorySqlRepository = serviceCategorySqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<ServiceCategoryDto>> Handle(GetServiceCategoriesQuery request, CancellationToken cancellationToken)
        {
            ServiceCategory? entity = await serviceCategorySqlRepository.FindByIdAsync(request.Id);
            if (entity == null)
            {
                return Result<ServiceCategoryDto>.NotFound("Service category not found", ErrorCodes.ERR_SERVICE_CATEGORY_NOT_FOUND);
            }

            ServiceCategoryDto dto = mapper.Map<ServiceCategoryDto>(entity);
            return Result<ServiceCategoryDto>.Success(dto);
        }
    }
}
