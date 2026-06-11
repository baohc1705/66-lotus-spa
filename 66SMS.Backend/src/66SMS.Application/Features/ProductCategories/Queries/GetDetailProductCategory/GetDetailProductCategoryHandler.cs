using _66SMS.Application.DTOs.ProductCategories;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.ProductCategories.Queries.GetDetailProductCategory
{
    public class GetDetailProductCategoryHandler : IRequestHandler<GetDetailProductCategoryQuery, Result<ProductCategoryDto>>
    {
        private readonly IProductCategorySqlRepository productCategorySqlRepository;
        private readonly IMapper mapper;

        public GetDetailProductCategoryHandler(IProductCategorySqlRepository productCategorySqlRepository, IMapper mapper)
        {
            this.productCategorySqlRepository = productCategorySqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<ProductCategoryDto>> Handle(GetDetailProductCategoryQuery request, CancellationToken cancellationToken)
        {
            ProductCategoryDto? productCategoryDto = await productCategorySqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id)
                .ProjectTo<ProductCategoryDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (productCategoryDto == null)
            {
                return Result<ProductCategoryDto>.NotFound("Product category not found.", ErrorCodes.ERR_PRODUCT_CATEGORY_NOT_FOUND);
            }

            return Result<ProductCategoryDto>.Success(productCategoryDto);
        }
    }
}
