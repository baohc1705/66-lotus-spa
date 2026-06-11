using _66SMS.Application.DTOs.ServiceCategories;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;

namespace _66SMS.Application.Features.ServiceCategories.Queries.GetAllServiceCategories
{
    public class GetAllServiceCategoriesHandler : IRequestHandler<GetAllServiceCategoriesQuery, Result<PagedResult<ServiceCategoryDto>>>
    {
        private readonly IServiceCategorySqlRepository serviceCategorySqlRepository;
        private readonly IMapper mapper;

        public GetAllServiceCategoriesHandler(IServiceCategorySqlRepository serviceCategorySqlRepository, IMapper mapper)
        {
            this.serviceCategorySqlRepository = serviceCategorySqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<ServiceCategoryDto>>> Handle(GetAllServiceCategoriesQuery request, CancellationToken cancellationToken)
        {
            var query = serviceCategorySqlRepository.AsQueryable();

            PagedResult<ServiceCategoryDto> result = await query
                .ProjectTo<ServiceCategoryDto>(mapper.ConfigurationProvider)
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<ServiceCategoryDto>>.Success(result);
        }
    }
}
